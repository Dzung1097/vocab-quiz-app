import React, { useState, useCallback, useMemo, useEffect } from 'react';
import TopicSelector from './components/TopicSelector';
import CustomTopicSetup from './components/CustomTopicSetup';
import KeywordQuizGenerator from './components/KeywordQuizGenerator';
import SavedTopicsManager from './components/SavedTopicsManager';
import QuizCard from './components/QuizCard';
import ResultsScreen from './components/ResultsScreen';
import LoadingSpinner from './components/LoadingSpinner';
import { GameState, QuizQuestion, VocabularyPair, QuizType, UserAnswers } from './types';
import { DEFAULT_QUIZ_LENGTH, MAX_QUIZ_LENGTH } from './constants';
import { PREDEFINED_VOCAB_LISTS } from './data/topics/_index';
import Icon from './components/Icon';
import { generatePhoneticsForVocabulary, generateVietnameseMeanings } from './services/geminiService';
import QuestionSidebar from './components/QuestionSidebar';
import EditTopic from './components/EditTopic';
import FlashcardSetup from './components/FlashcardSetup';
import Flashcard from './components/Flashcard';

const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// Component for quiz setup
const QuizSetup: React.FC<{
  topic: string;
  onStartQuiz: (type: QuizType, length: number) => void;
  onBack: () => void;
  maxLength: number;
}> = ({ topic, onStartQuiz, onBack, maxLength }) => {
  const [quizType, setQuizType] = useState<QuizType>('en-vi');
  const [quizLength, setQuizLength] = useState(Math.min(DEFAULT_QUIZ_LENGTH, maxLength));

  React.useEffect(() => {
    if (quizLength > maxLength) {
        setQuizLength(maxLength);
    }
  }, [maxLength, quizLength]);


  return (
    <div className="w-full max-w-lg mx-auto p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Chủ đề: {topic}</h2>
      <p className="text-slate-600 mb-6">Tùy chỉnh bài kiểm tra của bạn.</p>

      <div className="mb-6">
        <label className="font-semibold text-slate-700 mb-2 block">Loại câu hỏi</label>
        <div className="grid grid-cols-3 gap-2 rounded-lg p-1 bg-slate-100">
          {(['en-vi', 'vi-en', 'mixed'] as QuizType[]).map(type => (
            <button key={type} onClick={() => setQuizType(type)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${quizType === type ? 'bg-pink-500 text-white shadow' : 'text-slate-600 hover:bg-sky-100'}`}>
              {type === 'en-vi' ? 'Anh-Việt' : type === 'vi-en' ? 'Việt-Anh' : 'Hỗn hợp'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <label htmlFor="quizLength" className="font-semibold text-slate-700 mb-2 block">Số lượng câu hỏi: <span className="font-bold text-pink-600">{quizLength}</span></label>
        <input 
          id="quizLength"
          type="range"
          min="4"
          max={maxLength}
          step="1"
          value={quizLength}
          onChange={(e) => setQuizLength(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={onBack} className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-200 text-slate-800 font-bold hover:bg-slate-300 transition-colors">
          Quay lại
        </button>
        <button onClick={() => onStartQuiz(quizType, quizLength)} className="flex-grow w-full sm:w-auto px-6 py-3 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-700 transition-colors">
          Bắt đầu
        </button>
      </div>
    </div>
  )
};


function App() {
  const [gameState, setGameState] = useState<GameState>('topic_selection');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedTopicName, setSelectedTopicName] = useState('');
  const [customVocabList, setCustomVocabList] = useState<VocabularyPair[] | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [originalVocabList, setOriginalVocabList] = useState<VocabularyPair[] | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [currentVocabList, setCurrentVocabList] = useState<VocabularyPair[]>([]);
  const [editingTopic, setEditingTopic] = useState<{ name: string; vocabList: VocabularyPair[] } | null>(null);
  const [flashcardVocabList, setFlashcardVocabList] = useState<VocabularyPair[]>([]);
  const [flashcardTopicName, setFlashcardTopicName] = useState<string>('');
  const [flashcardLearningMode, setFlashcardLearningMode] = useState<'en-vi' | 'vi-en'>('en-vi');
  
  const buildQuiz = (pairs: VocabularyPair[], quizType: QuizType): QuizQuestion[] => {
    const isDefinition = (text: string) => text.split(' ').length > 4 || text.includes('.') || text.includes(',');
    
    const definitions = pairs.map(p => p.vietnameseMeaning).filter(m => isDefinition(m));
    const singleWords = pairs.map(p => p.vietnameseMeaning).filter(m => !isDefinition(m));
    const allEnglishWords = pairs.map(p => p.englishWord);

    return pairs.map(currentPair => {
      let questionText: string;
      let correctAnswer: string;
      let incorrectOptionsPool: string[];
      let typeForThisQuestion: 'en-vi' | 'vi-en' = quizType as 'en-vi' | 'vi-en';

      if (quizType === 'mixed') {
        typeForThisQuestion = Math.random() < 0.5 ? 'en-vi' : 'vi-en';
      }

      if (typeForThisQuestion === 'en-vi') {
        questionText = currentPair.englishWord;
        correctAnswer = currentPair.vietnameseMeaning;
        if(isDefinition(correctAnswer)) {
            incorrectOptionsPool = definitions.filter(m => m !== correctAnswer);
        } else {
            incorrectOptionsPool = singleWords.filter(m => m !== correctAnswer);
        }
      } else { // vi-en
        questionText = currentPair.vietnameseMeaning;
        correctAnswer = currentPair.englishWord;
        incorrectOptionsPool = allEnglishWords.filter(w => w !== correctAnswer);
      }
      
      const options = shuffleArray([
          correctAnswer,
          ...shuffleArray(incorrectOptionsPool).slice(0, 3)
      ]);
      
      while(options.length < 4 && incorrectOptionsPool.length > options.length -1) {
        const nextOption = shuffleArray(incorrectOptionsPool).find(opt => !options.includes(opt));
        if (nextOption) options.push(nextOption);
        else break;
      }
      
      if(options.length < 2) {
         options.push("Không có đáp án khác");
         while(options.length < 4) options.push("...");
      }

      return {
          questionText,
          options: shuffleArray(options),
          correctAnswer,
          englishWord: currentPair.englishWord,
          vietnameseMeaning: currentPair.vietnameseMeaning,
          phonetic: currentPair.phonetic,
          partOfSpeech: currentPair.partOfSpeech,
      };
    });
  };

  const handleTopicSelect = useCallback((topicId: string, topicName: string) => {
    setCustomVocabList(null);
    setError(null);
    if (topicId === 'custom') {
      setGameState('custom_topic_setup');
    } else if (topicId === 'keyword_generator') {
      setGameState('keyword_generator_setup');
    } else if (topicId === 'saved_topics') {
      setGameState('saved_topics_manager');
    } else {
      setSelectedTopic(topicId);
      setSelectedTopicName(topicName);
      setGameState('quiz_setup');
    }
  }, []);

  const handleCustomTopicSubmit = useCallback(async (topicName: string, vocabList: VocabularyPair[]) => {
    setSelectedTopic('custom');
    setSelectedTopicName(topicName);
    setError(null);
    setGameState('loading');
    setLoadingMessage('Đang tạo phiên âm cho từ vựng của bạn...');

    try {
      const vocabWithPhonetics = await generatePhoneticsForVocabulary(vocabList);
      setCustomVocabList(vocabWithPhonetics);
      setGameState('quiz_setup');
    } catch (err) {
      console.error("Failed to generate phonetics:", err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể tạo phiên âm. Vui lòng thử lại.';
      setError(`Lỗi: ${errorMessage}`);
      setGameState('custom_topic_setup');
    } finally {
      setLoadingMessage('');
    }
  }, []);

  const handleSaveAsTopic = useCallback(async (topicName: string, vocabList: VocabularyPair[]) => {
    setError(null);
    setGameState('loading');
    setLoadingMessage('Đang lưu chủ đề mới...');

    try {
      console.log('Saving topic:', topicName, vocabList);
      
      const vocabWithPhonetics = await generatePhoneticsForVocabulary(vocabList);
      console.log('Generated phonetics:', vocabWithPhonetics);
      
      // Kiểm tra localStorage có hoạt động không
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
      } catch (localStorageError) {
        console.error('localStorage not available:', localStorageError);
        throw new Error('Trình duyệt không hỗ trợ lưu trữ cục bộ. Vui lòng thử lại.');
      }
      
      // Lưu vào localStorage
      const savedTopics = JSON.parse(localStorage.getItem('customTopics') || '{}');
      console.log('Current saved topics:', savedTopics);
      
      savedTopics[topicName] = vocabWithPhonetics;
      localStorage.setItem('customTopics', JSON.stringify(savedTopics));
      
      console.log('Saved topics after update:', JSON.parse(localStorage.getItem('customTopics') || '{}'));
      
      setGameState('topic_selection');
      setLoadingMessage('');
    } catch (err) {
      console.error("Failed to save topic:", err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể lưu chủ đề. Vui lòng thử lại.';
      setError(`Lỗi: ${errorMessage}`);
      setGameState('keyword_generator_setup');
    } finally {
      setLoadingMessage('');
    }
  }, []);

  const handleSelectSavedTopic = useCallback((topicName: string, vocabList: VocabularyPair[]) => {
    setSelectedTopic('saved');
    setSelectedTopicName(topicName);
    setCustomVocabList(vocabList);
    setGameState('quiz_setup');
  }, []);

  const handleStartQuiz = useCallback((quizType: QuizType, length: number) => {
    setGameState('loading');
    setLoadingMessage(`Đang tạo câu hỏi cho chủ đề '${selectedTopicName}'...`);
    setError(null);
    
    setTimeout(() => {
        try {
          let vocabList: VocabularyPair[];
          const predefinedList = PREDEFINED_VOCAB_LISTS[selectedTopic];

          if (customVocabList) {
            vocabList = shuffleArray(customVocabList);
          } else if (predefinedList) {
            vocabList = shuffleArray(predefinedList);
          } else {
            throw new Error("Không thể tìm thấy danh sách từ vựng cho chủ đề này.");
          }
          
          vocabList = vocabList.slice(0, length);

          if (vocabList.length < 4) {
              throw new Error("Không đủ từ vựng (cần ít nhất 4) để tạo câu hỏi. Vui lòng chọn độ dài nhỏ hơn hoặc thêm từ vào danh sách.");
          }
          
          // Lưu danh sách gốc để làm lại
          setOriginalVocabList(vocabList);
          
          const processedQuestions = buildQuiz(vocabList, quizType);
          console.log('Processed Questions:', processedQuestions);
          setQuizQuestions(processedQuestions);
          setCurrentQuestionIndex(0);
          setUserAnswers({});
          setGameState('quiz');
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Đã có lỗi không mong muốn xảy ra.');
          }
          setGameState('topic_selection');
        } finally {
           setLoadingMessage('');
        }
    }, 500);
  }, [selectedTopic, selectedTopicName, customVocabList, buildQuiz]);

  const handleAnswer = useCallback((selectedOption: string) => {
    setUserAnswers(prev => ({ ...prev, [currentQuestionIndex]: selectedOption }));
  }, [currentQuestionIndex]);
  
  const handleNavigate = useCallback((newIndex: number) => {
    if (gameState === 'results') {
        const element = document.getElementById(`question-${newIndex}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (newIndex >= 0 && newIndex < quizQuestions.length) {
      setCurrentQuestionIndex(newIndex);
    }
  }, [quizQuestions.length, gameState]);

  const handleSubmit = useCallback(() => {
    const answeredCount = Object.keys(userAnswers).length;
    const totalQuestions = quizQuestions.length;
    
    if (answeredCount < totalQuestions) {
      setShowConfirmSubmit(true);
    } else {
      setGameState('results');
    }
  }, [userAnswers, quizQuestions.length]);

  const confirmSubmit = useCallback(() => {
    setShowConfirmSubmit(false);
    setGameState('results');
  }, []);

  const cancelSubmit = useCallback(() => {
    setShowConfirmSubmit(false);
  }, []);

  const handleRetry = useCallback(() => {
    if (!originalVocabList) return;
    
    setGameState('loading');
    setLoadingMessage('Đang tạo lại bài kiểm tra...');
    
    setTimeout(() => {
      try {
        // Đảo vị trí từ vựng và tạo câu hỏi mới
        const shuffledVocab = shuffleArray(originalVocabList);
        const processedQuestions = buildQuiz(shuffledVocab, 'mixed'); // Luôn dùng mixed để đa dạng
        setQuizQuestions(processedQuestions);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setGameState('quiz');
      } catch (err) {
        setError('Có lỗi khi tạo lại bài kiểm tra.');
        setGameState('results');
      } finally {
        setLoadingMessage('');
      }
    }, 500);
  }, [originalVocabList, buildQuiz]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState !== 'quiz') return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (currentQuestionIndex > 0) {
            handleNavigate(currentQuestionIndex - 1);
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (currentQuestionIndex < quizQuestions.length - 1) {
            handleNavigate(currentQuestionIndex + 1);
          }
          break;
        case 'Enter':
          event.preventDefault();
          handleSubmit();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          event.preventDefault();
          const answerIndex = parseInt(event.key) - 1;
          const currentQuestion = quizQuestions[currentQuestionIndex];
          if (currentQuestion && currentQuestion.options[answerIndex]) {
            handleAnswer(currentQuestion.options[answerIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentQuestionIndex, quizQuestions.length, handleNavigate, handleSubmit, handleAnswer]);

  const goHome = useCallback(() => {
    setGameState('topic_selection');
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setError(null);
    setSelectedTopic('');
    setSelectedTopicName('');
    setCustomVocabList(null);
  }, []);

  const currentMaxLength = useMemo(() => {
    if (customVocabList) {
        return customVocabList.length;
    }
    const predefinedList = PREDEFINED_VOCAB_LISTS[selectedTopic];
    if (predefinedList) {
        return predefinedList.length;
    }
    return MAX_QUIZ_LENGTH;
  }, [selectedTopic, customVocabList]);

  const handleEditTopic = useCallback((topicName: string, vocabList: VocabularyPair[]) => {
    setEditingTopic({ name: topicName, vocabList });
    setGameState('edit_topic');
  }, []);

  const handleUpdateTopic = useCallback(async (topicName: string, vocabList: VocabularyPair[]) => {
    setError(null);
    setGameState('loading');
    setLoadingMessage('Đang cập nhật chủ đề...');

    try {
      console.log('Updating topic:', topicName, vocabList);
      
      const vocabWithPhonetics = await generatePhoneticsForVocabulary(vocabList);
      console.log('Generated phonetics:', vocabWithPhonetics);
      
      // Kiểm tra localStorage có hoạt động không
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
      } catch (localStorageError) {
        console.error('localStorage not available:', localStorageError);
        throw new Error('Trình duyệt không hỗ trợ lưu trữ cục bộ. Vui lòng thử lại.');
      }
      
      // Cập nhật trong localStorage
      const savedTopics = JSON.parse(localStorage.getItem('customTopics') || '{}');
      console.log('Current saved topics:', savedTopics);
      
      savedTopics[topicName] = vocabWithPhonetics;
      localStorage.setItem('customTopics', JSON.stringify(savedTopics));
      
      console.log('Saved topics after update:', JSON.parse(localStorage.getItem('customTopics') || '{}'));
      
      setEditingTopic(null);
      setGameState('saved_topics_manager');
      setLoadingMessage('');
    } catch (err) {
      console.error("Failed to update topic:", err);
      const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật chủ đề. Vui lòng thử lại.';
      setError(`Lỗi: ${errorMessage}`);
      setGameState('edit_topic');
    } finally {
      setLoadingMessage('');
    }
  }, []);

  const handleGenerateVietnamese = useCallback(async (englishWords: string[], contextDescription: string): Promise<VocabularyPair[]> => {
    try {
      return await generateVietnameseMeanings(englishWords, contextDescription);
    } catch (error) {
      console.error('Error generating Vietnamese meanings:', error);
      throw error;
    }
  }, []);

  const handleStartFlashcard = useCallback((topicName: string, vocabList: VocabularyPair[]) => {
    setFlashcardTopicName(topicName);
    setFlashcardVocabList(vocabList);
    setGameState('flashcard_setup');
  }, []);

  const handleStartFlashcardStudy = useCallback((selectedVocabList: VocabularyPair[], learningMode: 'en-vi' | 'vi-en') => {
    setFlashcardVocabList(selectedVocabList);
    setFlashcardLearningMode(learningMode);
    setGameState('flashcard');
  }, []);

  const renderContent = () => {
    if (gameState === 'quiz' || gameState === 'results') {
      return (
        <div className="w-full max-w-7xl h-full mx-auto flex flex-row items-stretch gap-8">
          <QuestionSidebar
            questions={quizQuestions}
            currentQuestionIndex={currentQuestionIndex}
            userAnswers={userAnswers}
            onNavigate={handleNavigate}
            isResultView={gameState === 'results'}
          />
          {gameState === 'quiz' && (
            <div className="flex-grow flex items-center gap-2 sm:gap-4">
              <button 
                onClick={() => handleNavigate(currentQuestionIndex - 1)} 
                disabled={currentQuestionIndex === 0} 
                className="p-3 rounded-full bg-white/60 backdrop-blur-sm shadow-md hover:bg-pink-100/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all" 
                aria-label="Câu trước"
                title="Câu trước (←)"
              >
                <Icon name="ArrowLeft" className="h-6 w-6 sm:h-8 sm:w-8 text-slate-600" />
              </button>
              <div className="w-full max-w-2xl flex flex-col gap-4 flex-grow">
                <QuizCard
                  question={quizQuestions[currentQuestionIndex]}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={quizQuestions.length}
                  onAnswer={handleAnswer}
                  userSelection={userAnswers[currentQuestionIndex]}
                  onNext={() => handleNavigate(currentQuestionIndex + 1)}
                  onPrevious={() => handleNavigate(currentQuestionIndex - 1)}
                />
                <div className="flex justify-center items-center">
                  <button 
                    onClick={handleSubmit} 
                    className="px-8 py-3 rounded-lg bg-pink-600 text-white font-bold hover:bg-pink-700 transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    title="Nộp bài (Enter)"
                  >
                    Nộp bài
                  </button>
                </div>
              </div>
              <button 
                onClick={() => handleNavigate(currentQuestionIndex + 1)} 
                disabled={currentQuestionIndex === quizQuestions.length - 1} 
                className="p-3 rounded-full bg-white/60 backdrop-blur-sm shadow-md hover:bg-pink-100/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all" 
                aria-label="Câu tiếp theo"
                title="Câu tiếp theo (→)"
              >
                <Icon name="ArrowRight" className="h-6 w-6 sm:h-8 sm:w-8 text-slate-600" />
              </button>
            </div>
          )}
          {gameState === 'results' && (
             <div className="flex-grow overflow-y-auto py-4 pr-2">
                 <ResultsScreen
                    questions={quizQuestions}
                    userAnswers={userAnswers}
                    onRetry={handleRetry}
                 />
             </div>
          )}
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center">
        {(() => {
            switch (gameState) {
                case 'topic_selection':
                    return (
                        <>
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 max-w-2xl mx-auto" role="alert">
                            <strong className="font-bold">Lỗi! </strong>
                            <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                        <TopicSelector onSelectTopic={(id, name) => handleTopicSelect(id, name)} />
                        </>
                    );
                case 'custom_topic_setup':
                    return <CustomTopicSetup onBack={goHome} onContinue={handleCustomTopicSubmit} onSaveAsTopic={handleSaveAsTopic} error={error} />;
                case 'keyword_generator_setup':
                    return <KeywordQuizGenerator onBack={goHome} onContinue={handleCustomTopicSubmit} onSaveAsTopic={handleSaveAsTopic} error={error} />;
                case 'saved_topics_manager':
                    return <SavedTopicsManager onBack={goHome} onSelectTopic={handleSelectSavedTopic} onEditTopic={handleEditTopic} onStartFlashcard={handleStartFlashcard} />;
                case 'edit_topic':
                    return editingTopic ? (
                       <EditTopic 
                         topicName={editingTopic.name} 
                         vocabList={editingTopic.vocabList} 
                         onBack={() => setGameState('saved_topics_manager')} 
                         onSave={handleUpdateTopic}
                         onGenerateVietnamese={handleGenerateVietnamese}
                       />
                     ) : <div>Loading...</div>;
                case 'quiz_setup':
                    return <QuizSetup 
                        topic={selectedTopicName} 
                        onStartQuiz={handleStartQuiz} 
                        onBack={goHome} 
                        maxLength={currentMaxLength}
                    />;
                case 'loading':
                    return (
                        <div className="text-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-lg text-slate-600">{loadingMessage}</p>
                        </div>
                    );
                case 'flashcard_setup':
                    return (
                        <FlashcardSetup
                            topicName={flashcardTopicName}
                            vocabList={flashcardVocabList}
                            onStart={handleStartFlashcardStudy}
                            onBack={() => setGameState('saved_topics_manager')}
                        />
                    );
                case 'flashcard':
                    return (
                        <Flashcard
                            vocabList={flashcardVocabList}
                            learningMode={flashcardLearningMode}
                            onBack={() => setGameState('saved_topics_manager')}
                        />
                    );
                default:
                    return null;
            }
        })()}
      </div>
    );
  };

  return (
    <main className={`min-h-screen w-full p-4 bg-gradient-to-br from-sky-50 to-pink-50 relative ${
      gameState === 'flashcard' ? 'flex items-start justify-center pt-8' : 'h-screen flex items-center justify-center'
    }`}>
      {['quiz_setup', 'quiz', 'results'].includes(gameState) && (
        <button 
          onClick={goHome} 
          className="absolute top-4 right-4 z-10 px-4 py-2 bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-lg text-slate-700 font-semibold hover:bg-white/90 hover:border-slate-300 transition-all shadow-md"
        >
          Trang chủ
        </button>
      )}
      {renderContent()}
      
      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Xác nhận nộp bài</h3>
            <p className="text-slate-600 mb-6">
              Bạn chưa trả lời hết tất cả câu hỏi. Bạn có chắc chắn muốn nộp bài không?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={cancelSubmit}
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 transition-colors"
              >
                Tiếp tục làm bài
              </button>
              <button 
                onClick={confirmSubmit}
                className="px-4 py-2 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700 transition-colors"
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;