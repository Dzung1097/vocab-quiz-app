import { VocabularyPair } from '../../types';
import { softwareDevelopmentVocab } from './software_development';
import { bankingFintechVocab } from './banking_fintech';

// HƯỚNG DẪN THÊM CHỦ ĐỀ MỚI:
// 1. Tạo một tệp mới trong thư mục này, ví dụ: `business_vocab.ts`.
// 2. Bên trong tệp đó, export một mảng có kiểu VocabularyPair[], ví dụ: `export const businessVocab: VocabularyPair[] = [...]`.
// 3. Import mảng đó vào đây: `import { businessVocab } from './business_vocab';`.
// 4. Thêm chủ đề mới vào đối tượng PREDEFINED_VOCAB_LISTS bên dưới, sử dụng ID chủ đề từ tệp `constants.ts`.
//    Ví dụ: `'business': businessVocab,`

export const PREDEFINED_VOCAB_LISTS: { [key: string]: VocabularyPair[] } = {
  'software_development': softwareDevelopmentVocab,
  'banking_fintech': bankingFintechVocab,
  // Thêm các chủ đề mới ở đây
};
