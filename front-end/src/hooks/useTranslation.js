'use client'

import { useLanguage } from "@/context/LanguageContext"
import { useEffect, useState } from "react";
import en from "../../public/locales/en/common.json"
import fr from "../../public/locales/fr/common.json"

export function useTranslation() {
    const { language } = useLanguage();
    const [translations, setTranslations] = useState(en);

    useEffect(() => {
        switch (language) {
            case 'fr':
                setTranslations(fr);
                break;
            case 'en':
            default:
                setTranslations(en);
                break;
        }
    }, [language]);

    const getTranslation = (key) => {
        return translations[key] || key;
    };

    return { t: getTranslation };
}