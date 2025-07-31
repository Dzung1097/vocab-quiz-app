import React, { useState, useEffect } from 'react';
import { VocabularyPair } from '../types';

interface CustomTopicSetupProps {
  onBack: () => void;
  onContinue: (topicName: string, vocabList: VocabularyPair[]) => void;
  onSaveAsTopic?: (topicName: string, vocabList: VocabularyPair[]) => void;
  error: string | null;
}

const CustomTopicSetup: React.FC<CustomTopicSetupProps> = ({ onBack, onContinue, onSaveAsTopic, error: externalError }) => {
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


  const parseVocabList = (): VocabularyPair[] => {
    const lines = vocabText.split('\n').filter(line => line.trim() !== '');
    console.log('Parsing lines:', lines);
    
    return lines
      .map((line, index) => {
        const parts = line.split('//').map(p => p.trim().replace(/^["']|["']$/g, ''));
        console.log(`Line ${index + 1} parts:`, parts);
        
        if (parts.length >= 4 && parts[0] && parts[1] && parts[2] && parts[3]) {
          const examples = parts.slice(4).filter(example => example.trim() !== '');
          const result = { 
            englishWord: parts[0], 
            englishDescription: parts[2],
            vietnameseMeaning: parts[3],
            partOfSpeech: parts[1],
            examples: examples.length > 0 ? examples : undefined
          } as VocabularyPair;
          console.log(`Line ${index + 1} parsed successfully:`, result);
          return result;
        } else {
          console.log(`Line ${index + 1} failed parsing:`, { parts, length: parts.length });
          return null;
        }
      })
      .filter((pair): pair is VocabularyPair => pair !== null);
  };

  const validateInput = (): string | null => {
    if (!topicName.trim()) {
      return 'Vui lòng nhập tên chủ đề.';
    }

    const pairs = parseVocabList();
    if (pairs.length < 4) {
      return 'Cần ít nhất 4 cặp từ vựng hợp lệ để tạo bài kiểm tra.';
    }

    return null;
  };

  const handleContinue = () => {
    setInternalError(null);
    const error = validateInput();
    if (error) {
      setInternalError(error);
      return;
    }

    const pairs = parseVocabList();
    onContinue(topicName.trim(), pairs);
  };

  const handleSave = () => {
    if (!onSaveAsTopic) return;
    
    setInternalError(null);
    const error = validateInput();
    if (error) {
      setInternalError(error);
      return;
    }

    const pairs = parseVocabList();
    onSaveAsTopic(topicName.trim(), pairs);
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
          placeholder={`Nhập mỗi từ vựng trên một dòng.\nDùng dấu // để phân tách: Từ vựng//Loại từ//Mô tả tiếng Anh//Nghĩa tiếng Việt//Ví dụ 1//Ví dụ 2//Ví dụ 3\nDấu ngoặc kép sẽ được tự động loại bỏ.\n\nVí dụ:\n"Technology"//noun//"The application of scientific knowledge for practical purposes"//"Công nghệ"//"Modern technology is advancing rapidly"//"The company invests in new technology"//"Technology has changed our lives"\nInnovation//noun//"A new method, idea, or product"//"Sự đổi mới"//"This innovation will revolutionize the industry"//"The team's innovation won the award"//"Innovation drives progress"\n"Beautiful"//adjective//"Pleasing the senses or mind aesthetically"//"Đẹp"//"She is a beautiful woman"//"The sunset was beautiful"//"What a beautiful day!"`}
        />
      </div>

      {/* Parsing Preview */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-700 mb-2">📋 Kiểm tra dữ liệu:</h4>
        <div className="text-sm text-blue-600">
          <p>Đã tìm thấy: <strong>{parseVocabList().length}</strong> từ vựng hợp lệ</p>
          <p>Tổng dòng: <strong>{vocabText.split('\n').filter(line => line.trim() !== '').length}</strong></p>
          {parseVocabList().length > 0 && (
            <div className="mt-2">
              <p className="font-medium">Các từ đã parse:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {parseVocabList().slice(0, 3).map((vocab, index) => (
                  <li key={index} className="text-xs">
                    {vocab.englishWord} → {vocab.vietnameseMeaning}
                  </li>
                ))}
                {parseVocabList().length > 3 && (
                  <li className="text-xs text-blue-500">... và {parseVocabList().length - 3} từ khác</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={onBack} className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-200 text-slate-800 font-bold hover:bg-slate-300 transition-colors">
          Quay lại
        </button>
        <button onClick={handleContinue} className="flex-grow w-full sm:w-auto px-6 py-3 rounded-lg bg-pink-600 text-white font-bold hover:bg-pink-700 transition-colors">
          Tiếp tục
        </button>
        {onSaveAsTopic && (
          <button onClick={handleSave} className="w-full sm:w-auto px-6 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 transition-colors">
            Lưu Chủ Đề
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomTopicSetup;
