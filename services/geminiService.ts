import { GoogleGenAI, Type } from "@google/genai";
import { VocabularyPair } from '../types';

// Để key trực tiếp ở đây
const API_KEY = "AIzaSyB6MPJEnEtjFREKEMIGBM37aFL9fSMbMKg";

const ai = new GoogleGenAI({ apiKey: API_KEY });

const phoneticsSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      englishWord: {
        type: Type.STRING,
        description: "The original English word.",
      },
      phonetic: {
        type: Type.STRING,
        description: "The American English (AmE) International Phonetic Alphabet (IPA) transcription, e.g., /həˈloʊ/.",
      },
      partOfSpeech: {
        type: Type.STRING,
        description: "The part of speech (noun, verb, adjective, adverb, etc.) of the English word.",
      },
    },
    required: ['englishWord', 'phonetic', 'partOfSpeech'],
  },
};

const vietnameseMeaningsSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      englishWord: {
        type: Type.STRING,
        description: "The original English word.",
      },
      vietnameseMeaning: {
        type: Type.STRING,
        description: "The Vietnamese translation/meaning of the English word.",
      },
      partOfSpeech: {
        type: Type.STRING,
        description: "The part of speech (noun, verb, adjective, adverb, etc.) of the English word.",
      },
    },
    required: ['englishWord', 'vietnameseMeaning', 'partOfSpeech'],
  },
};

export const generatePhoneticsForVocabulary = async (vocabList: VocabularyPair[]): Promise<VocabularyPair[]> => {
  try {
    const words = vocabList.map(p => p.englishWord);
    if(words.length === 0) return vocabList;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Provide the American English (AmE) International Phonetic Alphabet (IPA) transcription and part of speech for the following list of English words: ${words.join(', ')}. Please use a standard American English pronunciation guide.

        Return in JSON format with partOfSpeech as: noun, verb, adjective, adverb, pronoun, preposition, conjunction, interjection`,
        config: {
          responseMimeType: "application/json",
          responseSchema: phoneticsSchema,
        },
    });
    
    const responseText = (response.text ?? '').trim();
    const phoneticData: { englishWord: string; phonetic: string; partOfSpeech: string }[] = JSON.parse(responseText);
    
    if (!Array.isArray(phoneticData)) {
      throw new Error("API returned an invalid phonetics format.");
    }

    const phoneticMap = new Map(phoneticData.map(item => [item.englishWord.toLowerCase(), item.phonetic]));
    const partOfSpeechMap = new Map(phoneticData.map(item => [item.englishWord.toLowerCase(), item.partOfSpeech]));

    return vocabList.map(pair => ({
        ...pair,
        phonetic: phoneticMap.get(pair.englishWord.toLowerCase()),
        partOfSpeech: partOfSpeechMap.get(pair.englishWord.toLowerCase())
    }));

  } catch (error) {
    console.error("Error generating phonetics:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate phonetics: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating phonetics.");
  }
};

export const generateVietnameseMeanings = async (englishWords: string[], context?: string): Promise<VocabularyPair[]> => {
  try {
    if(englishWords.length === 0) return [];

    const contextPrompt = context ? `\n\nNgữ cảnh sử dụng: ${context}` : '';

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Tạo nghĩa tiếng Việt và loại từ cho các từ tiếng Anh sau. Trả về dạng JSON array với format chính xác:
        [
          {"englishWord": "word", "vietnameseMeaning": "nghĩa tiếng việt", "partOfSpeech": "noun"},
          {"englishWord": "run", "vietnameseMeaning": "chạy", "partOfSpeech": "verb"},
          {"englishWord": "beautiful", "vietnameseMeaning": "đẹp", "partOfSpeech": "adjective"},
          {"englishWord": "quickly", "vietnameseMeaning": "nhanh chóng", "partOfSpeech": "adverb"}
        ]
        
        Loại từ phải là: noun, verb, adjective, adverb, pronoun, preposition, conjunction, interjection${contextPrompt}
        
        Danh sách từ: ${englishWords.join(', ')}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: vietnameseMeaningsSchema,
        },
    });
    
    const responseText = (response.text ?? '').trim();
    const pairs: VocabularyPair[] = JSON.parse(responseText);
    
    if (!Array.isArray(pairs)) {
      throw new Error("API returned an invalid format.");
    }

    return pairs;

  } catch (error) {
    console.error("Error generating Vietnamese meanings:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate Vietnamese meanings: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating Vietnamese meanings.");
  }
};