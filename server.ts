import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { COUNTRIES } from './constants.ts';
import type { AIResponse, ChatHistoryTurn, Message } from './types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    legalCategory: {
      type: Type.STRING,
      description:
        "The legal category of the user's problem (e.g., Civil, Criminal, Cyber, Family, Labor, Land, etc.). If an image/document is provided, analyze it and use its content to determine the category.",
    },
    guidance: {
      type: Type.ARRAY,
      description:
        "Step-by-step guidance to address the issue within the user's country's legal system. If an image/document is provided, base the steps on the specifics of the document.",
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.INTEGER },
          description: { type: Type.STRING },
        },
        required: ['step', 'description'],
      },
    },
    portals: {
      type: Type.ARRAY,
      description:
        'List of official legal bodies or government web portals where the user can register a complaint or seek redressal.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          url: { type: Type.STRING },
        },
        required: ['name', 'url'],
      },
    },
    lawyerRecommendations: {
      type: Type.ARRAY,
      description:
        'A list of real, verifiable lawyers or law firms specializing in the relevant field. If location is provided, they MUST be near the user. Include contact info or website if available.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          specialization: { type: Type.STRING },
          rating: { type: Type.NUMBER, description: 'Rating out of 5' },
          successRate: { type: Type.STRING },
          reviews: { type: Type.STRING },
          contact: { type: Type.STRING, description: 'Email, Phone, or Website' },
        },
        required: ['name', 'specialization'],
      },
    },
    precedents: {
      type: Type.ARRAY,
      description:
        "Reference to similar, real, citable previous judgments or legal precedents. Must be real cases relevant to the user's situation and country.",
      items: {
        type: Type.OBJECT,
        properties: {
          caseName: { type: Type.STRING },
          summary: {
            type: Type.STRING,
            description: 'A brief, easy-to-understand summary of the case and its outcome.',
          },
        },
        required: ['caseName', 'summary'],
      },
    },
    rightsSummary: {
      type: Type.STRING,
      description:
        "A summarized explanation of related laws and the user's rights in simple, empathetic, and layman's terms. This should be the core of the answer, explained clearly. If an image/document is provided, summarize its content and explain what it means legally.",
    },
  },
  required: [
    'legalCategory',
    'guidance',
    'portals',
    'lawyerRecommendations',
    'precedents',
    'rightsSummary',
  ],
};

function getSystemInstruction(
  countryName: string,
  location?: string,
  useInternet?: boolean
): string {
  const locationInfo = location
    ? `The user has provided their location as: '${location}'. Use this location to find *nearby* lawyers, law firms, and courts.`
    : 'The user has not shared their location. Provide general recommendations for lawyers that are accessible online or nationally.';

  const internetInstruction = useInternet
    ? "You MUST use your Google Search tool to find the most current and relevant information to answer the user's query. Provide a comprehensive, well-structured response in Markdown format. Always cite your sources."
    : 'You MUST provide your response as a JSON object that conforms to the provided schema.';

  const fileInstruction =
    "If the user has uploaded a file (image or document), you must analyze its content as a primary part of the query. The file's content is critical context. Base your entire response on the information in the file combined with the user's text prompt.";

  return `You are LexiLaw AI, an expert judicial assistant specializing in the laws of **${countryName}**. Your tone must be empathetic, professional, and reassuring.

**Data Privacy Mandate:** User inputs are strictly confidential. You MUST NOT store, log, share, or use this information for any purpose other than generating the immediate, one-time response. Forget the information immediately after the response is generated.

${internetInstruction}
${fileInstruction}
${locationInfo}

**Core Directives for ${countryName}'s Law:**
1.  **Cite Specific Laws:** Refer to specific sections of relevant codes, acts, and regulations for ${countryName}.
2.  **Be Practical and Actionable:** Focus on concrete, realistic steps a person can take within the legal system of ${countryName}. Mention specific forms, government departments, and procedures relevant to that country.
3.  **Real Lawyer Recommendations:** Recommendations MUST be for real, verifiable legal professionals or firms. If location is provided, they MUST be near the user. If not, suggest nationally recognized firms or online services. Provide contact information (website, phone) where possible.
4.  **Verifiable Precedents:** The 'precedents' must be real, citable court cases from courts in ${countryName} that are directly relevant. Explain their relevance clearly.
5.  **Reference Official Portals:** The 'portals' must be official government websites or legal bodies for ${countryName}. Always provide full https:// URLs.
6.  **Explain Simply:** Use layman's terms. The 'rightsSummary' should be so clear that an average citizen of ${countryName} can understand their situation and rights without a legal background.
7.  **Be Empathetic:** Acknowledge the user's stress. Start the 'rightsSummary' with an understanding tone.

If the issue is outside legal boundaries, politely clarify that in the 'rightsSummary'.
DO NOT include any legal disclaimers in your JSON output if you are providing one. The UI will handle that.
`;
}

