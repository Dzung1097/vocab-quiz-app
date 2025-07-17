import { Topic } from './types';

export const TOPICS: Topic[] = [
  { id: 'software_development', name: 'Software Development', icon: 'Cpu', color: 'bg-sky-500' },
  { id: 'banking_fintech', name: 'Banking & Fintech', icon: 'Landmark', color: 'bg-green-600' },
  { id: 'custom', name: 'Tạo chủ đề riêng', icon: 'PlusCircle', color: 'bg-pink-500' },
];

export const DEFAULT_QUIZ_LENGTH = 10;
export const MAX_QUIZ_LENGTH = 200;