import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameRoom } from '@/hooks/useGameRoom';

interface CreateRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: string;
  gameTitle: string;
}

export const CreateRoomDialog = ({ isOpen, onClose, gameType, gameTitle }: CreateRoomDialogProps) => {
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { createRoom } = useGameRoom();

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    
    setIsCreating(true);
    const roomCode = await createRoom(gameType, playerName.trim());
    
    if (roomCode) {
      navigate(`/room/${roomCode}`);
    }
    setIsCreating(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 card-shadow"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              Create {gameTitle} Room
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Enter your name to create a new game room
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Your Name
                </label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your display name"
                  className="bg-secondary border-border focus:border-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  maxLength={20}
                />
              </div>

              <Button
                onClick={handleCreate}
                disabled={!playerName.trim() || isCreating}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Room'
                )}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
