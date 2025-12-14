import React, { useState, useEffect, useRef } from 'react';
import { Flower } from 'lucide-react';
import { BigButton, FeedbackModal } from './UI';
import { getEncouragement } from '../services/geminiService';
import { FeedbackData } from '../types';

interface PatternPetalsProps {
  onComplete: () => void;
}

const COLORS = [
  'text-red-500', 
  'text-blue-500', 
  'text-yellow-500', 
  'text-purple-500'
];

const BG_COLORS = [
  'bg-red-100',
  'bg-blue-100',
  'bg-yellow-100',
  'bg-purple-100'
];

export const PatternPetals: React.FC<PatternPetalsProps> = ({ onComplete }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [activeLight, setActiveLight] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'WIN' | 'LOSE'>('IDLE');

  const MAX_ROUNDS = 4;

  // Start game
  useEffect(() => {
    startNewRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewRound = () => {
    setPlayerSequence([]);
    const nextColor = Math.floor(Math.random() * 4);
    const newSequence = [...sequence, nextColor];
    setSequence(newSequence);
    setGameState('PLAYING');
    playSequence(newSequence);
  };

  const playSequence = async (seq: number[]) => {
    setIsPlayingSequence(true);
    // Initial delay
    await new Promise(r => setTimeout(r, 1000));

    for (let i = 0; i < seq.length; i++) {
      setActiveLight(seq[i]);
      // Play sound here if implemented
      await new Promise(r => setTimeout(r, 800)); // Light duration
      setActiveLight(null);
      await new Promise(r => setTimeout(r, 400)); // Gap
    }
    setIsPlayingSequence(false);
  };

  const handlePetalClick = (index: number) => {
    if (isPlayingSequence || gameState !== 'PLAYING') return;

    // Flash the clicked light briefly
    setActiveLight(index);
    setTimeout(() => setActiveLight(null), 300);

    const newPlayerSeq = [...playerSequence, index];
    setPlayerSequence(newPlayerSeq);

    // Check logic
    const currentIndex = newPlayerSeq.length - 1;
    if (newPlayerSeq[currentIndex] !== sequence[currentIndex]) {
      handleGameOver(false);
      return;
    }

    if (newPlayerSeq.length === sequence.length) {
      if (round >= MAX_ROUNDS) {
        handleGameOver(true);
      } else {
        setRound(r => r + 1);
        setTimeout(startNewRound, 1000);
      }
    }
  };

  const handleGameOver = async (won: boolean) => {
    setGameState(won ? 'WIN' : 'LOSE');
    const data = await getEncouragement("Pattern Petals", round, won);
    setFeedback(data);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-garden-cream p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-garden-green-dark mb-2">Pattern Petals</h1>
        <p className="text-xl text-stone-600">Watch the flowers bloom, then tap them in the same order.</p>
        <p className="text-2xl font-bold mt-4 text-garden-orange">Round: {round} / {MAX_ROUNDS}</p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-12">
        {COLORS.map((colorClass, index) => (
          <button
            key={index}
            onClick={() => handlePetalClick(index)}
            disabled={isPlayingSequence}
            className={`
              w-32 h-32 md:w-48 md:h-48 rounded-3xl border-4 
              flex items-center justify-center transition-all duration-200
              ${activeLight === index 
                ? `${BG_COLORS[index]} scale-105 shadow-xl border-stone-800` 
                : 'bg-white border-stone-200 shadow-md hover:border-stone-400'}
            `}
            aria-label={`Flower ${index + 1}`}
          >
            <Flower 
              size={80} 
              className={`transition-all duration-200 ${activeLight === index ? colorClass : 'text-stone-300'}`} 
            />
          </button>
        ))}
      </div>

      <div className="h-16">
        {isPlayingSequence && (
          <span className="text-2xl font-bold text-garden-blue animate-pulse">Watch closely...</span>
        )}
        {!isPlayingSequence && gameState === 'PLAYING' && (
          <span className="text-2xl font-bold text-garden-green">Your turn!</span>
        )}
      </div>

      <FeedbackModal 
        isOpen={!!feedback}
        title={feedback?.isPositive ? "Bloom Complete!" : "Good Try!"}
        message={feedback?.message || ""}
        fact={feedback?.fact}
        onNext={onComplete}
        onRetry={() => {
          setFeedback(null);
          setSequence([]);
          setRound(1);
          setPlayerSequence([]);
          setTimeout(() => startNewRound(), 500);
        }}
      />
    </div>
  );
};