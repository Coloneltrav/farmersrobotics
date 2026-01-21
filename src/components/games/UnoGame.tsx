import { motion } from 'framer-motion';
import { Users, Clock, Sparkles } from 'lucide-react';

export const UnoGame = () => {
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
        UNO Coming Soon
      </h2>
      
      <p className="text-muted-foreground max-w-md mb-8">
        The classic card game is on its way! Stack cards, shout UNO, and challenge your friends 
        to colorful chaos.
      </p>
      
      <div className="flex gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>2-10 players</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>~15 min games</span>
        </div>
      </div>
    </motion.div>
  );
};
