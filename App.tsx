import React, { useState } from 'react';
import { PatternPetals } from './components/PatternPetals';
import { LeafPairs } from './components/LeafPairs';
import { SeedSorting } from './components/SeedSorting';
import { BigButton, BackButton } from './components/UI';
import { Flower, Sprout, Wind } from 'lucide-react';
import { GameScreen } from './types';

function App() {
  const [screen, setScreen] = useState<GameScreen>(GameScreen.MENU);

  const renderScreen = () => {
    switch(screen) {
      case GameScreen.SIMON:
        return <PatternPetals onComplete={() => setScreen(GameScreen.MENU)} />;
      case GameScreen.MATCH:
        return <LeafPairs onComplete={() => setScreen(GameScreen.MENU)} />;
      case GameScreen.SORT:
        return <SeedSorting onComplete={() => setScreen(GameScreen.MENU)} />;
      case GameScreen.MENU:
      default:
        return (
          <div className="min-h-screen bg-garden-cream flex flex-col items-center justify-center p-6">
            <header className="text-center mb-12">
              <h1 className="text-5xl font-bold text-garden-green-dark mb-4 drop-shadow-sm">
                Garden of Wisdom
              </h1>
              <p className="text-2xl text-stone-600 max-w-xl mx-auto leading-relaxed">
                Welcome. Choose a gentle activity to exercise your mind and hands.
              </p>
            </header>

            <div className="flex flex-col gap-6 w-full max-w-md">
              <BigButton 
                onClick={() => setScreen(GameScreen.SIMON)}
                icon={<Flower />}
                variant="primary"
              >
                Pattern Petals
                <span className="block text-sm font-normal opacity-90 mt-1">Memory Sequence</span>
              </BigButton>

              <BigButton 
                onClick={() => setScreen(GameScreen.MATCH)}
                icon={<Sprout />}
                variant="secondary"
              >
                Leaf Pairs
                <span className="block text-sm font-normal opacity-90 mt-1">Find Matches</span>
              </BigButton>

              <BigButton 
                onClick={() => setScreen(GameScreen.SORT)}
                icon={<Wind />}
                variant="primary"
                className="bg-garden-blue border-blue-700 hover:bg-blue-600"
              >
                Garden Sorting
                <span className="block text-sm font-normal opacity-90 mt-1">Organize Items</span>
              </BigButton>
            </div>

            <footer className="mt-16 text-stone-500 text-lg">
              Take your time. There is no rush in this garden.
            </footer>
          </div>
        );
    }
  };

  return (
    <div className="antialiased font-sans text-stone-800">
      {screen !== GameScreen.MENU && (
        <BackButton onClick={() => setScreen(GameScreen.MENU)} />
      )}
      {renderScreen()}
    </div>
  );
}

export default App;