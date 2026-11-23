import React, { useState, useMemo, useEffect, useRef } from 'react';
import { QuickActionCard } from '../components/QuickActionCard';
import { SearchableSelector } from '../components/SearchableSelector';
import { COUNTRIES, QUICK_ACTIONS, getConstitutionAction, getFundamentalLawsAction, LANGUAGES } from '../constants';
import { LanguageSelector } from '../components/LanguageSelector';
import { useTranslation } from '../context/LocaleContext';
import { useSettings } from '../context/SettingsContext';
import { Logo } from '../components/Logo';
import { getQuerySuggestions } from '../services/geminiService';
import { useDebounce } from '../hooks/useDebounce';
import { type Message } from '../types';
import { CameraCaptureModal } from '../components/CameraCaptureModal';
import { MAX_ATTACHMENT_BYTES, isSupportedAttachment } from '../utils/legalHelpers';

interface HomePageProps {
  country: string;
  onCountryChange: (code: string) => void;
  onNewChat: (prompt?: string, file?: Message['file']) => void;
}

const HomePage: React.FC<HomePageProps> = ({ country, onCountryChange, onNewChat }) => {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<Message['file'] | undefined>(undefined);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  
  const { t, locale, setLocale } = useTranslation();
  const { voiceOptionsEnabled } = useSettings();
  const currentLang = useMemo(() => LANGUAGES.find(l => l.code === locale) || LANGUAGES[0], [locale]);
  const selectedCountryName = useMemo(() => COUNTRIES.find(c => c.code === country)?.name || 'the selected country', [country]);
  
  const debouncedInput = useDebounce(input, 500);

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

  useEffect(() => {
      let cancelled = false;
      if (debouncedInput.trim().length > 2) {
          setSuggestionsLoading(true);
          getQuerySuggestions(debouncedInput, selectedCountryName)
              .then(res => {
                  if (!cancelled) setSuggestions(res);
              })
              .finally(() => {
                  if (!cancelled) setSuggestionsLoading(false);
              });
      } else {
          setSuggestions([]);
      }
      return () => {
        cancelled = true;
      };
  }, [debouncedInput, selectedCountryName]);


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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setFileError(null);
    if (!file) return;

    const mimeType = file.type || (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.csv') ? 'text/plain' : 'application/octet-stream');

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setFileError(t('chat.fileTooLarge'));
      return;
    }
    if (!isSupportedAttachment(mimeType)) {
      setFileError(t('chat.unsupportedFile'));
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
  
  const allQuickActions = useMemo(() => {
    const staticActions = QUICK_ACTIONS.map(action => ({
      ...action,
      title: t(`quickActions.${action.key}.title`),
      prompt: t(`quickActions.${action.key}.prompt`),
    }));
  
    const constitutionAction = {
      ...getConstitutionAction(selectedCountryName),
      title: t('home.constitutionAction', { countryName: selectedCountryName }),
    };

    const fundamentalLawsAction = {
        ...getFundamentalLawsAction(selectedCountryName),
        title: t('home.fundamentalLawsAction', { countryName: selectedCountryName }),
    };
  
    return [...staticActions, constitutionAction, fundamentalLawsAction];
  }, [selectedCountryName, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) {
        speechRecognitionRef.current?.stop();
        setIsListening(false);
    }
    if (input.trim() || attachedFile) {
        onNewChat(input, attachedFile);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setSuggestions([]);
    onNewChat(suggestion);
  };

  return (
    <div className="max-w-4xl mx-auto text-center animate-fade-in">
        <div className="flex items-center justify-center my-8">
            <Logo className="h-24 w-24" />
        </div>

        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('home.welcome')}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{t('home.subtitle')}</p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
            <SearchableSelector
                options={COUNTRIES}
                value={country}
                onChange={onCountryChange}
                placeholder={t('home.selectCountry')}
            />
            <LanguageSelector
                selectedLanguage={locale}
                onLanguageChange={setLocale}
            />
        </div>
        
        <div className="relative max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSubmit} className="relative">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,application/pdf,text/plain,.txt,.md,.csv" />
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('home.inputPlaceholder')}
                    className={`w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-full py-3 pl-24 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${voiceOptionsEnabled ? 'pr-28' : 'pr-16'}`}
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                        aria-label={t('home.attachAriaLabel')}
                        title={t('home.attachAriaLabel')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3.375 3.375 0 1 1 18.374 9.5l-7.693 7.693a1.125 1.125 0 0 1-1.59-1.59l7.692-7.693a2.25 2.25 0 0 0-3.182-3.182L4.5 12.74a6.75 6.75 0 0 0 9.546 9.546l7.693-7.693Z" /></svg>
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        className="p-2 rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                        aria-label={t('chat.cameraAriaLabel')}
                        title={t('chat.cameraAriaLabel')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>
                    </button>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                    {voiceOptionsEnabled && (
                        <button
                            type="button"
                            onClick={handleMicClick}
                            disabled={!speechRecognitionRef.current}
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
                        disabled={!input.trim() && !attachedFile}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-full p-2.5 transition ml-1"
                        aria-label={t('home.startChat')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </form>

            {fileError && (
                <p className="mt-2 text-xs text-red-600 dark:text-red-400">{fileError}</p>
            )}

            {attachedFile && (
                <div className="mt-2 inline-flex p-2 bg-blue-100 dark:bg-slate-700 rounded-lg text-xs items-center gap-2 shadow-sm">
                    <span className="truncate max-w-xs font-medium text-gray-700 dark:text-gray-200">{attachedFile.name}</span>
                    <button type="button" onClick={() => setAttachedFile(undefined)} className="text-red-500 hover:text-red-700" aria-label="Remove attachment">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            )}
            
            {(suggestions.length > 0 || (suggestionsLoading && debouncedInput.trim().length > 2)) && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg z-10 text-left overflow-hidden">
                    {suggestionsLoading && <div className="p-3 text-sm text-gray-500 dark:text-gray-400">{t('home.suggestionsLoading')}</div>}
                    {!suggestionsLoading && suggestions.map((s, i) => (
                        <button 
                            type="button"
                            key={i} 
                            onClick={() => handleSuggestionClick(s)} 
                            className="block w-full text-left p-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">{t('home.quickActions')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {allQuickActions.map((action: any, index) => {
                if (action.url) {
                    return (
                        <a
                            key={`${action.title}-${index}`}
                            href={action.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-slate-700/80 hover:ring-2 hover:ring-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm flex items-center space-x-3"
                        >
                            <div className="text-blue-600 dark:text-blue-400 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52v16.5m-1.5-16.5v16.5m-1.5-16.5v16.5m-1.5-16.5v16.5m-1.5-16.5v16.5m-6.75-16.5v16.5m-1.5-16.5v16.5m-1.5-16.5v16.5m-1.5-16.5v16.5" /></svg>
                            </div>
                            <span className="font-semibold text-gray-800 dark:text-gray-300">{action.title}</span>
                        </a>
                    );
                }
                return (
                    <QuickActionCard 
                        key={`${action.title}-${index}`} 
                        title={action.title}
                        icon={action.icon}
                        onClick={() => action.prompt && onNewChat(action.prompt)} 
                    />
                );
            })}
        </div>

        <CameraCaptureModal
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={(capturedFile) => {
            setFileError(null);
            setAttachedFile(capturedFile);
          }}
        />
    </div>
  );
};

export default HomePage;