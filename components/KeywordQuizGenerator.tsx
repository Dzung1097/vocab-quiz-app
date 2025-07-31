import React, { useState, useEffect } from 'react';
import { VocabularyPair } from '../types';
import { generateVietnameseMeanings } from '../services/geminiService';

interface KeywordQuizGeneratorProps {
  onBack: () => void;
  onContinue: (topicName: string, vocabList: VocabularyPair[]) => void;
  onSaveAsTopic?: (topicName: string, vocabList: VocabularyPair[]) => void;
  error: string | null;
}

const KeywordQuizGenerator: React.FC<KeywordQuizGeneratorProps> = ({ onBack, onContinue, onSaveAsTopic, error: externalError }) => {
  const [topicName, setTopicName] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [contextDescription, setContextDescription] = useState('');
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPairs, setGeneratedPairs] = useState<VocabularyPair[]>([]);

  // Use externalError if it exists, otherwise use internalError
  const error = externalError || internalError;
  
  // Clear internal error when external error appears
  useEffect(() => {
      if(externalError) {
          setInternalError(null);
      }
  }, [externalError]);

  const handleGenerate = async () => {
    setInternalError(null);
    if (!topicName.trim()) {
      setInternalError('Vui lòng nhập tên chủ đề.');
      return;
    }

    const keywords = keywordsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (keywords.length < 4) {
      setInternalError('Cần ít nhất 4 từ khóa để tạo bài kiểm tra.');
      return;
    }

    setIsGenerating(true);
    try {
      const pairs = await generateVietnameseMeanings(keywords, contextDescription.trim());
      setGeneratedPairs(pairs);
    } catch (err) {
      setInternalError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinue = () => {
    if (generatedPairs.length < 4) {
      setInternalError('Cần ít nhất 4 cặp từ vựng để tạo bài kiểm tra.');
      return;
    }
    onContinue(topicName.trim(), generatedPairs);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Tạo Câu Trắc Nghiệm</h2>
      <p className="text-slate-600 mb-6">Nhập danh sách từ khóa tiếng Anh để tạo câu trắc nghiệm.</p>

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
          placeholder="Ví dụ: Từ vựng công nghệ"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="keywordsList" className="font-semibold text-slate-700 mb-2 block">Danh sách từ khóa tiếng Anh</label>
        <textarea
          id="keywordsList"
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
          rows={6}
          className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-mono text-sm"
          placeholder={`Nhập mỗi từ tiếng Anh trên một dòng.\n\nVí dụ:\nTechnology\nInnovation\nAI\nMachine Learning`}
        />
      </div>

      <div className="mb-6">
        <label htmlFor="contextDescription" className="font-semibold text-slate-700 mb-2 block">
          Mô tả ngữ cảnh sử dụng <span className="text-slate-500 font-normal">(tùy chọn)</span>
        </label>
        <textarea
          id="contextDescription"
          value={contextDescription}
          onChange={(e) => setContextDescription(e.target.value)}
          rows={3}
          className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm"
          placeholder="Mô tả ngữ cảnh để AI hiểu rõ hơn và tạo nghĩa chính xác. Ví dụ: 'Các từ này được sử dụng trong lĩnh vực công nghệ thông tin', 'Từ vựng về môi trường và bảo vệ thiên nhiên'"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button onClick={onBack} className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-200 text-slate-800 font-bold hover:bg-slate-300 transition-colors">
          Quay lại
        </button>
        <button 
          onClick={handleGenerate} 
          disabled={isGenerating}
          className="flex-grow w-full sm:w-auto px-6 py-3 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Đang tạo...' : 'Tạo nghĩa tiếng Việt'}
        </button>
      </div>

      {generatedPairs.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-slate-700 mb-3">Kết quả tạo:</h3>
          <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50">
            {generatedPairs.map((pair, index) => (
              <div key={index} className="flex justify-between items-center py-1 border-b border-slate-200 last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{pair.englishWord}</span>
                  {pair.partOfSpeech && (
                    <span className="text-xs text-pink-600 bg-pink-100 px-2 py-1 rounded-full">
                      {pair.partOfSpeech}
                    </span>
                  )}
                </div>
                <span className="text-slate-600">→</span>
                <span className="text-slate-700">{pair.vietnameseMeaning}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button 
              onClick={handleContinue}
              className="flex-1 px-6 py-3 rounded-lg bg-pink-600 text-white font-bold hover:bg-pink-700 transition-colors"
            >
              Sử dụng kết quả này
            </button>
            {onSaveAsTopic && (
              <button 
                onClick={() => onSaveAsTopic(topicName.trim(), generatedPairs)}
                className="flex-1 px-6 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors"
              >
                Lưu làm chủ đề
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordQuizGenerator; 