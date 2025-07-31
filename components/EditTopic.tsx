import React, { useState } from 'react';
import { VocabularyPair } from '../types';

interface EditTopicProps {
  topicName: string;
  vocabList: VocabularyPair[];
  onSave: (topicName: string, vocabList: VocabularyPair[]) => void;
  onBack: () => void;
  onGenerateVietnamese: (englishWords: string[], contextDescription: string) => Promise<VocabularyPair[]>;
}

const EditTopic: React.FC<EditTopicProps> = ({
  topicName: initialTopicName,
  vocabList: initialVocabList,
  onSave,
  onBack,
  onGenerateVietnamese
}) => {
  const [topicName, setTopicName] = useState(initialTopicName);
  const [englishWords, setEnglishWords] = useState(initialVocabList.map(v => v.englishWord).join('\n'));
  const [generatedVocab, setGeneratedVocab] = useState<VocabularyPair[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!topicName.trim()) {
      setError('Vui lòng nhập tên chủ đề');
      return;
    }

    const words = englishWords.split('\n').map(w => w.trim()).filter(w => w);
    if (words.length === 0) {
      setError('Vui lòng nhập ít nhất một từ tiếng Anh');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const newVocabList = await onGenerateVietnamese(words, '');
      setGeneratedVocab(newVocabList);
      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo nghĩa tiếng Việt');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!topicName.trim()) {
      setError('Vui lòng nhập tên chủ đề');
      return;
    }

    if (generatedVocab.length === 0) {
      setError('Vui lòng tạo nghĩa tiếng Việt trước khi lưu');
      return;
    }

    onSave(topicName, generatedVocab);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-4">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Chỉnh sửa chủ đề</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Tên chủ đề */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tên chủ đề
            </label>
            <input
              type="text"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
              placeholder="Nhập tên chủ đề..."
            />
          </div>

          {/* Danh sách từ tiếng Anh */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Danh sách từ vựng (mỗi từ một dòng)
            </label>
            <textarea
              value={englishWords}
              onChange={(e) => setEnglishWords(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono text-sm"
              rows={6}
              placeholder="hello&#10;world&#10;computer&#10;..."
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full px-4 py-2 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {isGenerating ? 'Đang tạo...' : 'Tạo nghĩa tiếng Việt'}
            </button>
            <div className="flex gap-3">
              <button onClick={onBack} className="flex-1 px-4 py-2 rounded-lg bg-slate-200 text-slate-800 font-bold hover:bg-slate-300 transition-colors text-sm">
                Quay lại
              </button>
              <button 
                onClick={handleSave}
                disabled={generatedVocab.length === 0}
                className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>

          {/* Kết quả - chỉ hiển thị sau khi generate */}
          {hasGenerated && generatedVocab.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Kết quả:</h3>
              <div className="bg-slate-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                {generatedVocab.map((vocab, index) => (
                  <div key={index} className="mb-2 p-2 bg-white rounded border text-sm">
                    <div className="font-semibold text-slate-800">
                      {vocab.englishWord}
                      {vocab.partOfSpeech && (
                        <span className="ml-1 text-xs text-slate-500 font-normal">
                          ({vocab.partOfSpeech})
                        </span>
                      )}
                      {vocab.phonetic && (
                        <span className="ml-1 text-xs text-slate-500 font-normal">
                          /{vocab.phonetic}/
                        </span>
                      )}
                    </div>
                    <div className="text-slate-600 mt-1">{vocab.vietnameseMeaning}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditTopic; 