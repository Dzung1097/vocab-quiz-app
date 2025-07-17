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
    },
    required: ['englishWord', 'phonetic'],
  },
};


export const generatePhoneticsForVocabulary = async (vocabList: VocabularyPair[]): Promise<VocabularyPair[]> => {
  try {
    const words = vocabList.map(p => p.englishWord);
    if(words.length === 0) return vocabList;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Provide the American English (AmE) International Phonetic Alphabet (IPA) transcription for the following list of English words: ${words.join(', ')}. Please use a standard American English pronunciation guide.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: phoneticsSchema,
        },
    });
    
    const responseText = (response.text ?? '').trim();
    const phoneticData: { englishWord: string; phonetic: string }[] = JSON.parse(responseText);
    
    if (!Array.isArray(phoneticData)) {
      throw new Error("API returned an invalid phonetics format.");
    }

    const phoneticMap = new Map(phoneticData.map(item => [item.englishWord.toLowerCase(), item.phonetic]));

    return vocabList.map(pair => ({
        ...pair,
        phonetic: phoneticMap.get(pair.englishWord.toLowerCase())
    }));

  } catch (error) {
    console.error("Error generating phonetics:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate phonetics: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating phonetics.");
  }
};