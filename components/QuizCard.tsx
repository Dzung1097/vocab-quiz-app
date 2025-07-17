import React from 'react';
import { QuizQuestion } from '../types';
import SpeakButton from './SpeakButton';

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (selectedOption: string) => void;
  userSelection?: string;
}

const QuizCard: React.FC<QuizCardProps> = ({ question, questionNumber, totalQuestions, onAnswer, userSelection }) => {
  const getButtonClass = (option: string) => {
    if (option === userSelection) {
      return 'bg-sky-500 text-white border-sky-500';
    }
    return 'bg-white hover:bg-pink-50 hover:border-pink-200';
  };

  const isEnglishQuestion = question.questionText === question.englishWord;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl flex flex-col h-full border border-slate-200/50">
      <div className="flex-grow">
        <p className="text-sm font-medium text-pink-500">Câu {questionNumber} / {totalQuestions}</p>
        <p className="text-slate-600 mt-4 text-lg">Chọn đáp án đúng:</p>
        
        <div className="flex items-start gap-4 mt-2 mb-6">
            <div className="flex-grow">
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 break-words">{question.questionText}</h2>
                {isEnglishQuestion && question.phonetic && (
                    <p className="text-xl text-slate-500 font-serif mt-1">{question.phonetic}</p>
                )}
            </div>
            {isEnglishQuestion && (
                <SpeakButton textToSpeak={question.englishWord} />
            )}
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswer(option)}
              className={`p-4 rounded-lg border-2 text-lg font-medium text-slate-700 text-center transition-all duration-300 ${getButtonClass(option)}`}
            >
              {option}
            </button>

          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
