import React from 'react';
import { Topic } from '../types';
import { TOPICS } from '../constants';
import Icon from './Icon';

interface TopicSelectorProps {
  onSelectTopic: (topicId: string, topicName: string) => void;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ onSelectTopic }) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">Vocab Quiz</h1>
        <p className="text-lg text-slate-600">Chọn một chủ đề để bắt đầu ôn tập!</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic.id, topic.name)}
            className={`group flex items-center p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 ${topic.color} text-white`}
          >
            <Icon name={topic.icon} className="h-10 w-10 mr-4" />
            <span className="text-2xl font-semibold">{topic.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicSelector;
