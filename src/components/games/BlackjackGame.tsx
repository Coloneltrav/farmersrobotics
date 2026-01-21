import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { Database } from '@/integrations/supabase/types';

type Player = Database['public']['Tables']['players']['Row'];

interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
  numValue: number;
}

interface BlackjackGameProps {
  players: Player[];
  currentPlayer: Player | null;
  gameState: Record<string, unknown>;
  onUpdateState: (state: Record<string, unknown>) => void;
  isHost: boolean;
}

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
const VALUES = [
  { value: 'A', numValue: 11 },
  { value: '2', numValue: 2 },
  { value: '3', numValue: 3 },
  { value: '4', numValue: 4 },
  { value: '5', numValue: 5 },
  { value: '6', numValue: 6 },
  { value: '7', numValue: 7 },
  { value: '8', numValue: 8 },
  { value: '9', numValue: 9 },
  { value: '10', numValue: 10 },
  { value: 'J', numValue: 10 },
  { value: 'Q', numValue: 10 },
  { value: 'K', numValue: 10 },
];

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const { value, numValue } of VALUES) {
      deck.push({ suit, value, numValue });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
};

const calculateHand = (cards: Card[]): number => {
  let total = cards.reduce((sum, card) => sum + card.numValue, 0);
  let aces = cards.filter(c => c.value === 'A').length;
  
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  
  return total;
};

const getSuitSymbol = (suit: string) => {
  const symbols: Record<string, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  return symbols[suit] || '';
};

const getSuitColor = (suit: string) => {
  return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-foreground';
};

const PlayingCard = ({ card, hidden = false, delay = 0 }: { card: Card; hidden?: boolean; delay?: number }) => (
  <motion.div
    initial={{ x: 20, scale: 0.9 }}
    animate={{ x: 0, scale: 1 }}
    transition={{ duration: 0.3, delay }}
    className={`relative h-28 w-20 rounded-lg border-2 ${
      hidden ? 'bg-primary border-primary' : 'bg-white border-border'
    } card-shadow flex items-center justify-center`}
  >
    {hidden ? (
      <div className="text-primary-foreground text-2xl font-bold">?</div>
    ) : (
      <div className={`text-center ${getSuitColor(card.suit)}`}>
        <div className="text-2xl font-bold">{card.value}</div>
        <div className="text-3xl">{getSuitSymbol(card.suit)}</div>
      </div>
    )}
  </motion.div>
);

export const BlackjackGame = ({ players, currentPlayer, gameState, onUpdateState, isHost }: BlackjackGameProps) => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gamePhase, setGamePhase] = useState<'betting' | 'playing' | 'dealer' | 'finished'>('betting');
  const [result, setResult] = useState<string>('');
  const [currentTurn, setCurrentTurn] = useState(0);

  const initGame = useCallback(() => {
    const newDeck = createDeck();
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, newDeck.pop()!];
    
    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGamePhase('playing');
    setResult('');
    
    if (calculateHand(pHand) === 21) {
      finishGame(pHand, dHand, newDeck);
    }
  }, []);

  const hit = () => {
    if (gamePhase !== 'playing') return;
    
    const newCard = deck.pop()!;
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    setDeck([...deck]);
    
    const total = calculateHand(newHand);
    if (total > 21) {
      setResult('Bust! You lose.');
      setGamePhase('finished');
    } else if (total === 21) {
      stand();
    }
  };

  const stand = () => {
    setGamePhase('dealer');
    let currentDealerHand = [...dealerHand];
    let currentDeck = [...deck];
    
    while (calculateHand(currentDealerHand) < 17) {
      currentDealerHand.push(currentDeck.pop()!);
    }
    
    setDealerHand(currentDealerHand);
    setDeck(currentDeck);
    
    finishGame(playerHand, currentDealerHand, currentDeck);
  };

  const finishGame = (pHand: Card[], dHand: Card[], _deck: Card[]) => {
    const playerTotal = calculateHand(pHand);
    const dealerTotal = calculateHand(dHand);
    
    setTimeout(() => {
      if (playerTotal > 21) {
        setResult('Bust! You lose.');
      } else if (dealerTotal > 21) {
        setResult('Dealer busts! You win!');
      } else if (playerTotal > dealerTotal) {
        setResult('You win!');
      } else if (dealerTotal > playerTotal) {
        setResult('Dealer wins.');
      } else {
        setResult('Push - It\'s a tie!');
      }
      setGamePhase('finished');
    }, 500);
  };

  useEffect(() => {
    if (gameState.started && gamePhase === 'betting') {
      initGame();
    }
  }, [gameState.started, gamePhase, initGame]);

  const activePlayer = players[currentTurn];

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Dealer Section */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-muted-foreground mb-4">Dealer</h3>
        <div className="flex gap-3 justify-center min-h-28">
          {dealerHand.map((card, i) => (
            <PlayingCard 
              key={i} 
              card={card} 
              hidden={i === 1 && gamePhase === 'playing'} 
              delay={i * 0.2}
            />
          ))}
        </div>
        {gamePhase !== 'playing' && dealerHand.length > 0 && (
          <p className="mt-2 text-foreground font-semibold">
            Total: {calculateHand(dealerHand)}
          </p>
        )}
      </div>

      {/* Result Display */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-2xl font-display font-bold ${
            result.includes('win') ? 'text-primary' : result.includes('lose') || result.includes('Bust') ? 'text-destructive' : 'text-foreground'
          }`}
        >
          {result}
        </motion.div>
      )}

      {/* Player Section */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-muted-foreground mb-4">
          {activePlayer?.name || 'Your Hand'}
        </h3>
        <div className="flex gap-3 justify-center min-h-28">
          {playerHand.map((card, i) => (
            <PlayingCard key={i} card={card} delay={i * 0.2 + 0.4} />
          ))}
        </div>
        {playerHand.length > 0 && (
          <p className="mt-2 text-foreground font-semibold">
            Total: {calculateHand(playerHand)}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {gamePhase === 'betting' && (
          <Button
            onClick={initGame}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
          >
            Deal Cards
          </Button>
        )}
        
        {gamePhase === 'playing' && (
          <>
            <Button
              onClick={hit}
              className="bg-emerald text-foreground hover:bg-emerald/90 px-8"
            >
              Hit
            </Button>
            <Button
              onClick={stand}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10 px-8"
            >
              Stand
            </Button>
          </>
        )}
        
        {gamePhase === 'finished' && (
          <Button
            onClick={() => {
              setGamePhase('betting');
              setPlayerHand([]);
              setDealerHand([]);
              setResult('');
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
          >
            New Hand
          </Button>
        )}
      </div>
    </div>
  );
};
