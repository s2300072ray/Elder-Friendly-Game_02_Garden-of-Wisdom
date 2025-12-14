import React, { useState, useEffect } from 'react';
import { Leaf, Sprout, Sun, Cloud, Droplets, Bug } from 'lucide-react';
import { FeedbackModal } from './UI';
import { getEncouragement } from '../services/geminiService';
import { FeedbackData } from '../types';

interface Card {
  id: number;
  iconId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

const ICONS = [
  { id: 1, component: <Leaf size={40} />, color: 'text-green-600', label: 'Leaf' },
  { id: 2, component: <Sprout size={40} />, color: 'text-lime-600', label: 'Sprout' },
  { id: 3, component: <Sun size={40} />, color: 'text-yellow-500', label: 'Sun' },
  { id: 4, component: <Cloud size={40} />, color: 'text-blue-400', label: 'Cloud' },
  { id: 5, component: <Droplets size={40} />, color: 'text-blue-600', label: 'Rain' },
  { id: 6, component: <Bug size={40} />, color: 'text-red-500', label: 'Ladybug' },
];

export const LeafPairs: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]); // Store indices
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize Game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Duplicate icons to create pairs
    const pairs = [...ICONS, ...ICONS];
    
    // Shuffle
    const shuffled = pairs
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }, index) => ({
        id: index,
        iconId: value.id,
        isFlipped: false,
        isMatched: false
      }));

    setCards(shuffled);
    setFlippedCards([]);
    setIsProcessing(false);
  };

  const handleCardClick = (index: number) => {
    // Ignore if processing (waiting for match check), card is already flipped, or matched
    if (isProcessing || cards[index].isFlipped || cards[index].isMatched) return;

    // Flip the card
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    // Check for match if 2 cards are flipped
    if (newFlipped.length === 2) {
      checkForMatch(newFlipped, newCards);
    }
  };

  const checkForMatch = (currentFlipped: number[], currentCards: Card[]) => {
    setIsProcessing(true);
    const [firstIndex, secondIndex] = currentFlipped;
    const card1 = currentCards[firstIndex];
    const card2 = currentCards[secondIndex];

    if (card1.iconId === card2.iconId) {
      // Match found
      setTimeout(async () => {
        const matchedCards = currentCards.map(c => 
          c.id === card1.id || c.id === card2.id ? { ...c, isMatched: true } : c
        );
        setCards(matchedCards);
        setFlippedCards([]);
        setIsProcessing(false);

        // Check Win Condition
        if (matchedCards.every(c => c.isMatched)) {
          const data = await getEncouragement("Leaf Pairs", 100, true);
          setFeedback(data);
        }
      }, 500);
    } else {
      // No match
      setTimeout(() => {
        const resetCards = currentCards.map(c => 
          c.id === card1.id || c.id === card2.id ? { ...c, isFlipped: false } : c
        );
        setCards(resetCards);
        setFlippedCards([]);
        setIsProcessing(false);
      }, 1500); // Give user time to see the cards
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-garden-cream p-4">
      <div className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-garden-green-dark mb-2">Leaf Pairs</h1>
        <p className="text-lg md:text-xl text-stone-600">Find the matching pairs. Take your time.</p>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl w-full">
        {cards.map((card, index) => {
          const iconData = ICONS.find(i => i.id === card.iconId);
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`
                aspect-square rounded-2xl border-4 transition-all duration-500 transform perspective-1000
                flex items-center justify-center shadow-md
                ${card.isFlipped || card.isMatched 
                  ? 'bg-white border-garden-green rotate-y-180' 
                  : 'bg-garden-green-dark border-garden-dark hover:bg-garden-green'}
                ${card.isMatched ? 'opacity-50' : 'opacity-100'}
              `}
              aria-label={card.isFlipped || card.isMatched ? iconData?.label : "Hidden Card"}
              disabled={card.isMatched}
            >
              {(card.isFlipped || card.isMatched) ? (
                <div className={`${iconData?.color} animate-[fadeIn_0.3s_ease-out]`}>
                  {iconData?.component}
                </div>
              ) : (
                <div className="text-white/20">
                  <Leaf size={32} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <FeedbackModal 
        isOpen={!!feedback}
        title="Garden Completed!"
        message={feedback?.message || ""}
        fact={feedback?.fact}
        onNext={onComplete}
        onRetry={() => {
          setFeedback(null);
          initializeGame();
        }}
      />
    </div>
  );
};