function isSupportedMimeType(mimeType: string): boolean {
  return (
    mimeType.startsWith('image/') ||
    mimeType === 'application/pdf' ||
    mimeType.startsWith('text/')
  );
}

interface ParsedAdviceInput {
  contents: Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }>;
  }>;
  systemInstruction: string;
  enableInternet: boolean;
}

function parseAdviceRequest(body: Record<string, unknown>): ParsedAdviceInput {
  const { query, countryCode, location, file, useInternet, history } = body ?? {};

  const queryText = typeof query === 'string' ? query : '';
  if (query !== undefined && typeof query !== 'string') {
    throw Object.assign(new Error('Invalid query parameter.'), { status: 400 });
  }
  if (typeof countryCode !== 'string' || !countryCode.trim()) {
    throw Object.assign(new Error('Valid countryCode is required.'), { status: 400 });
  }
  if (location !== undefined && location !== null && typeof location !== 'string') {
    throw Object.assign(new Error('Invalid location parameter.'), { status: 400 });
  }

  let validatedFile: Message['file'] | undefined;
  if (file !== undefined && file !== null) {
    const f = file as Record<string, unknown>;
    if (
      typeof f !== 'object' ||
      typeof f.type !== 'string' ||
      !f.type ||
      typeof f.data !== 'string' ||
      !f.data
    ) {
      throw Object.assign(new Error('Invalid file attachment.'), { status: 400 });
    }
    if (!isSupportedMimeType(f.type)) {
      throw Object.assign(
        new Error('Unsupported file format. Please attach an image, PDF, or plain text file.'),
        { status: 400 }
      );
    }
    validatedFile = {
      name: typeof f.name === 'string' ? f.name : 'attachment',
      type: f.type,
      data: f.data,
    };
  }

  if (!queryText.trim() && !validatedFile) {
    throw Object.assign(new Error('A query or attached file is required.'), { status: 400 });
  }

  const countryName =
    COUNTRIES.find((c) => c.code === countryCode)?.name || countryCode;
  const enableInternet = Boolean(useInternet);
  const resolvedLocation = typeof location === 'string' && location.trim() ? location.trim() : undefined;
  const systemInstruction = getSystemInstruction(
    countryName,
    resolvedLocation,
    enableInternet
  );

  const contents: ParsedAdviceInput['contents'] = [];

  if (Array.isArray(history)) {
    const recentHistory = (history as ChatHistoryTurn[]).slice(-10);
    for (const turn of recentHistory) {
      if (
        turn &&
        (turn.role === 'user' || turn.role === 'model') &&
        typeof turn.text === 'string' &&
        turn.text.trim()
      ) {
        contents.push({
          role: turn.role,
          parts: [{ text: turn.text }],
        });
      }
    }
  }

  const currentParts: Array<
    { text: string } | { inlineData: { mimeType: string; data: string } }
  > = [
    {
      text: `User's Country: ${countryName}. User's legal problem: "${queryText || 'Please analyze the attached document.'}"`,
    },
  ];

  if (validatedFile) {
    currentParts.push({
      inlineData: {
        mimeType: validatedFile.type,
        data: validatedFile.data,
      },
    });
  }

  contents.push({
    role: 'user',
    parts: currentParts,
  });

  return {
    contents,
    systemInstruction,
    enableInternet,
  };
}

