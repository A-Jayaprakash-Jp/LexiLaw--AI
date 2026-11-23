import { COUNTRIES } from '../constants';
import type { AIResponse, Message } from '../types';

export const MAX_ATTACHMENT_BYTES = 15 * 1024 * 1024; // 15 MB

export const safeExternalUrl = (rawUrl?: string): string | null => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
};

export const isSupportedAttachment = (mimeType: string): boolean => {
  return (
    mimeType.startsWith('image/') ||
    mimeType === 'application/pdf' ||
    mimeType.startsWith('text/')
  );
};

export const formatAIResponseAsPlainText = (content: string | AIResponse): string => {
  if (typeof content === 'string') return content;
  const sections: string[] = [
    `${content.legalCategory}`,
    content.rightsSummary,
  ];

  if (content.guidance?.length) {
    sections.push(
      'Step-by-Step Guidance:\n' +
        content.guidance.map((g) => `${g.step}. ${g.description}`).join('\n')
    );
  }
  if (content.portals?.length) {
    sections.push(
      'Relevant Portals:\n' +
        content.portals.map((p) => `- ${p.name}: ${p.url}`).join('\n')
    );
  }
  if (content.lawyerRecommendations?.length) {
    sections.push(
      'Lawyer Recommendations:\n' +
        content.lawyerRecommendations
          .map(
            (l) =>
              `- ${l.name} (${l.specialization})${l.contact ? ` — ${l.contact}` : ''}`
          )
          .join('\n')
    );
  }
  if (content.precedents?.length) {
    sections.push(
      'Similar Precedents:\n' +
        content.precedents.map((p) => `- ${p.caseName}: ${p.summary}`).join('\n')
    );
  }
  return sections.join('\n\n');
};

export const exportConversationToMarkdown = (
  title: string,
  countryCode: string,
  messages: Message[]
) => {
  const countryName =
    COUNTRIES.find((c) => c.code === countryCode)?.name || countryCode;
  const lines: string[] = [
    `# ${title}`,
    '',
    `Jurisdiction: ${countryName} | Exported: ${new Date().toLocaleString()}`,
    '',
    '---',
    '',
  ];

  for (const msg of messages) {
    if (msg.role === 'user') {
      lines.push('## User Inquiry');
      if (typeof msg.content === 'string' && msg.content.trim()) {
        lines.push(msg.content);
      }
      if (msg.file) {
        lines.push(`*Attached document: ${msg.file.name}*`);
      }
      lines.push('');
    } else {
      lines.push('## LexiLaw AI Response');
      if (typeof msg.content === 'string') {
        lines.push(msg.content);
      } else {
        const res = msg.content;
        lines.push(`### ${res.legalCategory}`);
        lines.push(res.rightsSummary);
        if (res.guidance?.length) {
          lines.push('');
          lines.push('#### Step-by-Step Guidance');
          for (const step of res.guidance) {
            lines.push(`${step.step}. ${step.description}`);
          }
        }
        if (res.portals?.length) {
          lines.push('');
          lines.push('#### Official Portals');
          for (const portal of res.portals) {
            lines.push(`- [${portal.name}](${portal.url})`);
          }
        }
        if (res.lawyerRecommendations?.length) {
          lines.push('');
          lines.push('#### Lawyer Recommendations');
          for (const lawyer of res.lawyerRecommendations) {
            lines.push(
              `- **${lawyer.name}** (${lawyer.specialization})${
                lawyer.contact ? ` — ${lawyer.contact}` : ''
              }`
            );
          }
        }
        if (res.precedents?.length) {
          lines.push('');
          lines.push('#### Legal Precedents');
          for (const prec of res.precedents) {
            lines.push(`- **${prec.caseName}**: ${prec.summary}`);
          }
        }
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  }

  lines.push(
    '> **Legal Disclaimer:** This information is for educational and advisory purposes only and does not constitute official legal advice.'
  );

  const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'lexilaw-consultation';
  a.href = url;
  a.download = `${safeSlug}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
