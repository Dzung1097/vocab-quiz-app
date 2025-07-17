import React, { useState, useEffect } from 'react';
import { VocabularyPair } from '../types';

interface CustomTopicSetupProps {
  onBack: () => void;
  onContinue: (topicName: string, vocabList: VocabularyPair[]) => void;
  error: string | null;
}

const CustomTopicSetup: React.FC<CustomTopicSetupProps> = ({ onBack, onContinue, error: externalError }) => {
  const [topicName, setTopicName] = useState('');
  const [vocabText, setVocabText] = useState('');
  const [internalError, setInternalError] = useState<string | null>(null);

  // Use externalError if it exists, otherwise use internalError
  const error = externalError || internalError;
  
  // Clear internal error when external error appears
  useEffect(() => {
      if(externalError) {
          setInternalError(null);
      }
  }, [externalError]);


  const handleContinue = () => {
    setInternalError(null);
    if (!topicName.trim()) {
      setInternalError('Vui lòng nhập tên chủ đề.');
      return;
    }

    const lines = vocabText.split('\n');
    const pairs: VocabularyPair[] = lines
      .map(line => {
        const parts = line.split('-').map(p => p.trim());
        if (parts.length === 2 && parts[0] && parts[1]) {
          return { englishWord: parts[0], vietnameseMeaning: parts[1] };
        }
        return null;
      })
      .filter((pair): pair is VocabularyPair => pair !== null);

    if (pairs.length < 4) {
      setInternalError('Cần ít nhất 4 cặp từ vựng hợp lệ để tạo bài kiểm tra.');
      return;
    }

    onContinue(topicName.trim(), pairs);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Tạo Chủ Đề Riêng</h2>
      <p className="text-slate-600 mb-6">Nhập danh sách từ vựng của bạn.</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="topicName" className="font-semibold text-slate-700 mb-2 block">Tên chủ đề</label>
        <input
          id="topicName"
          type="text"
          value={topicName}
          onChange={(e) => setTopicName(e.target.value)}
          placeholder="Ví dụ: Từ vựng cho bài thi cuối kỳ"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="vocabList" className="font-semibold text-slate-700 mb-2 block">Danh sách từ vựng</label>
        <textarea
          id="vocabList"
          value={vocabText}
          onChange={(e) => setVocabText(e.target.value)}
          rows={10}
          className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-mono text-sm"
          placeholder={`Nhập mỗi cặp từ trên một dòng.\nDùng dấu gạch ngang (-) để phân tách.\n\nVí dụ:\nTechnology - Công nghệ\nInnovation - Sự đổi mới`}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={onBack} className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-200 text-slate-800 font-bold hover:bg-slate-300 transition-colors">
          Quay lại
        </button>
        <button onClick={handleContinue} className="flex-grow w-full sm:w-auto px-6 py-3 rounded-lg bg-pink-600 text-white font-bold hover:bg-pink-700 transition-colors">
          Tiếp tục
        </button>
      </div>
    </div>
  );
};

export default CustomTopicSetup;
