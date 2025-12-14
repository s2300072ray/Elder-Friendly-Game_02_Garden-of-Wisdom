import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BigButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'neutral';
  className?: string;
  disabled?: boolean;
}

export const BigButton: React.FC<BigButtonProps> = ({ 
  onClick, 
  children, 
  icon, 
  variant = 'primary', 
  className = '',
  disabled = false
}) => {
  const baseStyle = "flex items-center justify-center gap-4 rounded-2xl transition-transform active:scale-95 shadow-md border-b-4 no-select";
  const sizeStyle = "py-6 px-8 text-2xl font-bold w-full md:w-auto min-w-[240px]";
  
  let colorStyle = "";
  
  switch(variant) {
    case 'primary':
      colorStyle = "bg-garden-green text-white border-garden-green-dark hover:bg-garden-green-dark";
      break;
    case 'secondary':
      colorStyle = "bg-garden-orange text-white border-yellow-700 hover:bg-yellow-600";
      break;
    case 'neutral':
      colorStyle = "bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300";
      break;
  }

  if (disabled) {
    colorStyle = "bg-stone-300 text-stone-500 border-stone-400 cursor-not-allowed active:scale-100";
  }

  return (
    <button 
      onClick={disabled ? undefined : onClick} 
      className={`${baseStyle} ${sizeStyle} ${colorStyle} ${className}`}
      disabled={disabled}
      aria-label={typeof children === 'string' ? children : 'Button'}
    >
      {icon && <span className="w-8 h-8">{icon}</span>}
      {children}
    </button>
  );
};

export const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="fixed top-4 left-4 p-4 bg-white rounded-full shadow-lg border-2 border-stone-200 hover:bg-stone-50 active:scale-95 transition-all z-50 flex items-center gap-2 text-xl font-bold text-stone-700"
    aria-label="Go Back to Menu"
  >
    <ArrowLeft size={32} />
    <span>Menu</span>
  </button>
);

export const FeedbackModal: React.FC<{ 
  isOpen: boolean; 
  title: string; 
  message: string; 
  fact?: string;
  onNext: () => void;
  onRetry?: () => void; 
}> = ({ isOpen, title, message, fact, onNext, onRetry }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-2xl border-4 border-garden-green animate-[fadeIn_0.3s_ease-out]">
        <h2 className="text-4xl font-bold text-garden-green-dark mb-6 text-center">{title}</h2>
        <p className="text-2xl text-stone-700 mb-6 text-center leading-relaxed">{message}</p>
        
        {fact && (
          <div className="bg-garden-cream p-6 rounded-xl border-2 border-garden-orange/30 mb-8">
            <p className="text-lg text-garden-dark italic text-center">
              <span className="font-bold not-italic block mb-2 text-garden-orange">🌿 Garden Wisdom:</span>
              "{fact}"
            </p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
          {onRetry && (
            <BigButton onClick={onRetry} variant="neutral">
              Try Again
            </BigButton>
          )}
          <BigButton onClick={onNext} variant="primary">
            Continue
          </BigButton>
        </div>
      </div>
    </div>
  );
};