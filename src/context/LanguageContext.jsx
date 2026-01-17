import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'FR');

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.lang = language.toLowerCase();
        document.documentElement.dir = language === 'AR' ? 'rtl' : 'ltr';

        // Trigger Google Translate
        const translateElement = document.querySelector('.goog-te-combo');
        if (translateElement) {
            translateElement.value = language.toLowerCase();
            translateElement.dispatchEvent(new Event('change'));
        } else {
            // If the element is not ready yet, we try a more direct approach for Google Translate widget
            const googleWidget = document.querySelector('.goog-te-gadget-simple');
            if (googleWidget) {
                const innerSpan = Array.from(document.querySelectorAll('span')).find(el =>
                    el.textContent.includes('Select Language') || el.textContent.includes('Sélectionner')
                );
                if (innerSpan) innerSpan.click();
            }
        }
    }, [language]);

    const changeLanguage = (lang) => {
        setLanguage(lang);

        // Google Translate uses a specific cookie/dropdown system.
        // We set the cookie that Google Translate looks for.
        // Format: /fr/[lang_code]
        const langValue = lang.toLowerCase();
        document.cookie = `googtrans=/fr/${langValue}; path=/`;
        document.cookie = `googtrans=/fr/${langValue}; path=/; domain=${window.location.hostname}`;

        // Refresh page to force Google Translate to apply (it's the most reliable way)
        window.location.reload();
    };

    // Helper to protect text from being translated (like prices/numbers)
    const NoTranslate = ({ children, className = "" }) => (
        <span className={`notranslate ${className}`} translate="no">
            {children}
        </span>
    );

    // Fallback translation function for components still using it
    const t = (key) => {
        if (!key) return "";
        const parts = key.split('.');
        return parts[parts.length - 1];
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, NoTranslate, t }}>
            <div id="google_translate_element" style={{ display: 'none' }}></div>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
