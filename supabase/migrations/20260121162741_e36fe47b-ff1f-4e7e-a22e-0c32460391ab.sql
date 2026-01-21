-- Create game rooms table
CREATE TABLE public.game_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) NOT NULL UNIQUE,
  game_type VARCHAR(20) NOT NULL CHECK (game_type IN ('blackjack', 'poker', 'uno', 'hangman')),
  host_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  game_state JSONB DEFAULT '{}',
  max_players INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  session_id UUID NOT NULL,
  is_host BOOLEAN NOT NULL DEFAULT false,
  player_state JSONB DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Public policies for game rooms (anyone can read/create/update)
CREATE POLICY "Anyone can view game rooms" 
ON public.game_rooms FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create game rooms" 
ON public.game_rooms FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update game rooms" 
ON public.game_rooms FOR UPDATE 
USING (true);

-- Public policies for players
CREATE POLICY "Anyone can view players" 
ON public.players FOR SELECT 
USING (true);

CREATE POLICY "Anyone can join as player" 
ON public.players FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update players" 
ON public.players FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can leave" 
ON public.players FOR DELETE 
USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;

-- Create index for room code lookups
CREATE INDEX idx_game_rooms_code ON public.game_rooms(code);
CREATE INDEX idx_players_room_id ON public.players(room_id);
CREATE INDEX idx_players_session_id ON public.players(session_id);