function formatGeminiError(error: unknown): { status: number; message: string } {
  if (error instanceof Error) {
    const maybeStatus = (error as Error & { status?: number }).status;
    if (maybeStatus === 400) {
      return { status: 400, message: error.message };
    }
    if (error.message.includes('candidate.finish_reason: 5')) {
      return {
        status: 400,
        message: 'The response was blocked due to the safety policy. Please rephrase your query.',
      };
    }
    if (error.message.includes('400')) {
      return {
        status: 400,
        message:
          'There was an issue with the request sent to the AI (Bad Request). This can happen if the attached file is too large or of an unsupported type.',
      };
    }
    return { status: 500, message: `Gemini API Error: ${error.message}` };
  }
  return {
    status: 500,
    message: 'An unknown error occurred while contacting the AI service.',
  };
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '25mb' }));

  app.post('/api/gemini/legal-advice', async (req: Request, res: Response) => {
    try {
      const { contents, systemInstruction, enableInternet } = parseAdviceRequest(req.body ?? {});

      const config: Record<string, unknown> = { systemInstruction };
      if (enableInternet) {
        config.tools = [{ googleSearch: {} }];
      } else {
        config.responseMimeType = 'application/json';
        config.responseSchema = responseSchema;
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config,
      });

      if (!response.text) {
        res.status(502).json({ error: 'Received an empty response from the AI.' });
        return;
      }

      res.json({
        text: response.text,
        candidates: response.candidates ?? [],
      });
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      const { status, message } = formatGeminiError(error);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/gemini/legal-advice-stream', async (req: Request, res: Response) => {
    let closed = false;
    req.on('close', () => {
      closed = true;
    });

    try {
      const { contents, systemInstruction, enableInternet } = parseAdviceRequest(req.body ?? {});

      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const config: Record<string, unknown> = { systemInstruction };
      if (enableInternet) {
        config.tools = [{ googleSearch: {} }];
      } else {
        config.responseMimeType = 'application/json';
        config.responseSchema = responseSchema;
      }

      const ai = getAiClient();
      const stream = await ai.models.generateContentStream({
        model: 'gemini-4-hydrogen',
        contents,
        config,
      });

      let latestGroundingMetadata: unknown = undefined;

      for await (const chunk of stream) {
        if (closed) break;
        const text = chunk.text ?? '';
        const chunkGrounding = chunk.candidates?.[0]?.groundingMetadata;
        if (chunkGrounding) {
          latestGroundingMetadata = chunkGrounding;
        }
        if (text) {
          res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
        }
      }

      if (!closed) {
        res.write(
          `data: ${JSON.stringify({ type: 'done', groundingMetadata: latestGroundingMetadata })}\n\n`
        );
        res.end();
      }
    } catch (error) {
      console.error('Error streaming Gemini API:', error);
      const { message } = formatGeminiError(error);
      if (!res.headersSent) {
        res.status(400).json({ error: message });
        return;
      }
      if (!closed) {
        res.write(`data: ${JSON.stringify({ type: 'error', error: message })}\n\n`);
        res.end();
      }
    }
  });

  app.post('/api/gemini/suggestions', async (req: Request, res: Response) => {
    try {
      const { partialQuery, countryName } = req.body ?? {};
      if (typeof partialQuery !== 'string' || partialQuery.trim().length < 3) {
        res.json({ suggestions: [] });
        return;
      }

      const resolvedCountry =
        typeof countryName === 'string' && countryName.trim()
          ? countryName
          : 'the selected country';

      const systemInstruction = `You are a helpful assistant for a legal AI app. Your task is to provide concise, relevant search query suggestions based on a user's partial input.
The user is interested in the laws of ${resolvedCountry}.
The user has typed: "${partialQuery}".
Provide 3 to 5 clear and actionable suggestions.
Return your response as a JSON array of strings. Do not include any other text, explanations, or markdown formatting. The output must be a valid JSON array of strings.`;

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `User partial query: "${partialQuery}"`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
              description: 'A single search query suggestion.',
            },
          },
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const jsonStr = (response.text ?? '').trim();
      if (!jsonStr) {
        res.json({ suggestions: [] });
        return;
      }

      const suggestions = JSON.parse(jsonStr);
      res.json({
        suggestions: Array.isArray(suggestions)
          ? suggestions.map((s) => String(s))
          : [],
      });
    } catch (error) {
      console.error('Error fetching query suggestions:', error);
      res.json({ suggestions: [] });
    }
  });

  app.post('/api/gemini/translate', async (req: Request, res: Response) => {
    const { responseObject, targetLanguage } = req.body ?? {};
    if (
      !responseObject ||
      typeof responseObject !== 'object' ||
      typeof targetLanguage !== 'string' ||
      !targetLanguage.trim()
    ) {
      res.status(400).json({ error: 'Invalid translation request.' });
      return;
    }

    try {
      const systemInstruction = `You are a translation expert. Your task is to translate the user-facing text in a JSON object to **${targetLanguage}**.
- You MUST maintain the original JSON structure, keys, and data types.
- You MUST NOT translate URLs or contact information (emails/phone numbers).
- You SHOULD translate the following fields: 'legalCategory', 'rightsSummary'.
- Inside the 'guidance' array, translate the 'description' for each step.
- Inside the 'portals' array, translate the 'name' of the portal if it's a generic description (e.g., "National Consumer Helpline"), but DO NOT translate it if it's a proper name (e.g., "Supreme Court of India Portal"). Use your best judgment.
- Inside 'lawyerRecommendations', translate 'specialization' and 'reviews'. DO NOT translate 'name' or 'contact'.
- Inside 'precedents', translate the 'summary'. DO NOT translate 'caseName' as it's a legal citation.
- Your entire output MUST be a single, valid JSON object conforming to the provided schema. Do not add any extra text, explanations, or markdown formatting.`;

      const contentToTranslate = JSON.stringify(responseObject, null, 2);

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Translate the text in this JSON to ${targetLanguage}:\n\n${contentToTranslate}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      if (response.text) {
        const parsedResponse: AIResponse = JSON.parse(response.text);
        res.json({ translated: parsedResponse });
      } else {
        console.warn('Translation response was empty, returning original object.');
        res.json({ translated: responseObject });
      }
    } catch (error) {
      console.error(
        'Error translating response with Gemini API, returning original object:',
        error
      );
      res.json({ translated: responseObject });
    }
  });

  app.use((err: Error & { status?: number; type?: string }, req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/')) {
      const status = err.status || (err.type === 'entity.too.large' ? 413 : 400);
      res.status(status).json({
        error:
          status === 413
            ? 'The attached file is too large. Please upload a smaller file.'
            : err.message || 'Invalid request.',
      });
      return;
    }
    next(err);
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
