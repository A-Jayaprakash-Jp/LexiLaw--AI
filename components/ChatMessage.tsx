import React, { useEffect, useMemo, useState } from 'react';
import { type Message, type AIResponse, type Lawyer, type Portal, type Precedent } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { useTranslation } from '../context/LocaleContext';
import { useSettings } from '../context/SettingsContext';
import { LANGUAGES } from '../constants';
import { Logo } from './Logo';
import { formatAIResponseAsPlainText, safeExternalUrl } from '../utils/legalHelpers';

const isAIResponse = (content: any): content is AIResponse => {
  return typeof content === 'object' && content !== null && 'legalCategory' in content;
};

const renderInlineMarkdown = (text: string): React.ReactNode[] => {
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={idx} className="font-semibold text-gray-900 dark:text-gray-100">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-xs font-mono text-gray-800 dark:text-gray-200">
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const safeHref = safeExternalUrl(linkMatch[2]);
      if (safeHref) {
        return (
          <a
            key={idx}
            href={safeHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return <span key={idx}>{linkMatch[1]}</span>;
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
};

const MarkdownContent: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: { ordered: boolean; items: string[] } | null = null;

  const flushList = (keyPrefix: string) => {
    if (!listItems) return;
    if (listItems.ordered) {
      elements.push(
        <ol key={`${keyPrefix}-ol`} className="list-decimal list-inside space-y-1.5 my-3 text-gray-700 dark:text-gray-300">
          {listItems.items.map((item, i) => (
            <li key={i}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>
      );
    } else {
      elements.push(
        <ul key={`${keyPrefix}-ul`} className="list-disc list-inside space-y-1.5 my-3 text-gray-700 dark:text-gray-300">
          {listItems.items.map((item, i) => (
            <li key={i}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
    }
    listItems = null;
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(`empty-${index}`);
      return;
    }

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      flushList(`h-${index}`);
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      if (level === 1 || level === 2) {
        elements.push(
          <h3 key={index} className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-4 mb-2">
            {renderInlineMarkdown(headingText)}
          </h3>
        );
      } else {
        elements.push(
          <h4 key={index} className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-3 mb-1.5">
            {renderInlineMarkdown(headingText)}
          </h4>
        );
      }
      return;
    }

    const ulMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (ulMatch) {
      if (listItems && listItems.ordered) flushList(`switch-ul-${index}`);
      if (!listItems) listItems = { ordered: false, items: [] };
      listItems.items.push(ulMatch[1]);
      return;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (listItems && !listItems.ordered) flushList(`switch-ol-${index}`);
      if (!listItems) listItems = { ordered: true, items: [] };
      listItems.items.push(olMatch[1]);
      return;
    }

    if (trimmed.startsWith('>')) {
      flushList(`bq-${index}`);
      elements.push(
        <blockquote key={index} className="my-2 pl-3 py-1 border-l-2 border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-400 italic">
          {renderInlineMarkdown(trimmed.replace(/^>\s*/, ''))}
        </blockquote>
      );
      return;
    }

    flushList(`p-${index}`);
    elements.push(
      <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed my-2">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });

  flushList('end');
  return <div className="space-y-1">{elements}</div>;
};

const LegalDisclaimer: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="mt-6 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200/90 bg-amber-500/10 dark:bg-amber-900/20 p-3 rounded-lg">
        <p className="font-semibold mb-1 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.852-1.21 3.488 0l6.236 11.824c.64 1.212-.243 2.72-1.744 2.72H3.765c-1.5 0-2.384-1.508-1.744-2.72L8.257 3.099zM9 13a1 1 0 112 0 1 1 0 01-2 0zm1-4a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {t('response.disclaimerTitle')}
        </p>
        <p>{t('response.disclaimerText')}</p>
        </div>
    );
};

const GroundingCitations: React.FC<{ metadata: any }> = ({ metadata }) => {
    const { t } = useTranslation();
    const citations = metadata?.groundingChunks;
    if (!citations || citations.length === 0) return null;

    const validCitations = citations.filter((c: any) => safeExternalUrl(c?.web?.uri));
    if (validCitations.length === 0) return null;

    return (
        <div className="mt-6 border-t border-gray-200 dark:border-slate-700 pt-3">
             <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{t('response.sourcesTitle')}</h4>
             <div className="flex flex-col gap-1.5">
                {validCitations.map((citation: any, index: number) => {
                    const safeHref = safeExternalUrl(citation.web.uri)!;
                    return (
                        <a
                            href={safeHref}
                            key={index}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate tabular-nums"
                        >
                            {index + 1}. {citation.web.title || new URL(safeHref).hostname}
                        </a>
                    );
                })}
             </div>
        </div>
    );
};

const AIResponseContent: React.FC<{ response: AIResponse, groundingMetadata?: any }> = ({ response, groundingMetadata }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">{response.legalCategory}</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{response.rightsSummary}</p>
            </div>

            {response.guidance && response.guidance.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-slate-700 pb-2 mb-3">{t('response.guidanceTitle')}</h3>
                    <ol className="space-y-3 text-gray-700 dark:text-gray-300">
                        {response.guidance.map(item => (
                            <li key={item.step} className="flex items-start gap-2.5">
                                <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">{item.step}.</span>
                                <span>{item.description}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
            
            {response.portals && response.portals.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-slate-700 pb-2 mb-3">{t('response.portalsTitle')}</h3>
                    <div className="space-y-2">
                        {response.portals.map((portal: Portal) => {
                            const safeHref = safeExternalUrl(portal.url);
                            if (!safeHref) {
                                return (
                                    <div key={portal.name} className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 p-3 rounded-lg text-gray-700 dark:text-gray-300">
                                        {portal.name}
                                    </div>
                                );
                            }
                            return (
                                <a href={safeHref} target="_blank" rel="noopener noreferrer" key={portal.name} className="flex items-center justify-between bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700/70 p-3 rounded-lg transition text-blue-600 dark:text-blue-300">
                                    <span>{portal.name}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 ml-2 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}

            {response.lawyerRecommendations && response.lawyerRecommendations.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-slate-700 pb-2 mb-3">{t('response.lawyersTitle')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {response.lawyerRecommendations.map((lawyer: Lawyer, index: number) => (
                            <div key={`${lawyer.name}-${index}`} className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 p-4 rounded-lg">
                                <h4 className="font-bold text-gray-900 dark:text-gray-100">{lawyer.name}</h4>
                                <p className="text-sm text-blue-600 dark:text-blue-300">{lawyer.specialization}</p>
                                {lawyer.contact && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words">{t('response.lawyerContact', { contact: lawyer.contact })}</p>}
                                {typeof lawyer.rating === 'number' && <p className="text-sm text-gray-600 dark:text-gray-400 tabular-nums">{t('response.lawyerRating', { rating: lawyer.rating })}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {response.precedents && response.precedents.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-slate-700 pb-2 mb-3">{t('response.precedentsTitle')}</h3>
                     <div className="space-y-3">
                        {response.precedents.map((precedent: Precedent, index: number) => (
                            <div key={`${precedent.caseName}-${index}`} className="bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                                <h4 className="font-bold text-gray-800 dark:text-gray-200">{precedent.caseName}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{precedent.summary}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <GroundingCitations metadata={groundingMetadata} />
            <LegalDisclaimer />
        </div>
    );
};

const FileAttachmentPreview: React.FC<{ file: Message['file'] }> = ({ file }) => {
    if (!file) return null;
    const isImage = file.type.startsWith('image/');
    return (
        <div className="mt-2 p-2 bg-blue-700/50 rounded-lg flex items-center gap-3">
             {isImage ? (
                <img src={`data:${file.type};base64,${file.data}`} alt={file.name} className="w-16 h-16 object-cover rounded" />
             ) : (
                <div className="w-12 h-12 bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
                </div>
             )}
             <span className="text-sm font-medium text-white truncate">{file.name}</span>
        </div>
    );
};

export const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const { t, locale } = useTranslation();
  const { voiceOptionsEnabled } = useSettings();
  const { role, content, file, groundingMetadata } = message;
  const isUser = role === 'user';

  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentLang = useMemo(
    () => LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0],
    [locale]
  );

  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    return () => {
      if (isSpeaking && speechSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking, speechSupported]);

  const handleCopy = async () => {
    try {
      const plain = formatAIResponseAsPlainText(content);
      await navigator.clipboard.writeText(plain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleToggleSpeak = () => {
    if (!speechSupported) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const text = formatAIResponseAsPlainText(content);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLang.speechCode;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-xl lg:max-w-2xl bg-blue-600 text-white p-4 rounded-lg rounded-br-none shadow-sm">
          {typeof content === 'string' ? <p className="whitespace-pre-wrap">{content}</p> : t('chat.invalidUserMessage')}
          <FileAttachmentPreview file={file} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-300 dark:border-slate-600">
         <Logo className="h-6 w-6"/>
      </div>
      <div className="flex-1 max-w-xl lg:max-w-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-5 rounded-lg rounded-bl-none shadow-sm">
        <div className="max-w-none">
            {isAIResponse(content) ? (
                <AIResponseContent response={content} groundingMetadata={groundingMetadata} />
            ) : (
                <>
                    <MarkdownContent text={String(content)} />
                    <GroundingCitations metadata={groundingMetadata} />
                    {!message.id.startsWith('ai-error-') && <LegalDisclaimer />}
                </>
            )}
        </div>

        {!message.id.startsWith('ai-error-') && (
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700/70 flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors whitespace-nowrap"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                    {copied ? t('chat.copied') : t('chat.copyResponse')}
                </button>
                {voiceOptionsEnabled && speechSupported && (
                    <button
                        type="button"
                        onClick={handleToggleSpeak}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                            isSpeaking
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                        </svg>
                        {isSpeaking ? t('chat.stopListening') : t('chat.listen')}
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export const LoadingAIMessage: React.FC<{ message?: string }> = ({ message }) => (
    <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
             <Logo className="h-6 w-6"/>
        </div>
        <div className="flex-1 max-w-xl lg:max-w-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-5 rounded-lg rounded-bl-none">
            <LoadingSpinner message={message} />
        </div>
    </div>
);