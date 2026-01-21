import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from './useSession';
import type { Database } from '@/integrations/supabase/types';

type GameRoom = Database['public']['Tables']['game_rooms']['Row'];
type Player = Database['public']['Tables']['players']['Row'];

export const useGameRoom = (roomCode?: string) => {
  const sessionId = useSession();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const createRoom = useCallback(async (gameType: string, playerName: string) => {
    if (!sessionId) return null;
    
    try {
      const code = generateRoomCode();
      
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .insert({
          code,
          game_type: gameType,
          host_id: sessionId,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: roomData.id,
          name: playerName,
          session_id: sessionId,
          is_host: true,
        })
        .select()
        .single();

      if (playerError) throw playerError;

      return roomData.code;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
      return null;
    }
  }, [sessionId]);

  const joinRoom = useCallback(async (code: string, playerName: string) => {
    if (!sessionId) return false;

    try {
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (roomError) throw new Error('Room not found');

      // Check if player already in room
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomData.id)
        .eq('session_id', sessionId)
        .single();

      if (existingPlayer) {
        return true;
      }

      // Check room capacity
      const { count } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomData.id);

      if ((count || 0) >= roomData.max_players) {
        throw new Error('Room is full');
      }

      const { error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: roomData.id,
          name: playerName,
          session_id: sessionId,
          is_host: false,
        });

      if (playerError) throw playerError;

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
      return false;
    }
  }, [sessionId]);

  const leaveRoom = useCallback(async () => {
    if (!currentPlayer) return;

    await supabase
      .from('players')
      .delete()
      .eq('id', currentPlayer.id);
  }, [currentPlayer]);

  const updateGameState = useCallback(async (newState: Record<string, unknown>) => {
    if (!room) return;

    await supabase
      .from('game_rooms')
      .update({ game_state: newState as unknown as Database['public']['Tables']['game_rooms']['Row']['game_state'] })
      .eq('id', room.id);
  }, [room]);

  const startGame = useCallback(async () => {
    if (!room) return;

    await supabase
      .from('game_rooms')
      .update({ status: 'playing' })
      .eq('id', room.id);
  }, [room]);

  // Subscribe to room and players
  useEffect(() => {
    if (!roomCode || !sessionId) {
      setLoading(false);
      return;
    }

    const fetchRoom = async () => {
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('code', roomCode.toUpperCase())
        .single();

      if (roomError) {
        setError('Room not found');
        setLoading(false);
        return;
      }

      setRoom(roomData);

      const { data: playersData } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomData.id)
        .order('joined_at', { ascending: true });

      setPlayers(playersData || []);

      const current = playersData?.find(p => p.session_id === sessionId);
      setCurrentPlayer(current || null);

      setLoading(false);
    };

    fetchRoom();

    // Realtime subscriptions
    const roomChannel = supabase
      .channel(`room-${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rooms',
          filter: `code=eq.${roomCode.toUpperCase()}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setRoom(payload.new as GameRoom);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
        },
        async () => {
          // Refetch players on any change
          const { data: roomData } = await supabase
            .from('game_rooms')
            .select('id')
            .eq('code', roomCode.toUpperCase())
            .single();

          if (roomData) {
            const { data: playersData } = await supabase
              .from('players')
              .select('*')
              .eq('room_id', roomData.id)
              .order('joined_at', { ascending: true });

            setPlayers(playersData || []);
            const current = playersData?.find(p => p.session_id === sessionId);
            setCurrentPlayer(current || null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [roomCode, sessionId]);

  return {
    room,
    players,
    currentPlayer,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    updateGameState,
    startGame,
    isHost: currentPlayer?.is_host || false,
  };
};
