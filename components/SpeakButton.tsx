
import React from 'react';
import Icon from './Icon';

interface SpeakButtonProps {
  textToSpeak: string;
  className?: string;
}

const SpeakButton: React.FC<SpeakButtonProps> = ({ textToSpeak, className }) => {
  const handleSpeak = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering other click events, e.g., on a parent button or card

    if (!('speechSynthesis' in window)) {
      alert('Sorry, your browser does not support text-to-speech.');
      return;
    }
    
    // Create a new speech utterance
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'en-US'; // Set the language to US English for best pronunciation
    utterance.rate = 0.9;     // Slightly slower for better clarity for learners
    
    // Stop any currently speaking utterance and speak the new one
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={handleSpeak}
      className={`p-2 rounded-full hover:bg-slate-200/70 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 ${className}`}
      aria-label={`Listen to the pronunciation of "${textToSpeak}"`}
    >
      <Icon name="Volume2" className="h-5 w-5 text-slate-500" />
    </button>
  );
};

export default SpeakButton;
