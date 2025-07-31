import React, { useState } from 'react';
import { VocabularyPair } from '../types';
import SpeakButton from './SpeakButton';

interface FlashcardProps {
  vocabList: VocabularyPair[];
  learningMode: 'en-vi' | 'vi-en';
  onBack: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ vocabList, learningMode, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const currentVocab = vocabList[currentIndex];
  const progress = ((currentIndex + 1) / vocabList.length) * 100;

  // Determine which side is front and which is back based on learning mode
  const isEnglishFront = learningMode === 'en-vi';

  const handleNext = () => {
    if (currentIndex < vocabList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (currentIndex < vocabList.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        setIsFlipped(!isFlipped);
        break;
    }
  };

  return (
    <div 
      className="flex-grow flex items-center justify-center"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Main Flashcard Container */}
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 transition-colors"
          >
            Quay lại
          </button>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-600">
              Thẻ {currentIndex + 1} / {vocabList.length}
            </p>
            <div className="w-32 h-2 bg-slate-200 rounded-full mt-1">
              <div 
                className="h-full bg-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <button 
            onClick={() => setShowProgress(!showProgress)}
            className="px-4 py-2 rounded-lg bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 transition-colors"
          >
            Tiến độ
          </button>
        </div>

        {/* Progress Overview */}
        {showProgress && (
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-semibold text-slate-700 mb-2">Tiến độ học tập:</h3>
            <div className="flex flex-wrap gap-1">
              {vocabList.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${
                    index < currentIndex 
                      ? 'bg-green-500' 
                      : index === currentIndex 
                      ? 'bg-purple-500' 
                      : 'bg-slate-300'
                  }`}
                  title={`Từ ${index + 1}: ${vocabList[index].englishWord}`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </div>
        )}

                {/* Flashcard */}
        <div className="flex justify-center p-4 relative">
          {/* Left Navigation Button (Overlay) */}
          <button 
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} 
            disabled={currentIndex === 0} 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 p-4 rounded-full bg-white/90 backdrop-blur-sm shadow-xl hover:bg-purple-100/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all z-10" 
            aria-label="Thẻ trước"
            title="Thẻ trước (←)"
          >
            <svg className="h-8 w-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Navigation Button (Overlay) */}
          <button 
            onClick={() => setCurrentIndex(Math.min(vocabList.length - 1, currentIndex + 1))} 
            disabled={currentIndex === vocabList.length - 1} 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-4 rounded-full bg-white/90 backdrop-blur-sm shadow-xl hover:bg-purple-100/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all z-10" 
            aria-label="Thẻ tiếp theo"
            title="Thẻ tiếp theo (→)"
          >
            <svg className="h-8 w-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div 
            className={`w-full max-w-3xl cursor-pointer transition-all duration-500 ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            style={{ transformStyle: 'preserve-3d' }}
            onClick={handleCardClick}
          >
            {/* Front of Card */}
            <div className="absolute w-full" style={{ backfaceVisibility: 'hidden' }}>
              {isEnglishFront ? (
                // English Side (Front in en-vi mode, Back in vi-en mode)
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-xl border border-blue-200 overflow-hidden min-h-[500px]">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 text-center">
                    <h2 className="text-5xl sm:text-6xl font-bold mb-3">
                      {currentVocab.englishWord}
                    </h2>
                    {currentVocab.partOfSpeech && (
                      <div className="inline-block bg-white/20 rounded-full px-4 py-2">
                        <p className="text-lg font-medium">
                          {currentVocab.partOfSpeech}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 text-center flex flex-col justify-center h-full">
                    {currentVocab.phonetic && (
                      <div className="mb-6">
                        <p className="text-2xl text-slate-600 font-serif">
                          /{currentVocab.phonetic}/
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-4">
                      <SpeakButton textToSpeak={currentVocab.englishWord} />
                      <div className="text-center">
                        <p className="text-lg text-slate-600 font-medium">Nhấn để lật thẻ</p>
                        <p className="text-sm text-slate-500">và xem nghĩa tiếng Việt + mô tả + ví dụ</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Vietnamese Side (Front in vi-en mode, Back in en-vi mode)
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-xl border border-green-200 overflow-hidden min-h-[500px]">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                      {currentVocab.vietnameseMeaning}
                    </h2>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col h-full">
                    {/* English Description */}
                    {currentVocab.englishDescription && (
                      <div className="mb-4">
                        <div className="bg-white/90 rounded-xl p-4 border border-green-100">
                          <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                            📖 Mô tả:
                          </h3>
                          <p className="text-slate-700 leading-relaxed text-base italic">
                            "{currentVocab.englishDescription}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Examples Section */}
                    {currentVocab.examples && currentVocab.examples.length > 0 && (
                      <div className="flex-grow">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          💡 Ví dụ sử dụng:
                        </h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {currentVocab.examples.map((example, index) => (
                            <div key={index} className="bg-white/90 rounded-xl p-3 border border-green-100 shadow-sm">
                              <div className="flex items-start gap-3">
                                <span className="bg-green-100 text-green-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {index + 1}
                                </span>
                                <p className="text-slate-700 leading-relaxed text-sm">
                                  {example}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-green-100">
                      <div className="text-center">
                        <p className="text-sm text-slate-600 font-medium">Nhấn để lật lại</p>
                        <p className="text-xs text-slate-500">và xem từ tiếng Anh</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Back of Card */}
            <div className="absolute w-full" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              {isEnglishFront ? (
                // Vietnamese Side (Back in en-vi mode, Front in vi-en mode)
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-xl border border-green-200 overflow-hidden min-h-[500px]">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-4 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                      {currentVocab.vietnameseMeaning}
                    </h2>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col h-full">
                    {/* English Description */}
                    {currentVocab.englishDescription && (
                      <div className="mb-4">
                        <div className="bg-white/90 rounded-xl p-4 border border-green-100">
                          <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                            📖 Mô tả:
                          </h3>
                          <p className="text-slate-700 leading-relaxed text-base italic">
                            "{currentVocab.englishDescription}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Examples Section */}
                    {currentVocab.examples && currentVocab.examples.length > 0 && (
                      <div className="flex-grow">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          💡 Ví dụ sử dụng:
                        </h3>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {currentVocab.examples.map((example, index) => (
                            <div key={index} className="bg-white/90 rounded-xl p-3 border border-green-100 shadow-sm">
                              <div className="flex items-start gap-3">
                                <span className="bg-green-100 text-green-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {index + 1}
                                </span>
                                <p className="text-slate-700 leading-relaxed text-sm">
                                  {example}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-green-100">
                      <div className="text-center">
                        <p className="text-sm text-slate-600 font-medium">Nhấn để lật lại</p>
                        <p className="text-xs text-slate-500">và xem từ tiếng Anh</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // English Side (Back in vi-en mode, Front in en-vi mode)
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-xl border border-blue-200 overflow-hidden min-h-[500px]">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 text-center">
                    <h2 className="text-5xl sm:text-6xl font-bold mb-3">
                      {currentVocab.englishWord}
                    </h2>
                    {currentVocab.partOfSpeech && (
                      <div className="inline-block bg-white/20 rounded-full px-4 py-2">
                        <p className="text-lg font-medium">
                          {currentVocab.partOfSpeech}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 text-center flex flex-col justify-center h-full">
                    {currentVocab.phonetic && (
                      <div className="mb-6">
                        <p className="text-2xl text-slate-600 font-serif">
                          /{currentVocab.phonetic}/
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-4">
                      <SpeakButton textToSpeak={currentVocab.englishWord} />
                      <div className="text-center">
                        <p className="text-lg text-slate-600 font-medium">Nhấn để lật thẻ</p>
                        <p className="text-sm text-slate-500">và xem nghĩa tiếng Việt + mô tả + ví dụ</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard; 