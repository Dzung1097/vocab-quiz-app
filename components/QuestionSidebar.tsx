
import React from 'react';
import { QuizQuestion, UserAnswers } from '../types';
import Icon, { IconName } from './Icon';

interface QuestionSidebarProps {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  userAnswers: UserAnswers;
  onNavigate: (index: number) => void;
  isResultView: boolean;
}

const QuestionSidebar: React.FC<QuestionSidebarProps> = ({ questions, currentQuestionIndex, userAnswers, onNavigate, isResultView }) => {

  const getQuestionState = (index: number): { icon: IconName; color: string } => {
    const userAnswer = userAnswers[index];
    if (isResultView) {
      if (userAnswer === undefined) {
        return { icon: 'HelpCircle', color: 'text-slate-400' }; // Skipped
      }
      if (userAnswer === questions[index].correctAnswer) {
        return { icon: 'CheckCircle', color: 'text-green-500' }; // Correct
      }
      return { icon: 'XCircle', color: 'text-red-500' }; // Incorrect
    }

    // Quiz view
    if (userAnswer !== undefined) {
      return { icon: 'MinusCircle', color: 'text-sky-600' }; // Answered
    }
    return { icon: 'Circle', color: 'text-slate-400' }; // Not answered yet
  };

  return (
    <aside className="w-48 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-4 hidden lg:flex flex-col border border-slate-200/50">
      <h3 className="font-bold text-center text-slate-700 mb-4 text-lg flex-shrink-0">Danh sách câu hỏi</h3>
      <nav className="flex-grow overflow-y-auto -mr-2 pr-2 space-y-1.5">
        {Array.from({ length: questions.length }, (_, index) => {
          const state = getQuestionState(index);
          const isCurrent = currentQuestionIndex === index && !isResultView;
          
          return (
            <button
              key={index}
              onClick={() => onNavigate(index)}
              aria-label={`Chuyển đến câu ${index + 1}`}
              className={`w-full p-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-3 text-left ${
                isCurrent
                  ? 'bg-pink-500 text-white shadow'
                  : 'text-slate-600 hover:bg-pink-50'
              }`}
            >
              <Icon name={state.icon} className={`h-5 w-5 flex-shrink-0 ${isCurrent ? 'text-white' : state.color} transition-colors`} />
              <span className="flex-grow">{index + 1}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default QuestionSidebar;