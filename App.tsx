import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import SavedConversationsPage from './pages/SavedConversationsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { type Conversation, type Message } from './types';

export type Page = 'home' | 'chat' | 'saved' | 'settings' | 'login';

const COUNTRY_STORAGE_KEY = 'lexilaw_country';

const App: React.FC = () => {
    const [country, setCountry] = useState<string>(() => {
        if (typeof window === 'undefined') return 'IN';
        try {
            return localStorage.getItem(COUNTRY_STORAGE_KEY) || 'IN';
        } catch {
            return 'IN';
        }
    });
    const [activePage, setActivePage] = useState<Page>('home');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const [currentConversation, setCurrentConversation] = useState<Partial<Conversation> | null>(null);

    useEffect(() => {
        try {
            localStorage.setItem(COUNTRY_STORAGE_KEY, country);
        } catch {
            // ignore storage errors
        }
    }, [country]);

    const navigateTo = (page: Page) => {
        setActivePage(page);
        setSidebarOpen(false);
    };

    const handleNewChat = (prompt?: string, file?: Message['file']) => {
        setCurrentConversation({
            initialPrompt: prompt,
            initialFile: file,
            country: country,
        });
        navigateTo('chat');
    };

    const loadConversation = (conversation: Conversation) => {
        setCurrentConversation(conversation);
        setCountry(conversation.country);
        navigateTo('chat');
    };

    const renderPage = () => {
        switch (activePage) {
            case 'home':
                return (
                    <HomePage
                        country={country}
                        onCountryChange={setCountry}
                        onNewChat={handleNewChat}
                    />
                );
            case 'chat':
                return (
                    <ChatPage
                        key={currentConversation?.id || 'new'}
                        conversation={currentConversation}
                        onNavigateBack={() => navigateTo('home')}
                        country={country}
                    />
                );
            case 'saved':
                return <SavedConversationsPage onLoadConversation={loadConversation} />;
            case 'settings':
                return <SettingsPage />;
            case 'login':
                return <LoginPage onLoginSuccess={() => navigateTo('home')} />;
            default:
                return (
                    <HomePage
                        country={country}
                        onCountryChange={setCountry}
                        onNewChat={handleNewChat}
                    />
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-gray-200">
            <Sidebar activePage={activePage} onNavigate={navigateTo} isOpen={isSidebarOpen} setOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setSidebarOpen(!isSidebarOpen)} page={activePage} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default App;