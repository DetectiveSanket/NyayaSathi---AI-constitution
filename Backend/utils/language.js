const LANGUAGE_MAP = {
  english: {
    label: "English",
    instruction: "Respond in clear and concise English.",
  },
  hindi: {
    label: "Hindi",
    instruction: "उत्तर हिंदी में दीजिए।",
  },
  marathi: {
    label: "Marathi",
    instruction: "उत्तर मराठीमध्ये द्या.",
  },
};

export function normalizeLanguage(language = "english") {
  const key = language?.toString().trim().toLowerCase();
  return LANGUAGE_MAP[key] ? key : "english";
}

export function getLanguageInstruction(language) {
  const key = normalizeLanguage(language);
  return LANGUAGE_MAP[key].instruction;
}

export function getLanguageLabel(language) {
  const key = normalizeLanguage(language);
  return LANGUAGE_MAP[key].label;
}

export const supportedLanguages = Object.keys(LANGUAGE_MAP);

