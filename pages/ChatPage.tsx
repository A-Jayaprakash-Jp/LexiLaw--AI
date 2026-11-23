import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { type Message, type AIResponse, type Conversation } from '../types';
import { ChatMessage, LoadingAIMessage } from '../components/ChatMessage';
import {
  getLegalAdvice,
  serializeMessagesToHistory,
  streamLegalAdvice,
  translateResponse,
} from '../services/geminiService';
import { saveConversation, getConversationById } from '../services/storageService';
import ConfirmationModal from '../components/ConfirmationModal';
import { CameraCaptureModal } from '../components/CameraCaptureModal';
import { useTranslation } from '../context/LocaleContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { LANGUAGES } from '../constants';
import { ToggleSwitch } from '../components/ToggleSwitch';
import {
  MAX_ATTACHMENT_BYTES,
  exportConversationToMarkdown,
  isSupportedAttachment,
} from '../utils/legalHelpers';

interface ChatPageProps {
  conversation: Partial<Conversation> | null;
  onNavigateBack: () => void;
  country: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ conversation, onNavigateBack, country }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(conversation?.id);
  const [isSaved, setIsSaved] = useState(!!conversation?.id);
  
  const [attachedFile, setAttachedFile] = useState<Message['file'] | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useInternet, setUseInternet] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const initialInteractionSent = useRef(false);
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;
  
  const { t, locale } = useTranslation();
  const { voiceOptionsEnabled, notificationsEnabled } = useSettings();
  const { location } = useAuth();
  const currentLang = useMemo(() => LANGUAGES.find(l => l.code === locale) || LANGUAGES[0], [locale]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speechRecognitionRef.current = null;
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = currentLang.speechCode;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setInput(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    speechRecognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [currentLang]);

  const handleMicClick = () => {
    const recognition = speechRecognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setInput('');
      recognition.start();
      setIsListening(true);
    }
  };

  const notifyIfBackground = useCallback(() => {
    if (
      notificationsEnabled &&
      typeof document !== 'undefined' &&
      document.hidden &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification('LexiLaw AI', {
        body: 'Your legal guidance response is ready.',
        icon: '/icons/icon.svg',
      });
    }
  }, [notificationsEnabled]);
  
  const handleSendMessage = useCallback(async (query: string, file?: Message['file']) => {
    if ((!query.trim() && !file) || isLoading) return;

    setError(null);
    const history = serializeMessagesToHistory(messagesRef.current);
    const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: query, file };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setLoadingMessage(t('chat.thinking'));
    setInput('');
    setAttachedFile(undefined);
    setIsSaved(false);

    const streamingMessageId = `ai-${Date.now()}`;

    try {
      const countryCode = country;

      if (useInternet) {
        let createdStreamingBubble = false;
        const result = await streamLegalAdvice(
          {
            query,
            countryCode,
            location: location || undefined,
            file,
            useInternet: true,
            history,
          },
          {
            onChunk: (fullText) => {
              if (!createdStreamingBubble) {
                createdStreamingBubble = true;
                setIsLoading(false);
                setMessages(prev => [
                  ...prev,
                  { id: streamingMessageId, role: 'ai', content: fullText },
                ]);
              } else {
                setMessages(prev =>
                  prev.map(m =>
                    m.id === streamingMessageId ? { ...m, content: fullText } : m
                  )
                );
              }
            },
          }
        );

        setMessages(prev => {
          const exists = prev.some(m => m.id === streamingMessageId);
          if (!exists) {
            return [
              ...prev,
              {
                id: streamingMessageId,
                role: 'ai',
                content: result.text,
                groundingMetadata: result.groundingMetadata,
              },
            ];
          }
          return prev.map(m =>
            m.id === streamingMessageId
              ? { ...m, content: result.text, groundingMetadata: result.groundingMetadata }
              : m
          );
        });
        notifyIfBackground();
      } else {
        const geminiResponse = await getLegalAdvice(
          query,
          countryCode,
          location || undefined,
          file,
          false,
          history
        );
        const { text: aiResponseText, candidates } = geminiResponse;
        const groundingMetadata = candidates?.[0]?.groundingMetadata;

        let parsedResponse: AIResponse = JSON.parse(aiResponseText);
        if (locale !== 'en' && currentLang) {
          setLoadingMessage(t('chat.translating', { language: currentLang.name }));
          parsedResponse = await translateResponse(parsedResponse, currentLang.englishName);
        }

        const aiMessage: Message = {
          id: streamingMessageId,
          role: 'ai',
          content: parsedResponse,
          groundingMetadata,
        };
        setMessages(prev => [...prev, aiMessage]);
        notifyIfBackground();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`${t('chat.errorPrefix')} ${errorMessage}`);
      const aiErrorMessage: Message = {
        id: `ai-error-${Date.now()}`,
        role: 'ai',
        content: t('chat.errorMessage', { errorMessage }),
      };
      setMessages(prev => [
        ...prev.filter(m => m.id !== streamingMessageId),
        aiErrorMessage,
      ]);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [isLoading, country, t, locale, currentLang, location, useInternet, notifyIfBackground]);

  useEffect(() => {
    if (conversation?.id) {
        const loadedConversation = getConversationById(conversation.id);
        if (loadedConversation) {
            setMessages(loadedConversation.messages);
            setConversationId(loadedConversation.id);
            setIsSaved(true);
        }
    } else if (!initialInteractionSent.current && (conversation?.initialPrompt || conversation?.initialFile)) {
        initialInteractionSent.current = true;
        handleSendMessage(conversation.initialPrompt || '', conversation.initialFile);
    }
  }, [conversation, handleSendMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
    }
    handleSendMessage(input, attachedFile);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setError(null);
    if (!file) return;

    const mimeType = file.type || (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.csv') ? 'text/plain' : 'application/octet-stream');

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setError(t('chat.fileTooLarge'));
      return;
    }
    if (!isSupportedAttachment(mimeType)) {
      setError(t('chat.unsupportedFile'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const [, data] = dataUrl.split(',');
      if (data) {
        setAttachedFile({ name: file.name, type: mimeType, data });
      }
    };
    reader.readAsDataURL(file);
  };

  const getConversationTitle = useCallback(() => {
    const firstUserMessage = messages.find(m => m.role === 'user')?.content;
    return typeof firstUserMessage === 'string' && firstUserMessage.trim()
      ? firstUserMessage.trim().substring(0, 48) + (firstUserMessage.trim().length > 48 ? '...' : '')
      : t('chat.defaultTitle');
  }, [messages, t]);

  const handleSave = () => {
    if (messages.length === 0) return;
    const newConversation: Conversation = {
        id: conversationId || `conv-${Date.now()}`,
        title: getConversationTitle(),
        messages,
        country: country,
        timestamp: Date.now()
    };
    saveConversation(newConversation);
    setConversationId(newConversation.id);
    setIsSaved(true);
    setSaveToast(t('chat.saveSuccessAlert'));
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleExport = () => {
    if (messages.length === 0) return;
    exportConversationToMarkdown(getConversationTitle(), country, messages);
  };

  const handleBack = () => {
    if (!isSaved && messages.length > 0) {
        setShowSaveConfirm(true);
    } else {
        onNavigateBack();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <button type="button" onClick={handleBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            {t('chat.backButton')}
        </button>

        <div className="flex items-center gap-2">
          {saveToast && (
            <span className="text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-800 px-3 py-1.5 rounded-md">
              {saveToast}
            </span>
          )}
          <button
            type="button"
            onClick={handleExport}
            disabled={messages.length === 0}
            className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 font-medium px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            {t('chat.exportChat')}
          </button>
          <button type="button" onClick={handleSave} disabled={isSaved || messages.length === 0} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {isSaved ? t('chat.savedButton') : t('chat.saveButton')}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-4 -mr-4 space-y-6 mb-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <LoadingAIMessage message={loadingMessage} />}
        {error && <p className="text-red-700 dark:text-red-300 text-center mt-2 p-2.5 bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-lg text-sm">{error}</p>}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                  }
              }}
              placeholder={t('chat.inputPlaceholder')}
              className={`w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-3 pl-24 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none ${voiceOptionsEnabled ? 'pr-28' : 'pr-16'}`}
              rows={attachedFile ? 3 : 1}
              disabled={isLoading}
            />
            {attachedFile && (
                <div className="absolute bottom-2 left-24 p-1.5 bg-blue-100 dark:bg-slate-700 rounded-lg text-xs flex items-center gap-2">
                    <span className="truncate max-w-xs">{attachedFile.name}</span>
                    <button type="button" onClick={() => setAttachedFile(undefined)} className="text-red-500 hover:text-red-700" aria-label="Remove attachment">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf,text/plain,.txt,.md,.csv" />
            <div className="absolute left-2 top-2 flex items-center">
              <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="p-2 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                  aria-label={t('chat.attachAriaLabel')}
                  title={t('chat.attachAriaLabel')}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3.375 3.375 0 1 1 18.374 9.5l-7.693 7.693a1.125 1.125 0 0 1-1.59-1.59l7.692-7.693a2.25 2.25 0 0 0-3.182-3.182L4.5 12.74a6.75 6.75 0 0 0 9.546 9.546l7.693-7.693Z" /></svg>
              </button>
              <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  disabled={isLoading}
                  className="p-2 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                  aria-label={t('chat.cameraAriaLabel')}
                  title={t('chat.cameraAriaLabel')}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>
              </button>
            </div>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
            {voiceOptionsEnabled && (
              <button
                type="button"
                onClick={handleMicClick}
                disabled={!speechRecognitionRef.current || isLoading}
                title={!speechRecognitionRef.current ? t('chat.voiceUnsupported') : t('chat.micAriaLabel')}
                className={`p-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isListening ? 'bg-red-600 text-white animate-pulse' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
                aria-label={t('chat.micAriaLabel')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 0 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !attachedFile)}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-full p-2.5 transition ml-1"
              aria-label={t('chat.sendAriaLabel')}
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
              </svg>
            </button>
          </div>
        </form>
         <div className="flex justify-between items-center mt-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
                 <ToggleSwitch 
                    isChecked={useInternet}
                    onChange={setUseInternet}
                 />
                 <span className="text-xs text-gray-600 dark:text-gray-400">{t('chat.internetToggle')}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-500 text-center flex items-center justify-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                {t('chat.securityNotice')}
            </p>
         </div>
      </div>

      <ConfirmationModal
        isOpen={showSaveConfirm}
        title={t('modals.save.title')}
        message={t('modals.save.message')}
        onConfirm={() => {
            handleSave();
            setShowSaveConfirm(false);
            onNavigateBack();
        }}
        onCancel={() => {
            setShowSaveConfirm(false);
            onNavigateBack();
        }}
        onClose={() => setShowSaveConfirm(false)}
      />

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(capturedFile) => {
          setError(null);
          setAttachedFile(capturedFile);
        }}
      />
    </div>
  );
};

export default ChatPage;