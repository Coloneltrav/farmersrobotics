import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Database } from '@/integrations/supabase/types';

type Player = Database['public']['Tables']['players']['Row'];

interface HangmanGameProps {
  players: Player[];
  currentPlayer: Player | null;
  gameState: Record<string, unknown>;
  onUpdateState: (state: Record<string, unknown>) => void;
  isHost: boolean;
}

const WORDS = [
  'JAVASCRIPT', 'PROGRAMMING', 'DEVELOPER', 'COMPUTER', 'ALGORITHM',
  'DATABASE', 'INTERFACE', 'FUNCTION', 'VARIABLE', 'KEYBOARD',
  'MONITOR', 'NETWORK', 'SOFTWARE', 'HARDWARE', 'INTERNET',
  'BROWSER', 'WEBSITE', 'APPLICATION', 'FRAMEWORK', 'LIBRARY'
];

const HANGMAN_PARTS = [
  // Head
  <circle key="head" cx="200" cy="80" r="25" stroke="currentColor" strokeWidth="3" fill="none" />,
  // Body
  <line key="body" x1="200" y1="105" x2="200" y2="180" stroke="currentColor" strokeWidth="3" />,
  // Left arm
  <line key="leftArm" x1="200" y1="130" x2="160" y2="160" stroke="currentColor" strokeWidth="3" />,
  // Right arm
  <line key="rightArm" x1="200" y1="130" x2="240" y2="160" stroke="currentColor" strokeWidth="3" />,
  // Left leg
  <line key="leftLeg" x1="200" y1="180" x2="160" y2="230" stroke="currentColor" strokeWidth="3" />,
  // Right leg
  <line key="rightLeg" x1="200" y1="180" x2="240" y2="230" stroke="currentColor" strokeWidth="3" />,
];

export const HangmanGame = ({ players, currentPlayer, gameState, onUpdateState, isHost }: HangmanGameProps) => {
  const [word, setWord] = useState('');
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing' | 'won' | 'lost'>('setup');
  const [customWord, setCustomWord] = useState('');
  const [currentGuesser, setCurrentGuesser] = useState(0);

  const startWithRandomWord = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(randomWord);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGamePhase('playing');
    
    onUpdateState({
      ...gameState,
      word: randomWord,
      guessedLetters: [],
      wrongGuesses: 0,
      phase: 'playing'
    });
  };

  const startWithCustomWord = () => {
    if (customWord.length < 3) return;
    const cleanWord = customWord.toUpperCase().replace(/[^A-Z]/g, '');
    setWord(cleanWord);
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setGamePhase('playing');
    setCustomWord('');
    
    onUpdateState({
      ...gameState,
      word: cleanWord,
      guessedLetters: [],
      wrongGuesses: 0,
      phase: 'playing'
    });
  };

  const guessLetter = (letter: string) => {
    if (guessedLetters.has(letter) || gamePhase !== 'playing') return;
    
    const newGuessed = new Set(guessedLetters).add(letter);
    setGuessedLetters(newGuessed);
    
    if (!word.includes(letter)) {
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      
      if (newWrong >= 6) {
        setGamePhase('lost');
      }
      
      // Next player's turn
      setCurrentGuesser((prev) => (prev + 1) % players.length);
    } else {
      // Check for win
      const allLettersGuessed = word.split('').every(l => newGuessed.has(l));
      if (allLettersGuessed) {
        setGamePhase('won');
      }
    }
    
    onUpdateState({
      ...gameState,
      guessedLetters: Array.from(newGuessed),
      wrongGuesses: wrongGuesses + (!word.includes(letter) ? 1 : 0),
      phase: gamePhase
    });
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const guessingPlayer = players[currentGuesser];

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {gamePhase === 'setup' && (
        <div className="text-center space-y-6 max-w-md">
          <h2 className="font-display text-2xl text-foreground">Start Hangman</h2>
          
          <div className="space-y-4">
            <Button
              onClick={startWithRandomWord}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Random Word
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={customWord}
                onChange={(e) => setCustomWord(e.target.value)}
                placeholder="Enter custom word"
                className="bg-secondary border-border"
                maxLength={15}
              />
              <Button
                onClick={startWithCustomWord}
                disabled={customWord.length < 3}
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
              >
                Use
              </Button>
            </div>
          </div>
        </div>
      )}

      {gamePhase !== 'setup' && (
        <>
          {/* Hangman Figure */}
          <div className="relative">
            <svg width="280" height="280" className="text-foreground">
              {/* Gallows */}
              <line x1="40" y1="260" x2="160" y2="260" stroke="currentColor" strokeWidth="4" />
              <line x1="100" y1="260" x2="100" y2="20" stroke="currentColor" strokeWidth="4" />
              <line x1="100" y1="20" x2="200" y2="20" stroke="currentColor" strokeWidth="4" />
              <line x1="200" y1="20" x2="200" y2="55" stroke="currentColor" strokeWidth="3" />
              
              {/* Hangman parts based on wrong guesses */}
              {HANGMAN_PARTS.slice(0, wrongGuesses)}
            </svg>
          </div>

          {/* Current Guesser */}
          {gamePhase === 'playing' && guessingPlayer && (
            <p className="text-muted-foreground">
              <span className="text-primary font-semibold">{guessingPlayer.name}</span>'s turn to guess
            </p>
          )}

          {/* Word Display */}
          <div className="flex gap-3 justify-center flex-wrap">
            {word.split('').map((letter, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="w-12 h-14 border-b-4 border-primary flex items-center justify-center"
              >
                <span className={`text-3xl font-display font-bold ${
                  guessedLetters.has(letter) ? 'text-foreground' : 'text-transparent'
                }`}>
                  {guessedLetters.has(letter) || gamePhase === 'lost' ? letter : '_'}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Game Result */}
          {(gamePhase === 'won' || gamePhase === 'lost') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <p className={`text-2xl font-display font-bold mb-4 ${
                gamePhase === 'won' ? 'text-primary' : 'text-destructive'
              }`}>
                {gamePhase === 'won' ? '🎉 You Won!' : '💀 Game Over!'}
              </p>
              {gamePhase === 'lost' && (
                <p className="text-muted-foreground">
                  The word was: <span className="text-foreground font-bold">{word}</span>
                </p>
              )}
              <Button
                onClick={() => setGamePhase('setup')}
                className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Play Again
              </Button>
            </motion.div>
          )}

          {/* Letter Keyboard */}
          {gamePhase === 'playing' && (
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {alphabet.map((letter) => {
                const isGuessed = guessedLetters.has(letter);
                const isCorrect = isGuessed && word.includes(letter);
                const isWrong = isGuessed && !word.includes(letter);
                
                return (
                  <Button
                    key={letter}
                    onClick={() => guessLetter(letter)}
                    disabled={isGuessed}
                    variant="outline"
                    className={`w-10 h-10 p-0 font-bold transition-all ${
                      isCorrect ? 'bg-emerald text-foreground border-emerald' :
                      isWrong ? 'bg-destructive/20 text-destructive border-destructive/50' :
                      'border-border hover:border-primary hover:text-primary'
                    }`}
                  >
                    {letter}
                  </Button>
                );
              })}
            </div>
          )}

          {/* Wrong Guesses Counter */}
          <p className="text-muted-foreground text-sm">
            Wrong guesses: <span className="text-destructive font-bold">{wrongGuesses}</span> / 6
          </p>
        </>
      )}
    </div>
  );
};
