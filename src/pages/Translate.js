import { useState, useRef } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const Translate = () => {
    const [transcript, setTranscript] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [inputLanguage, setInputLanguage] = useState('en');
    const [outputLanguage, setOutputLanguage] = useState('es');
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef(null);
    const fullFinalTranscriptRef = useRef(''); // Track all finalized transcript
    const isTranscriptInOutputLanguage = useRef(false); // Track if transcript should be in output language

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'zh', name: 'Chinese (Simplified)' },
        { code: 'zh-tw', name: 'Chinese (Traditional)' },
        { code: 'ar', name: 'Arabic' },
        { code: 'hi', name: 'Hindi' },
        { code: 'ur', name: 'Urdu' },
        { code: 'bn', name: 'Bengali' },
        { code: 'tr', name: 'Turkish' },
        { code: 'nl', name: 'Dutch' },
        { code: 'pl', name: 'Polish' },
        { code: 'sv', name: 'Swedish' },
        { code: 'da', name: 'Danish' },
        { code: 'no', name: 'Norwegian' },
        { code: 'fi', name: 'Finnish' },
        { code: 'cs', name: 'Czech' },
        { code: 'hu', name: 'Hungarian' },
        { code: 'ro', name: 'Romanian' },
        { code: 'bg', name: 'Bulgarian' },
        { code: 'hr', name: 'Croatian' },
        { code: 'sk', name: 'Slovak' },
        { code: 'sl', name: 'Slovenian' },
        { code: 'et', name: 'Estonian' },
        { code: 'lv', name: 'Latvian' },
        { code: 'lt', name: 'Lithuanian' },
        { code: 'mt', name: 'Maltese' },
        { code: 'el', name: 'Greek' },
        { code: 'he', name: 'Hebrew' },
        { code: 'th', name: 'Thai' },
        { code: 'vi', name: 'Vietnamese' },
        { code: 'id', name: 'Indonesian' },
        { code: 'ms', name: 'Malay' },
        { code: 'tl', name: 'Filipino' },
        { code: 'fa', name: 'Persian' },
        { code: 'uk', name: 'Ukrainian' },
        { code: 'be', name: 'Belarusian' },
        { code: 'ka', name: 'Georgian' },
        { code: 'hy', name: 'Armenian' },
        { code: 'az', name: 'Azerbaijani' },
        { code: 'kk', name: 'Kazakh' },
        { code: 'ky', name: 'Kyrgyz' },
        { code: 'uz', name: 'Uzbek' },
        { code: 'tg', name: 'Tajik' },
        { code: 'mn', name: 'Mongolian' },
        { code: 'ne', name: 'Nepali' },
        { code: 'si', name: 'Sinhala' },
        { code: 'my', name: 'Burmese' },
        { code: 'km', name: 'Khmer' },
        { code: 'lo', name: 'Lao' },
        { code: 'am', name: 'Amharic' },
        { code: 'sw', name: 'Swahili' },
        { code: 'yo', name: 'Yoruba' },
        { code: 'ig', name: 'Igbo' },
        { code: 'ha', name: 'Hausa' },
        { code: 'zu', name: 'Zulu' },
        { code: 'af', name: 'Afrikaans' },
        { code: 'is', name: 'Icelandic' },
        { code: 'ga', name: 'Irish' },
        { code: 'cy', name: 'Welsh' },
        { code: 'eu', name: 'Basque' },
        { code: 'ca', name: 'Catalan' },
        { code: 'gl', name: 'Galician' },
        { code: 'sq', name: 'Albanian' },
        { code: 'mk', name: 'Macedonian' },
        { code: 'sr', name: 'Serbian' },
        { code: 'bs', name: 'Bosnian' },
        { code: 'me', name: 'Montenegrin' }
    ];

    // Mapping for Web Speech API language codes
    const speechLanguageMap = {
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-PT',
        'ru': 'ru-RU',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh': 'zh-CN',
        'zh-tw': 'zh-TW',
        'ar': 'ar-SA',
        'hi': 'hi-IN',
        'ur': 'ur-PK',
        'bn': 'bn-BD',
        'tr': 'tr-TR',
        'nl': 'nl-NL',
        'pl': 'pl-PL',
        'sv': 'sv-SE',
        'da': 'da-DK',
        'no': 'no-NO',
        'fi': 'fi-FI',
        'cs': 'cs-CZ',
        'hu': 'hu-HU',
        'ro': 'ro-RO',
        'bg': 'bg-BG',
        'hr': 'hr-HR',
        'sk': 'sk-SK',
        'sl': 'sl-SI',
        'et': 'et-EE',
        'lv': 'lv-LV',
        'lt': 'lt-LT',
        'mt': 'mt-MT',
        'el': 'el-GR',
        'he': 'he-IL',
        'th': 'th-TH',
        'vi': 'vi-VN',
        'id': 'id-ID',
        'ms': 'ms-MY',
        'tl': 'tl-PH',
        'fa': 'fa-IR',
        'uk': 'uk-UA',
        'be': 'be-BY',
        'ka': 'ka-GE',
        'hy': 'hy-AM',
        'az': 'az-AZ',
        'kk': 'kk-KZ',
        'ky': 'ky-KG',
        'uz': 'uz-UZ',
        'tg': 'tg-TJ',
        'mn': 'mn-MN',
        'ne': 'ne-NP',
        'si': 'si-LK',
        'my': 'my-MM',
        'km': 'km-KH',
        'lo': 'lo-LA',
        'am': 'am-ET',
        'sw': 'sw-KE',
        'yo': 'yo-NG',
        'ig': 'ig-NG',
        'ha': 'ha-NG',
        'zu': 'zu-ZA',
        'af': 'af-ZA',
        'is': 'is-IS',
        'ga': 'ga-IE',
        'cy': 'cy-GB',
        'eu': 'eu-ES',
        'ca': 'ca-ES',
        'gl': 'gl-ES',
        'sq': 'sq-AL',
        'mk': 'mk-MK',
        'sr': 'sr-RS',
        'bs': 'bs-BA',
        'me': 'me-ME'
    };

    const startRecognition = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Speech recognition not supported in this browser.');
            return;
        }

        // Clear transcript only when starting a new recording session
        setTranscript('');
        fullFinalTranscriptRef.current = '';
        setTranslatedText('');

        recognitionRef.current = new window.webkitSpeechRecognition();
        recognitionRef.current.lang = speechLanguageMap[inputLanguage] || 'en-US';
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            // Process all results from the current recognition session
            for (let i = 0; i < event.results.length; i++) {
                const transcriptPiece = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcriptPiece;
                } else {
                    interimTranscript += transcriptPiece;
                }
            }
            
            // If we have final transcript, use it as the complete transcript
            // This prevents duplication issues
            if (finalTranscript) {
                fullFinalTranscriptRef.current = finalTranscript;
                // Always display the full transcript in the input area
                if (!isTranscriptInOutputLanguage.current) {
                    setTranscript(fullFinalTranscriptRef.current);
                }
                
                // Only translate when we have meaningful content
                if (fullFinalTranscriptRef.current.trim()) {
                    // Translate the complete transcript as a whole
                    // This ensures we translate complete sentences rather than fragments
                    fetch(`${API_BASE_URL}/translate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: fullFinalTranscriptRef.current,
                            inputLanguage,
                            outputLanguage,
                        }),
                    })
                        .then((res) => res.json())
                        .then((data) => {
                            if (data.error) {
                                console.error('Translation error:', data.error);
                            } else {
                                setTranslatedText(data.translated_text);
                                // If we want to show transcript in output language, update it
                                if (isTranscriptInOutputLanguage.current) {
                                    setTranscript(data.translated_text);
                                }
                            }
                        })
                        .catch((err) => {
                            console.error('Translation error:', err);
                        });
                }
            } else if (interimTranscript) {
                // For interim results, combine with the existing final transcript
                // This ensures we don't lose text during pauses
                if (!isTranscriptInOutputLanguage.current) {
                    const combinedText = fullFinalTranscriptRef.current + 
                        (fullFinalTranscriptRef.current ? ' ' : '') + 
                        interimTranscript;
                    setTranscript(combinedText);
                }
            } else if (fullFinalTranscriptRef.current) {
                // If no new text but we have previous final transcript, keep showing it
                // This prevents text from disappearing during pauses
                if (!isTranscriptInOutputLanguage.current) {
                    setTranscript(fullFinalTranscriptRef.current);
                }
            }
        };

        recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
            alert('Speech recognition error: ' + event.error);
        };

        recognitionRef.current.onend = () => {
            setIsRecording(false);
        };

        recognitionRef.current.start();
        setIsRecording(true);
    };

    const stopRecognition = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };

    const speakTranslatedText = () => {
        if (translatedText) {
            const utterance = new SpeechSynthesisUtterance(translatedText);
            utterance.lang = speechLanguageMap[outputLanguage] || 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[var(--primary-white)] font-serif text-[var(--text-dark)]">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="md:ml-64 p-5 flex-1">
                    <h1 className="text-2xl font-bold mb-5">Translate</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block mb-2 font-medium">Input Language</label>
                            <select
                                value={inputLanguage}
                                onChange={(e) => setInputLanguage(e.target.value)}
                                className="w-full p-2 border border-[var(--glass-border)] rounded focus:border-[var(--accent-blue)] focus:outline-none"
                            >
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                            </select>
                            <textarea
                                value={transcript}
                                readOnly
                                placeholder="Speak to transcribe..."
                                className="w-full h-40 p-2 border border-[var(--glass-border)] rounded mt-3 resize-y focus:border-[var(--accent-blue)] focus:outline-none"
                            />
                            <div className="mt-2">
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-[var(--accent-blue)]"
                                        checked={isTranscriptInOutputLanguage.current}
                                        onChange={(e) => {
                                            isTranscriptInOutputLanguage.current = e.target.checked;
                                            // Update transcript display based on the new setting
                                            if (e.target.checked && translatedText) {
                                                setTranscript(translatedText);
                                            } else if (!e.target.checked && fullFinalTranscriptRef.current) {
                                                setTranscript(fullFinalTranscriptRef.current);
                                            }
                                        }}
                                    />
                                    <span className="ml-2 text-sm">Show transcript in output language</span>
                                </label>
                            </div>
                            <button
                                onClick={isRecording ? stopRecognition : startRecognition}
                                className={`mt-3 px-5 py-2 rounded-full text-[var(--primary-white)] ${isRecording ? 'bg-red-500' : 'bg-[var(--accent-blue)]'} hover:shadow-lg`}
                            >
                                {isRecording ? 'Stop' : 'Microphone'}
                            </button>
                        </div>
                        <div>
                            <label className="block mb-2 font-medium">Output Language</label>
                            <select
                                value={outputLanguage}
                                onChange={(e) => setOutputLanguage(e.target.value)}
                                className="w-full p-2 border border-[var(--glass-border)] rounded focus:border-[var(--accent-blue)] focus:outline-none"
                            >
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                                ))}
                            </select>
                            <textarea
                                value={translatedText}
                                readOnly
                                placeholder="Translated text..."
                                className="w-full h-40 p-2 border border-[var(--glass-border)] rounded mt-3 resize-y focus:border-[var(--accent-blue)] focus:outline-none"
                            />
                            <button
                                onClick={speakTranslatedText}
                                className="mt-3 px-5 py-2 bg-[var(--accent-green)] text-[var(--primary-white)] rounded-full hover:shadow-lg"
                            >
                                Speak
                            </button>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};