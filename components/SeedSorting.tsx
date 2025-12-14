import React, { useState, useEffect, useRef } from 'react';
import { Flower, Star } from 'lucide-react'; // Using icons as placeholders for seeds/flowers
import { FeedbackModal } from './UI';
import { getEncouragement } from '../services/geminiService';
import { FeedbackData } from '../types';

interface Item {
  id: number;
  type: 'sun' | 'water' | 'seed';
  x: number;
  y: number;
  completed: boolean;
}

const TYPES = [
  { type: 'sun', color: 'text-yellow-500', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-400', label: 'Sunlight' },
  { type: 'water', color: 'text-blue-500', bgColor: 'bg-blue-100', borderColor: 'border-blue-400', label: 'Water' },
  { type: 'seed', color: 'text-stone-600', bgColor: 'bg-stone-200', borderColor: 'border-stone-400', label: 'Seeds' },
] as const;

export const SeedSorting: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  
  // Dragging state
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    startRound();
  }, []);

  const startRound = () => {
    // Create 6 items to sort
    const newItems: Item[] = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      type: TYPES[i % 3].type,
      x: 50 + (i * 100) % 300, // Staggered initial positions (roughly)
      y: 50,
      completed: false
    }));
    setItems(newItems);
    setScore(0);
  };

  // --- Mouse / Touch Event Handlers ---

  const handleStart = (e: React.MouseEvent | React.TouchEvent, id: number) => {
    const item = items.find(i => i.id === id);
    if (!item || item.completed) return;
    
    // Prevent scrolling on touch
    if (e.type === 'touchstart') {
      // e.preventDefault(); // Sometimes needed, but can block necessary behavior. 
    }

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    // Calculate offset so the item doesn't snap to center of mouse
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Item visual coordinates are relative to container
        // We need to approximate where the click was relative to the item's current pos
        // For simplicity in this non-physics engine, we'll just snap slightly or center
        dragOffset.current = { x: 0, y: 0 }; 
    }
    
    setDraggedItem(id);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggedItem === null || !containerRef.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left - 32; // -32 for half width (approx)
    const y = clientY - rect.top - 32;

    setItems(prev => prev.map(item => 
      item.id === draggedItem ? { ...item, x, y } : item
    ));
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (draggedItem === null) return;
    
    checkDrop(draggedItem);
    setDraggedItem(null);
  };

  const checkDrop = async (id: number) => {
    const item = items.find(i => i.id === id);
    if (!item || !containerRef.current) return;

    // Define drop zones (percentages of width/height logic for simplicity)
    // Zones are at the bottom: 0-33%, 33-66%, 66-100%
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    
    // Drop zone Y threshold (bottom 150px)
    const dropZoneY = containerHeight - 180; 

    if (item.y > dropZoneY) {
        const xPercent = item.x / containerWidth;
        let droppedZoneIndex = -1;

        if (xPercent < 0.33) droppedZoneIndex = 0; // Left
        else if (xPercent < 0.66) droppedZoneIndex = 1; // Middle
        else droppedZoneIndex = 2; // Right

        if (droppedZoneIndex !== -1) {
            const targetType = TYPES[droppedZoneIndex].type;
            if (item.type === targetType) {
                // Correct match
                setItems(prev => prev.map(i => i.id === id ? { ...i, completed: true } : i));
                const newScore = score + 1;
                setScore(newScore);

                if (newScore === items.length) {
                    const data = await getEncouragement("Garden Sorting", 100, true);
                    setFeedback(data);
                }
            } else {
                // Incorrect: Bounce back (simple reset Y)
                setItems(prev => prev.map(i => i.id === id ? { ...i, y: 50 } : i));
            }
        }
    }
  };

  return (
    <div 
      className="flex flex-col items-center min-h-screen bg-garden-cream p-4 overflow-hidden touch-none"
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <div className="mb-4 text-center z-10">
        <h1 className="text-3xl font-bold text-garden-green-dark">Garden Sorting</h1>
        <p className="text-lg text-stone-600">Drag items to their matching baskets below.</p>
      </div>

      <div 
        ref={containerRef}
        className="relative flex-grow w-full max-w-4xl border-4 border-dashed border-garden-green/30 rounded-3xl bg-white/50 mb-4"
      >
        {/* Drop Zones */}
        <div className="absolute bottom-0 left-0 w-full h-40 flex border-t-4 border-garden-green/20">
            {TYPES.map((t, idx) => (
                <div key={t.type} className={`flex-1 flex flex-col items-center justify-center border-r-2 last:border-r-0 border-garden-green/20 ${t.bgColor} opacity-80`}>
                    <div className={`p-4 rounded-full border-4 bg-white ${t.borderColor} ${t.color}`}>
                        {t.type === 'sun' && <Star size={40} />}
                        {t.type === 'water' && <Flower size={40} className="text-blue-500" />} {/* Reusing Flower for water/nature generic */}
                        {t.type === 'seed' && <div className="w-10 h-10 rounded-full bg-stone-600" />}
                    </div>
                    <span className="mt-2 text-xl font-bold text-stone-700">{t.label}</span>
                </div>
            ))}
        </div>

        {/* Draggable Items */}
        {items.map((item) => {
           if (item.completed) return null;
           
           const typeData = TYPES.find(t => t.type === item.type);
           const isDragging = draggedItem === item.id;

           return (
             <div
                key={item.id}
                onMouseDown={(e) => handleStart(e, item.id)}
                onTouchStart={(e) => handleStart(e, item.id)}
                style={{ 
                    position: 'absolute', 
                    left: item.x, 
                    top: item.y,
                    zIndex: isDragging ? 50 : 10,
                    cursor: 'grab'
                }}
                className={`
                    w-20 h-20 rounded-full border-4 shadow-lg flex items-center justify-center bg-white transition-transform
                    ${isDragging ? 'scale-110 shadow-2xl cursor-grabbing' : ''}
                    ${typeData?.borderColor}
                `}
             >
                <div className={typeData?.color}>
                    {item.type === 'sun' && <Star size={32} />}
                    {item.type === 'water' && <Flower size={32} className="text-blue-500" />}
                    {item.type === 'seed' && <div className="w-8 h-8 rounded-full bg-stone-600" />}
                </div>
             </div>
           );
        })}
      </div>

      <FeedbackModal 
        isOpen={!!feedback}
        title="Well Sorted!"
        message={feedback?.message || ""}
        fact={feedback?.fact}
        onNext={onComplete}
        onRetry={() => {
          setFeedback(null);
          startRound();
        }}
      />
    </div>
  );
};