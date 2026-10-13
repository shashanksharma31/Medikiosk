import React from 'react';
import { Volume2, Sparkles, ArrowRight } from 'lucide-react';
import { Language } from './types.ts';
import { SUPPORTED_LANGUAGES, getTranslation } from './languages.ts';
import { KioskSpeechEngine } from './speechUtils.ts';

interface LanguageSelectViewProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  onContinue: () => void;
}

export const LanguageSelectView: React.FC<LanguageSelectViewProps> = ({
  currentLanguage,
  onSelectLanguage,
  onContinue,
}) => {
  const handleLanguageClick = (lang: Language) => {
    onSelectLanguage(lang);
    const greetings: Record<string, string> = {
      en: 'Welcome to MediKiosk. Please proceed to check-in.',
      hi: 'मेडीकियोस्क में आपका स्वागत है। कृपया आगे बढ़ें।',
      ta: 'மெடிகியோஸ்க்கிற்கு வரவேற்கிறோம். தொடரவும்.',
      te: 'మెడికియోస్క్‌కు స్వాగతం. దయచేసి కొనసాగించండి.',
      bn: 'মেডিকিয়স্কে স্বাগতম। অনুগ্রহ করে এগিয়ে যান।',
      mr: 'मेडीकियोस्क मध्ये आपले स्वागत आहे. कृपया पुढे जा.',
      gu: 'મેડીકિયોસ્ક માં આપનું સ્વાગત છે. આગળ વધો.',
      kn: 'ಮೆಡಿಕಿಯೋಸ್ಕ್‌ಗೆ ಸುಸ್ವಾಗತ. ದಯವಿಟ್ಟು ಮುಂದುವರಿಯಿರಿ.',
      ml: 'മെഡിക്കിയോസ്കിലേക്ക് സ്വാഗതം. ദയവായി തുടരുക.',
      pa: 'ਮੈਡੀਕਿਓਸਕ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ। ਕਿਰਪਾ ਕਰਕੇ ਅੱਗੇ ਵਧੋ।',
    };
    KioskSpeechEngine.speak(greetings[lang.code] || greetings.en, lang.voiceLangCode);
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col justify-between p-4 sm:p-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold shadow-xs">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Ayushman Bharat Digital Health Intake Kiosk</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {getTranslation(currentLanguage.code, 'selectLanguage')}
        </h1>
        <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto">
          {getTranslation(currentLanguage.code, 'selectLanguageSub')}
        </p>
      </div>

      {/* Language Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4 my-8">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = currentLanguage.code === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleLanguageClick(lang)}
              className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer relative group ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/70 shadow-md scale-102 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs'
              }`}
            >
              <span className="text-3xl sm:text-4xl mb-2">{lang.flag}</span>
              <span className="text-lg font-bold text-slate-800">{lang.nativeName}</span>
              <span className="text-xs text-slate-500 font-medium">{lang.name}</span>

              {isSelected && (
                <div className="absolute top-2 right-2 text-blue-600">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Proceed Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
        <div className="text-sm text-slate-500 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Touch card to hear pronunciation & select language</span>
        </div>

        <button
          onClick={onContinue}
          className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2.5 transition-all text-base cursor-pointer hover:translate-x-0.5"
        >
          <span>{getTranslation(currentLanguage.code, 'startIntake')}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
