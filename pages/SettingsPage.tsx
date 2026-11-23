import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/LocaleContext';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { SettingItem } from '../components/SettingItem';
import { ToggleSwitch } from '../components/ToggleSwitch';
import InfoModal from '../components/InfoModal';

type ModalContent = {
  title: string;
  content: React.ReactNode;
} | null;

type PermissionName = 'camera' | 'microphone' | 'notifications';

type PermissionState = 'granted' | 'denied' | 'prompt' | 'checking';

const PermissionButton: React.FC<{
    status: PermissionState;
    onClick: () => void;
    t: (key: string) => string;
}> = ({ status, onClick, t }) => {
    const baseClasses = "px-4 py-1.5 text-sm font-semibold rounded-full transition-colors disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap";
    const statusMap: Record<PermissionState, { text: string; classes: string; }> = {
        'granted': { text: t('settings.permissionGranted'), classes: "bg-green-600 text-white" },
        'denied': { text: t('settings.permissionDenied'), classes: "bg-red-600 text-white" },
        'prompt': { text: t('settings.permissionGrant'), classes: "bg-blue-600 hover:bg-blue-700 text-white" },
        'checking': { text: t('settings.permissionChecking'), classes: "bg-gray-400 text-white" }
    };
    const { text, classes } = statusMap[status];
    return (
        <button type="button" onClick={onClick} className={`${baseClasses} ${classes}`} disabled={status === 'checking' || status === 'granted' || status === 'denied'}>
            {text}
        </button>
    );
};

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const {
    voiceOptionsEnabled,
    setVoiceOptionsEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useSettings();
  const { isAuthenticated, location, updateLocation } = useAuth();
  const [locationDraft, setLocationDraft] = useState(location || '');
  const [locationSavedToast, setLocationSavedToast] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>(null);
  
  const [permissionStatus, setPermissionStatus] = useState<Record<PermissionName, PermissionState>>({
      camera: 'checking',
      microphone: 'checking',
      notifications: 'checking'
  });

  useEffect(() => {
    setLocationDraft(location || '');
  }, [location]);

  useEffect(() => {
    const queryPermissions = async () => {
        const statuses: Record<PermissionName, PermissionState> = {} as any;
        const permissionNames: PermissionName[] = ['camera', 'microphone'];
        for (const name of permissionNames) {
            try {
                if (navigator.permissions) {
                    const result = await navigator.permissions.query({ name: name as any });
                    statuses[name] = result.state;
                } else {
                    statuses[name] = 'prompt';
                }
            } catch {
                statuses[name] = 'prompt';
            }
        }
        
        if ('Notification' in window) {
            const permission = Notification.permission;
            statuses.notifications = permission === 'default' ? 'prompt' : permission;
        } else {
            statuses.notifications = 'denied';
        }
        
        setPermissionStatus(statuses);
    };
    queryPermissions();
  }, []);

  const handleRequest = async (name: PermissionName) => {
    setPermissionStatus(prev => ({...prev, [name]: 'checking'}));
    try {
        let newState: PermissionState = 'denied';
        if (name === 'camera') {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            newState = 'granted';
        } else if (name === 'microphone') {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            newState = 'granted';
        } else if (name === 'notifications' && 'Notification' in window) {
            const result = await Notification.requestPermission();
            newState = result === 'default' ? 'prompt' : result;
            if (result === 'granted') {
              setNotificationsEnabled(true);
            }
        }
        setPermissionStatus(prev => ({...prev, [name]: newState}));
    } catch {
        setPermissionStatus(prev => ({...prev, [name]: 'denied'}));
    }
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (enabled && 'Notification' in window && Notification.permission === 'default') {
      await handleRequest('notifications');
    }
    setNotificationsEnabled(enabled);
  };

  const handleLocationSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationDraft.trim()) return;
    updateLocation(locationDraft);
    setLocationSavedToast(true);
    setTimeout(() => setLocationSavedToast(false), 2500);
  };

  const getModalContent = (type: 'about' | 'help' | 'privacy' | 'contact'): ModalContent => {
    switch (type) {
      case 'about':
        return {
          title: t('settings.about'),
          content: <p>LexiLaw AI is a global judicial assistant designed to provide preliminary legal information and guidance across jurisdictions. It helps individuals understand their rights, relevant official portals, nearby legal counsel options, and applicable case precedents.</p>
        };
      case 'help':
        return {
          title: t('settings.help'),
          content: (
            <div className="space-y-4">
              <p><strong>How to use LexiLaw AI:</strong></p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Select your country and preferred language on the home page.</li>
                <li>Describe your legal issue, attach a document or photo, scan with your camera, or dictate using voice input.</li>
                <li>Review the structured response including step-by-step guidance, official portals, lawyer recommendations, and similar case precedents, or enable Internet Search for live grounded answers.</li>
                <li>Ask follow-up questions in the same thread, export consultations as Markdown, or save conversations for later access.</li>
              </ol>
            </div>
          )
        };
      case 'privacy':
        return {
          title: t('settings.privacy'),
          content: (
            <div className="space-y-4">
               <p>Your privacy is paramount. Queries are processed transiently to generate responses and are not retained on our servers.</p>
               <p>Saved conversations and profile preferences are stored locally in your browser storage (localStorage). Clearing your browser data will permanently delete locally saved conversations.</p>
               <p>If you choose to sign in with your city or country, that location is used solely to tailor nearby court and lawyer recommendations.</p>
            </div>
          )
        };
      case 'contact':
        return {
          title: t('settings.contact'),
          content: (
            <div className="space-y-3">
              <p>For support, legal portal corrections, or accessibility inquiries, contact our team at <strong>support@lexilaw-ai.com</strong>.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">For urgent legal emergencies or active court deadlines, please contact local law enforcement or a licensed attorney in your jurisdiction directly.</p>
            </div>
          )
        };
      default:
        return null;
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-2 sm:p-4 animate-fade-in">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">{t('settings.title')}</h1>

        <div className="space-y-10">
          {isAuthenticated && (
            <section>
              <h2 className="text-xl font-semibold border-b border-gray-300 dark:border-slate-700 pb-2 mb-4 text-gray-800 dark:text-gray-200">{t('settings.profileSection')}</h2>
              <form onSubmit={handleLocationSave} className="flex flex-col sm:flex-row sm:items-end gap-3 py-2">
                <div className="flex-1">
                  <label htmlFor="settings-location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('settings.locationLabel')}
                  </label>
                  <input
                    id="settings-location"
                    type="text"
                    value={locationDraft}
                    onChange={(e) => setLocationDraft(e.target.value)}
                    placeholder={t('login.locationPlaceholder')}
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-2 px-3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!locationDraft.trim() || locationDraft.trim() === location}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
                >
                  {t('settings.locationSave')}
                </button>
              </form>
              {locationSavedToast && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">{t('settings.locationSaved')}</p>
              )}
            </section>
          )}

          {/* Appearance Section */}
          <section>
            <h2 className="text-xl font-semibold border-b border-gray-300 dark:border-slate-700 pb-2 mb-4 text-gray-800 dark:text-gray-200">{t('settings.appearance')}</h2>
            <SettingItem
              title={t('settings.theme')}
              description={t('settings.themeDescription')}
            >
              <ToggleSwitch
                labelOn="Dark"
                labelOff="Light"
                isChecked={theme === 'dark'}
                onChange={toggleTheme}
              />
            </SettingItem>
          </section>

          {/* General Section */}
          <section>
            <h2 className="text-xl font-semibold border-b border-gray-300 dark:border-slate-700 pb-2 mb-4 text-gray-800 dark:text-gray-200">{t('settings.general')}</h2>
            <SettingItem
              title={t('settings.voiceOptions')}
              description={t('settings.voiceDescription')}
            >
              <ToggleSwitch isChecked={voiceOptionsEnabled} onChange={setVoiceOptionsEnabled} />
            </SettingItem>
            <SettingItem
              title={t('settings.notifications')}
              description={t('settings.notificationsDescription')}
            >
              <ToggleSwitch isChecked={notificationsEnabled} onChange={handleNotificationsToggle} />
            </SettingItem>
          </section>

          {/* Permissions Section */}
           <section>
            <h2 className="text-xl font-semibold border-b border-gray-300 dark:border-slate-700 pb-2 mb-4 text-gray-800 dark:text-gray-200">{t('settings.permissions')}</h2>
             <SettingItem title={t('settings.microphone')} description={t('settings.microphoneDescription')}>
                <PermissionButton status={permissionStatus.microphone} onClick={() => handleRequest('microphone')} t={t} />
             </SettingItem>
             <SettingItem title={t('settings.camera')} description={t('settings.cameraDescription')}>
                <PermissionButton status={permissionStatus.camera} onClick={() => handleRequest('camera')} t={t} />
             </SettingItem>
             <SettingItem title={t('settings.notifications')} description={t('settings.notificationsDescription')}>
                <PermissionButton status={permissionStatus.notifications} onClick={() => handleRequest('notifications')} t={t} />
             </SettingItem>
          </section>

          {/* Support Section */}
          <section>
            <h2 className="text-xl font-semibold border-b border-gray-300 dark:border-slate-700 pb-2 mb-4 text-gray-800 dark:text-gray-200">{t('settings.support')}</h2>
            <div className="divide-y divide-gray-200 dark:divide-slate-800">
              <button type="button" onClick={() => setModalContent(getModalContent('about'))} className="text-left w-full p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700/50 transition-colors">{t('settings.about')}</button>
              <button type="button" onClick={() => setModalContent(getModalContent('help'))} className="text-left w-full p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700/50 transition-colors">{t('settings.help')}</button>
              <button type="button" onClick={() => setModalContent(getModalContent('privacy'))} className="text-left w-full p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700/50 transition-colors">{t('settings.privacy')}</button>
              <button type="button" onClick={() => setModalContent(getModalContent('contact'))} className="text-left w-full p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700/50 transition-colors">{t('settings.contact')}</button>
            </div>
          </section>
        </div>
      </div>
      <InfoModal
        isOpen={!!modalContent}
        onClose={() => setModalContent(null)}
        title={modalContent?.title || ''}
      >
        {modalContent?.content}
      </InfoModal>
    </>
  );
};

export default SettingsPage;