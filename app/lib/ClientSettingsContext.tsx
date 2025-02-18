import React, {createContext, type ReactNode, useContext, useEffect, useState} from 'react';

interface ClientSettingsContextType {
  settings: ClientSettings
  updateSettings: (value: Partial<ClientSettings>) => void
}

interface ClientSettings {
  defaultSlotDuration: number
}

const defaultSettings: ClientSettings = {defaultSlotDuration: 20}

const ClientSettingsContext = createContext<ClientSettingsContextType | undefined>(undefined);

const ClientSettingsProvider: React.FC<{ children: ReactNode }> = ({children}) => {
  const [settings, setSettings] = useState<ClientSettings>(defaultSettings);

  useEffect(() => {
    const storedSettings = localStorage.getItem('settings');
    if (storedSettings) {
      console.log('settings loaded from localStorage', settings)
      setSettings(JSON.parse(storedSettings))
    }
  }, [])


  function updateSettings(value: Partial<ClientSettings>) {
    const newSettings = {...settings, ...value}
    setSettings(newSettings)
    localStorage.setItem('settings', JSON.stringify(settings))
  }

  return (
      <ClientSettingsContext.Provider value={{settings, updateSettings}}>
        {children}
      </ClientSettingsContext.Provider>
  );
};


function useClientSettings() {
  const context = useContext(ClientSettingsContext);
  if (!context) {
    throw new Error('useClientSettings must be used within a ClientSettingsProvider');
  }
  return context;
}


export {ClientSettingsContext, ClientSettingsProvider, useClientSettings};
