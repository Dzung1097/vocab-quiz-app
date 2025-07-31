import { Topic } from './types';

export const TOPICS: Topic[] = [
  { id: 'custom', name: 'Tạo chủ đề riêng', icon: 'PlusCircle', color: 'bg-pink-500' },
  { id: 'keyword_generator', name: 'Tạo câu trắc nghiệm', icon: 'PlusCircle', color: 'bg-purple-600' },
  { id: 'saved_topics', name: 'Chủ đề đã lưu', icon: 'CheckCircle', color: 'bg-orange-500' },
];

export const DEFAULT_QUIZ_LENGTH = 10;
export const MAX_QUIZ_LENGTH = 200;