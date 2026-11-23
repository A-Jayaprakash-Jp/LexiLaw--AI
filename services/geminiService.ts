import { type AIResponse, type ChatHistoryTurn, type Message } from "../types";

export interface LegalAdviceResponse {
    text: string;
    candidates?: Array<{
        groundingMetadata?: any;
    }>;
}

export const serializeMessagesToHistory = (messages: Message[]): ChatHistoryTurn[] => {
    return messages
        .filter((msg) => !msg.id.startsWith('ai-error-'))
        .map((msg): ChatHistoryTurn | null => {
            if (msg.role === 'user') {
                const text = typeof msg.content === 'string' ? msg.content : '';
                if (!text && msg.file) {
                    return { role: 'user', text: `[Attached file: ${msg.file.name}]` };
                }
                return text ? { role: 'user', text } : null;
            }
            if (typeof msg.content === 'string') {
                return msg.content ? { role: 'model', text: msg.content } : null;
            }
            return {
                role: 'model',
                text: `Category: ${msg.content.legalCategory}\nSummary: ${msg.content.rightsSummary}`,
            };
        })
        .filter((item): item is ChatHistoryTurn => item !== null);
};

export const getLegalAdvice = async (
    query: string,
    countryCode: string,
    location?: string,
    file?: Message['file'],
    useInternet?: boolean,
    history?: ChatHistoryTurn[]
): Promise<LegalAdviceResponse> => {
    const response = await fetch('/api/gemini/legal-advice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query,
            countryCode,
            location,
            file,
            useInternet,
            history,
        }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || 'An unknown error occurred while contacting the AI service.');
    }

    if (!data.text) {
        throw new Error('Received an empty response from the AI.');
    }

    return data as LegalAdviceResponse;
};

export const streamLegalAdvice = async (
    params: {
        query: string;
        countryCode: string;
        location?: string;
        file?: Message['file'];
        useInternet?: boolean;
        history?: ChatHistoryTurn[];
    },
    callbacks: {
        onChunk: (fullText: string) => void;
    }
): Promise<{ text: string; groundingMetadata?: any }> => {
    const response = await fetch('/api/gemini/legal-advice-stream', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'An unknown error occurred while contacting the AI service.');
    }

    if (!response.body) {
        throw new Error('Streaming is not supported in this browser.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let accumulatedText = '';
    let groundingMetadata: any = undefined;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const eventBlock of events) {
            const lines = eventBlock.split('\n');
            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const jsonStr = line.slice(6).trim();
                if (!jsonStr) continue;
                const payload = JSON.parse(jsonStr);
                if (payload.type === 'error') {
                    throw new Error(payload.error || 'Streaming failed.');
                }
                if (payload.type === 'chunk' && typeof payload.text === 'string') {
                    accumulatedText += payload.text;
                    callbacks.onChunk(accumulatedText);
                }
                if (payload.type === 'done') {
                    groundingMetadata = payload.groundingMetadata;
                }
            }
        }
    }

    if (!accumulatedText) {
        throw new Error('Received an empty response from the AI.');
    }

    return { text: accumulatedText, groundingMetadata };
};

export const getQuerySuggestions = async (partialQuery: string, countryName: string): Promise<string[]> => {
    if (!partialQuery || partialQuery.trim().length < 3) {
        return [];
    }

    try {
        const response = await fetch('/api/gemini/suggestions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                partialQuery,
                countryName,
            }),
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return Array.isArray(data.suggestions) ? data.suggestions.map((s: unknown) => String(s)) : [];
    } catch (error) {
        console.error('Error fetching query suggestions:', error);
        return [];
    }
};

export const translateResponse = async (
    responseObject: AIResponse,
    targetLanguage: string
): Promise<AIResponse> => {
    try {
        const response = await fetch('/api/gemini/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                responseObject,
                targetLanguage,
            }),
        });

        if (!response.ok) {
            return responseObject;
        }

        const data = await response.json();
        return data.translated || responseObject;
    } catch (error) {
        console.error('Error translating response, returning original object:', error);
        return responseObject;
    }
};