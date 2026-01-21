import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ArrowLeft, Play, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameRoom } from '@/hooks/useGameRoom';
import { PlayerList } from '@/components/PlayerList';
import { BlackjackGame } from '@/components/games/BlackjackGame';
import { PokerGame } from '@/components/games/PokerGame';
import { UnoGame } from '@/components/games/UnoGame';
import { HangmanGame } from '@/components/games/HangmanGame';
import { JoinRoomDialog } from '@/components/JoinRoomDialog';

const GAME_NAMES: Record<string, string> = {
  blackjack: 'Blackjack',
  poker: 'Poker',
  uno: 'UNO',
  hangman: 'Hangman',
};

const GameRoom = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  
  const { 
    room, 
    players, 
    currentPlayer, 
    loading, 
    error,
    isHost,
    startGame,
    updateGameState,
    leaveRoom
  } = useGameRoom(code);

  useEffect(() => {
    if (!loading && room && !currentPlayer) {
      setShowJoinDialog(true);
    }
  }, [loading, room, currentPlayer]);

  const copyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = async () => {
    await leaveRoom();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-destructive text-lg">{error || 'Room not found'}</p>
        <Button onClick={() => navigate('/')} variant="outline">
          Back to Lobby
        </Button>
      </div>
    );
  }

  const gameState = (room.game_state || {}) as Record<string, unknown>;

  const renderGame = () => {
    switch (room.game_type) {
      case 'blackjack':
        return (
          <BlackjackGame
            players={players}
            currentPlayer={currentPlayer}
            gameState={gameState}
            onUpdateState={updateGameState}
            isHost={isHost}
          />
        );
      case 'poker':
        return <PokerGame />;
      case 'uno':
        return <UnoGame />;
      case 'hangman':
        return (
          <HangmanGame
            players={players}
            currentPlayer={currentPlayer}
            gameState={gameState}
            onUpdateState={updateGameState}
            isHost={isHost}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLeave}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">
                {GAME_NAMES[room.game_type] || room.game_type}
              </h1>
              <p className="text-sm text-muted-foreground">
                Room: <span className="font-mono text-primary">{room.code}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={copyLink}
              className="border-border hover:border-primary"
            >
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-emerald" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Share Link'}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Players */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-4">
              <PlayerList players={players} currentPlayerId={currentPlayer?.id} />
              
              {room.status === 'waiting' && isHost && players.length >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <Button
                    onClick={() => {
                      startGame();
                      updateGameState({ started: true });
                    }}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Game
                  </Button>
                </motion.div>
              )}

              {room.status === 'waiting' && !isHost && (
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <Users className="h-5 w-5 mx-auto mb-2" />
                  Waiting for host to start...
                </div>
              )}
            </div>
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="rounded-xl border border-border bg-felt min-h-[500px] card-shadow">
              {room.status === 'waiting' ? (
                <div className="flex flex-col items-center justify-center h-[500px] text-center p-8">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mb-6"
                  >
                    <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="h-10 w-10 text-primary" />
                    </div>
                  </motion.div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Waiting for Players
                  </h2>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Share the room code or link with friends to invite them to join the game.
                  </p>
                  <div className="flex items-center gap-3 bg-card/50 rounded-lg px-6 py-3 border border-border">
                    <span className="font-mono text-2xl tracking-widest text-primary font-bold">
                      {room.code}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyLink}
                      className="text-muted-foreground hover:text-primary"
                    >
                      {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              ) : (
                renderGame()
              )}
            </div>
          </div>
        </div>
      </div>

      <JoinRoomDialog
        isOpen={showJoinDialog}
        onClose={() => {
          setShowJoinDialog(false);
          if (!currentPlayer) navigate('/');
        }}
        initialCode={code}
      />
    </div>
  );
};

export default GameRoom;
