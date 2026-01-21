import { motion } from 'framer-motion';
import { Crown, User } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Player = Database['public']['Tables']['players']['Row'];

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string;
}

export const PlayerList = ({ players, currentPlayerId }: PlayerListProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
        Players ({players.length})
      </h3>
      <div className="space-y-2">
        {players.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-3 rounded-lg p-3 ${
              player.id === currentPlayerId 
                ? 'bg-primary/10 border border-primary/30' 
                : 'bg-secondary/50'
            }`}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              {player.is_host ? (
                <Crown className="h-5 w-5 text-primary" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {player.name}
                {player.id === currentPlayerId && (
                  <span className="ml-2 text-xs text-primary">(You)</span>
                )}
              </p>
              {player.is_host && (
                <p className="text-xs text-primary">Host</p>
              )}
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};
