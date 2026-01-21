import { motion } from 'framer-motion';
import { Users, Clock, Sparkles } from 'lucide-react';

export const PokerGame = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-10 w-10 text-primary animate-pulse" />
      </div>
      
      <h2 className="font-display text-3xl font-bold text-foreground mb-4">
        Poker Coming Soon
      </h2>
      
      <p className="text-muted-foreground max-w-md mb-8">
        We're crafting the ultimate Texas Hold'em experience. Get ready for betting rounds, 
        bluffs, and big wins!
      </p>
      
      <div className="flex gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>2-8 players</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>~30 min games</span>
        </div>
      </div>
    </motion.div>
  );
};
