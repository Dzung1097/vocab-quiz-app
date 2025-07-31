import React, { useState } from 'react';
import { VocabularyPair } from '../types';

interface FlashcardSetupProps {
  topicName: string;
  vocabList: VocabularyPair[];
  onStart: (selectedVocabList: VocabularyPair[], mode: 'en-vi' | 'vi-en') => void;
  onBack: () => void;
}

const FlashcardSetup: React.FC<FlashcardSetupProps> = ({
  topicName,
  vocabList,
  onStart,
  onBack
}) => {
  const [selectedCount, setSelectedCount] = useState(Math.min(10, vocabList.length));
  const [learningMode, setLearningMode] = useState<'en-vi' | 'vi-en'>('en-vi');

  const handleStart = () => {
    const shuffledVocab = [...vocabList].sort(() => Math.random() - 0.5);
    const selectedVocab = shuffledVocab.slice(0, selectedCount);
    onStart(selectedVocab, learningMode);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Flashcard Setup</h2>
      <p className="text-slate-600 mb-6">Chọn số lượng từ vựng để học</p>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">{topicName}</h3>
        <p className="text-slate-600 text-sm mb-4">
          Tổng cộng: {vocabList.length} từ vựng
        </p>

        <div className="mb-6">
          <label className="font-semibold text-slate-700 mb-2 block">
            Chế độ học:
          </label>
          <div className="grid grid-cols-2 gap-2 rounded-lg p-1 bg-slate-100">
            <button 
              onClick={() => setLearningMode('en-vi')} 
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                learningMode === 'en-vi' 
                  ? 'bg-purple-500 text-white shadow' 
                  : 'text-slate-600 hover:bg-purple-100'
              }`}
            >
              Anh → Việt
            </button>
            <button 
              onClick={() => setLearningMode('vi-en')} 
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                learningMode === 'vi-en' 
                  ? 'bg-purple-500 text-white shadow' 
                  : 'text-slate-600 hover:bg-purple-100'
              }`}
            >
              Việt → Anh
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="wordCount" className="font-semibold text-slate-700 mb-2 block">
            Số từ vựng muốn học:
          </label>
          <input
            id="wordCount"
            type="range"
            min="1"
            max={vocabList.length}
            value={selectedCount}
            onChange={(e) => setSelectedCount(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-sm text-slate-500 mt-1">
            <span>1</span>
            <span className="font-semibold text-slate-700">{selectedCount}</span>
            <span>{vocabList.length}</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="font-semibold text-slate-700 mb-2">Preview:</h4>
          <div className="flex flex-wrap gap-1">
            {vocabList.slice(0, selectedCount).map((vocab, index) => (
              <span key={index} className="text-xs bg-white text-slate-700 px-2 py-1 rounded-full border">
                {learningMode === 'en-vi' ? vocab.englishWord : vocab.vietnameseMeaning}
              </span>
            ))}
            {vocabList.length > selectedCount && (
              <span className="text-xs text-slate-500 px-2 py-1">
                +{vocabList.length - selectedCount} từ khác
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {learningMode === 'en-vi' 
              ? 'Mặt trước: Từ tiếng Anh | Mặt sau: Nghĩa tiếng Việt'
              : 'Mặt trước: Nghĩa tiếng Việt | Mặt sau: Từ tiếng Anh'
            }
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={onBack} className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-200 text-slate-800 font-bold hover:bg-slate-300 transition-colors">
          Quay lại
        </button>
        <button onClick={handleStart} className="flex-grow w-full sm:w-auto px-6 py-3 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors">
          Bắt đầu học
        </button>
      </div>
    </div>
  );
};

export default FlashcardSetup; 