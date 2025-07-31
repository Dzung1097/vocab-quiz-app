import { IconName } from './components/Icon';

export interface VocabularyPair {
  englishWord: string;
  englishDescription?: string;
  vietnameseMeaning: string;
  phonetic?: string;
  partOfSpeech?: string;
  examples?: string[];
}

export interface RawQuizQuestion {
  word: string;
  correctAnswer: string;
  incorrectAnswers: string[];
}

export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
  // Store original pair for results screen
  englishWord: string;
  vietnameseMeaning: string;
  phonetic?: string;
  partOfSpeech?: string;
}

export interface Topic {
  id: string;
  name: string;
  icon: IconName;
  color: string;
}

export type GameState = 
  | 'topic_selection'
  | 'custom_topic_setup'
  | 'keyword_generator_setup'
  | 'quiz_setup'
  | 'loading'
  | 'quiz'
  | 'results'
  | 'saved_topics_manager'
  | 'edit_topic'
  | 'flashcard_setup'
  | 'flashcard';
export type QuizType = 'en-vi' | 'vi-en' | 'mixed';
export type UserAnswers = { [key: number]: string };