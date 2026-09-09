import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../utils/i18n';
import { API_BASE_URL } from '../utils/constants';

interface AuthContextType {
  user: User | null;
  token: string | null;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  login: (email: string, password: string, org?: string) => Promise<boolean>;
  logout: () => void;
  t: (key: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('voiceshield_user');
      return saved ? JSON.parse(saved) : {
        id: "user-emp-001",
        email: "employee@demo.com",
        full_name: "Priya Sharma (Operations Officer)",
        role: "EMPLOYEE",
        organization_id: "org-demo-001"
      };
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('voiceshield_token') || 'demo-active-token';
  });

  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('voiceshield_lang') as SupportedLanguage) || 'en';
  });

  const handleSetLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
    localStorage.setItem('voiceshield_lang', lang);
  };

  const login = async (email: string, password: string, org: string = "demo.com"): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, organization: org }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.access_token);
        localStorage.setItem('voiceshield_token', data.access_token);
        localStorage.setItem('voiceshield_user', JSON.stringify(data.user));
        return true;
      }
    } catch {
      // Offline demo fallback
    }

    if (email === "employee@demo.com" && password === "VoiceShieldDemo#2026") {
      const demoUser: User = {
        id: "user-emp-001",
        email: "employee@demo.com",
        full_name: "Priya Sharma (Operations Officer)",
        role: "EMPLOYEE",
        organization_id: "org-demo-001"
      };
      setUser(demoUser);
      setToken("offline-demo-token");
      localStorage.setItem('voiceshield_token', "offline-demo-token");
      localStorage.setItem('voiceshield_user', JSON.stringify(demoUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('voiceshield_token');
    localStorage.removeItem('voiceshield_user');
  };

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    return langDict[key] || TRANSLATIONS['en'][key] || key;
  };

  return (
    <AuthContext.Provider value={{ user, token, language, setLanguage: handleSetLanguage, login, logout, t }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
