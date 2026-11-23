import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface Settings {
    notificationsEnabled: boolean;
    voiceOptionsEnabled: boolean;
}

interface SettingsContextType extends Settings {
    setNotificationsEnabled: (enabled: boolean) => void;
    setVoiceOptionsEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getInitialSettings = (): Settings => {
    if (typeof window === 'undefined') {
        return { notificationsEnabled: false, voiceOptionsEnabled: true };
    }
    try {
        const storedSettings = localStorage.getItem('lexilaw_settings');
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            return {
                notificationsEnabled: parsed.notificationsEnabled ?? false,
                voiceOptionsEnabled: parsed.voiceOptionsEnabled ?? true,
            };
        }
    } catch (error) {
        console.error('Failed to load settings from localStorage', error);
    }
    return { notificationsEnabled: false, voiceOptionsEnabled: true };
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    useEffect(() => {
        try {
            localStorage.setItem('lexilaw_settings', JSON.stringify(settings));
        } catch (error) {
            console.error('Failed to save settings to localStorage', error);
        }
    }, [settings]);

    const setNotificationsEnabled = (enabled: boolean) => {
        setSettings(s => ({ ...s, notificationsEnabled: enabled }));
    };

    const setVoiceOptionsEnabled = (enabled: boolean) => {
        setSettings(s => ({ ...s, voiceOptionsEnabled: enabled }));
    };
    
    return (
        <SettingsContext.Provider value={{ ...settings, setNotificationsEnabled, setVoiceOptionsEnabled }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
