
import React from 'react';
import { QuizQuestion, UserAnswers } from '../types';
import Icon from './Icon';
import SpeakButton from './SpeakButton';

interface ResultsScreenProps {
  questions: QuizQuestion[];
  userAnswers: UserAnswers;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ questions, userAnswers }) => {
  const score = questions.reduce((acc, question, index) => {
    return userAnswers[index] === question.correctAnswer ? acc + 1 : acc;
  }, 0);
  
  const totalQuestions = questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);

  const getFeedback = () => {
    if (percentage === 100) return "Xuất sắc! Bạn là một bậc thầy từ vựng!";
    if (percentage >= 80) return "Làm tốt lắm! Tiếp tục phát huy nhé!";
    if (percentage >= 50) return "Khá tốt! Cố gắng thêm chút nữa nhé.";
    return "Đừng nản lòng! Hãy thử lại để cải thiện nhé.";
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Hoàn thành!</h2>
        <p className="text-xl font-semibold text-pink-600">{getFeedback()}</p>
        <p className="text-4xl font-bold text-slate-800 my-4">Điểm: {score}/{totalQuestions}</p>
      </div>

      <div className="space-y-4 mb-8">
        {questions.map((question, index) => {
          const userAnswer = userAnswers[index];
          const isCorrect = userAnswer === question.correctAnswer;
          return (
            <div key={index} id={`question-${index}`} className={`p-4 rounded-lg border ${isCorrect ? 'border-sky-200 bg-sky-50/70' : 'border-red-200 bg-red-50/70'}`}>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-x-4 gap-y-2">
                 <div className="flex items-baseline gap-2">
                    <p className="font-semibold text-slate-700 text-lg">{question.englishWord}</p>
                    {question.phonetic && <p className="text-slate-500 font-serif">{question.phonetic}</p>}
                    <SpeakButton textToSpeak={question.englishWord} />
                </div>
                <p className="text-slate-600 text-lg">{question.vietnameseMeaning}</p>
              </div>

              <div className="mt-2 flex items-center">
                {isCorrect ? (
                  <Icon name="Check" className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0" />
                ) : (
                  <Icon name="X" className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                )}
                <p className={`text-slate-600 ${!isCorrect && 'line-through'}`}>
                  Bạn chọn: {userAnswer || <span className="italic text-slate-400">Chưa trả lời</span>}
                </p>
              </div>
              {!isCorrect && (
                <div className="mt-1 flex items-center pl-7">
                  <Icon name="Check" className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                  <p className="text-slate-600">Đáp án đúng: {question.correctAnswer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultsScreen;
