import { useState } from 'react';
import { motion } from 'framer-motion';
import { Spade, Heart, Diamond, Type, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameCard } from '@/components/GameCard';
import { CreateRoomDialog } from '@/components/CreateRoomDialog';
import { JoinRoomDialog } from '@/components/JoinRoomDialog';

const GAMES = [
  {
    id: 'blackjack',
    title: 'Blackjack',
    description: 'Beat the dealer by getting as close to 21 as possible without going over.',
    icon: Spade,
    players: '1-8 players',
  },
  {
    id: 'poker',
    title: 'Poker',
    description: 'Test your skills in Texas Hold\'em. Bluff, bet, and win big.',
    icon: Heart,
    players: '2-8 players',
  },
  {
    id: 'uno',
    title: 'UNO',
    description: 'Match colors and numbers. Don\'t forget to call UNO!',
    icon: Diamond,
    players: '2-10 players',
  },
  {
    id: 'hangman',
    title: 'Hangman',
    description: 'Guess the word letter by letter before the hangman is complete.',
    icon: Type,
    players: '2-6 players',
  },
];

const Index = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId);
    setShowCreateDialog(true);
  };

  const selectedGameData = GAMES.find(g => g.id === selectedGame);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-dark/50 via-background to-background" />
        
        {/* Animated glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        
        <div className="relative container mx-auto px-4 py-20 lg:py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6">
              <span className="text-foreground">Game</span>
              <span className="text-gradient-gold"> Night</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Play classic card games and word games with friends. No downloads, no sign-ups — 
              just share a link and start playing.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={() => setShowJoinDialog(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg px-8 py-6 glow-gold"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Join a Room
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Games Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Choose Your Game
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Select a game to create a new room. Your friends can join using the room code.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {GAMES.map((game, index) => (
            <GameCard
              key={game.id}
              title={game.title}
              description={game.description}
              icon={game.icon}
              players={game.players}
              onClick={() => handleGameSelect(game.id)}
              delay={index * 0.1}
            />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { step: '01', title: 'Pick a Game', desc: 'Choose from our collection of classic games' },
            { step: '02', title: 'Share the Link', desc: 'Send the room link to your friends' },
            { step: '03', title: 'Play Together', desc: 'Everyone joins and the fun begins!' },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-5xl font-display font-bold text-primary/30 mb-4">
                {item.step}
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-muted-foreground">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built for fun • No account required • Play instantly</p>
        </div>
      </footer>

      {/* Dialogs */}
      <CreateRoomDialog
        isOpen={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setSelectedGame(null);
        }}
        gameType={selectedGame || ''}
        gameTitle={selectedGameData?.title || ''}
      />

      <JoinRoomDialog
        isOpen={showJoinDialog}
        onClose={() => setShowJoinDialog(false)}
      />
    </div>
  );
};

export default Index;
