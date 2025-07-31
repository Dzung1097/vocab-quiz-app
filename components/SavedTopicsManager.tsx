import React, { useState, useEffect } from 'react';
import { VocabularyPair } from '../types';
import Icon from './Icon';

interface SavedTopicsManagerProps {
  onBack: () => void;
  onSelectTopic: (topicName: string, vocabList: VocabularyPair[]) => void;
  onEditTopic: (topicName: string, vocabList: VocabularyPair[]) => void;
  onStartFlashcard: (topicName: string, vocabList: VocabularyPair[]) => void;
}

interface SavedTopic {
  name: string;
  vocabList: VocabularyPair[];
}

const SavedTopicsManager: React.FC<SavedTopicsManagerProps> = ({ 
  onBack, 
  onSelectTopic,
  onEditTopic,
  onStartFlashcard
}) => {
  const [savedTopics, setSavedTopics] = useState<SavedTopic[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadSavedTopics();
  }, []);

  const loadSavedTopics = () => {
    try {
      console.log('Loading saved topics...');
      const savedTopicsData = JSON.parse(localStorage.getItem('customTopics') || '{}');
      console.log('Raw saved topics data:', savedTopicsData);
      
      const topicsArray = Object.entries(savedTopicsData).map(([name, vocabList]) => ({
        name,
        vocabList: vocabList as VocabularyPair[]
      }));
      console.log('Processed topics array:', topicsArray);
      setSavedTopics(topicsArray);
    } catch (error) {
      console.error('Error loading saved topics:', error);
      setSavedTopics([]);
    }
  };

  const handleDeleteTopic = (topicName: string) => {
    try {
      console.log('Deleting topic:', topicName);
      const savedTopicsData = JSON.parse(localStorage.getItem('customTopics') || '{}');
      console.log('Before delete:', savedTopicsData);
      
      delete savedTopicsData[topicName];
      localStorage.setItem('customTopics', JSON.stringify(savedTopicsData));
      
      console.log('After delete:', JSON.parse(localStorage.getItem('customTopics') || '{}'));
      loadSavedTopics();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const confirmDelete = (topicName: string) => {
    setShowDeleteConfirm(topicName);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 max-h-[80vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-slate-800">Chủ đề đã lưu</h2>
        <button 
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 transition-colors"
        >
          Quay lại
        </button>
      </div>

      {savedTopics.length === 0 ? (
        <div className="text-center py-8 flex-grow flex items-center justify-center">
          <div>
            <Icon name="HelpCircle" className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Chưa có chủ đề nào được lưu</p>
            <p className="text-slate-500 mt-2">Tạo chủ đề mới để bắt đầu học!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto flex-grow pr-2">
          {savedTopics.map((topic) => (
            <div key={topic.name} className="p-4 border border-slate-200 rounded-lg bg-white/50 hover:bg-white/70 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">{topic.name}</h3>
                  <p className="text-slate-600 text-sm">
                    {topic.vocabList.length} từ vựng
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {topic.vocabList.slice(0, 5).map((vocab, index) => (
                      <span key={index} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                        {vocab.englishWord}
                      </span>
                    ))}
                    {topic.vocabList.length > 5 && (
                      <span className="text-xs text-slate-500 px-2 py-1">
                        +{topic.vocabList.length - 5} từ khác
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => onSelectTopic(topic.name, topic.vocabList)}
                    className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 transition-colors"
                  >
                    Sử dụng
                  </button>
                  <button
                    onClick={() => onStartFlashcard(topic.name, topic.vocabList)}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Flashcard
                  </button>
                  <button
                    onClick={() => onEditTopic(topic.name, topic.vocabList)}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    title="Chỉnh sửa chủ đề"
                  >
                    <Icon name="Edit" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => confirmDelete(topic.name)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    title="Xóa chủ đề"
                  >
                    <Icon name="X" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Xác nhận xóa</h3>
            <p className="text-slate-600 mb-6">
              Bạn có chắc chắn muốn xóa chủ đề "{showDeleteConfirm}" không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={() => handleDeleteTopic(showDeleteConfirm)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedTopicsManager; 