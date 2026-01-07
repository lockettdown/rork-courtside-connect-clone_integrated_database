import createContextHook from '@nkzw/create-context-hook';
import { useMutation } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Event, Fan, Game, Message, Play, Player, Team, User } from '@/types';
import { MOCK_MESSAGES } from '@/constants/mockData';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { trpc } from '@/lib/trpc';

export const [AppProvider, useApp] = createContextHook(() => {
  const utils = trpc.useUtils();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [messages] = useState<Message[]>(MOCK_MESSAGES);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: 'coach',
        });
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: 'coach',
        });
        // Invalidate tRPC queries
        utils.teams.getAll.invalidate();
        utils.players.getAll.invalidate();
        utils.events.getAll.invalidate();
        utils.games.getAll.invalidate();
        utils.plays.getAll.invalidate();
        utils.fans.getAll.invalidate();
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [utils]);

  const teamsQuery = trpc.teams.getAll.useQuery(
    { userId: user?.id || '' },
    { 
      enabled: !!user?.id,
      retry: 1
    }
  );

  useEffect(() => {
    if (teamsQuery.error) {
      console.error('Error fetching teams:', { 
        message: teamsQuery.error.message, 
        details: teamsQuery.error.toString(), 
        hint: '', 
        code: '' 
      });
    }
  }, [teamsQuery.error]);

  const playersQuery = trpc.players.getAll.useQuery(
    { userId: user?.id || '' },
    { 
      enabled: !!user?.id,
      retry: 1
    }
  );

  useEffect(() => {
    if (playersQuery.error) {
      console.error('Error fetching players:', { 
        message: playersQuery.error.message, 
        details: playersQuery.error.toString(), 
        hint: '', 
        code: '' 
      });
    }
  }, [playersQuery.error]);

  const eventsQuery = trpc.events.getAll.useQuery(
    { userId: user?.id || '' },
    { 
      enabled: !!user?.id,
      retry: 1
    }
  );

  useEffect(() => {
    if (eventsQuery.error) {
      console.error('Error fetching events:', { 
        message: eventsQuery.error.message, 
        details: eventsQuery.error.toString(), 
        hint: '', 
        code: '' 
      });
    }
  }, [eventsQuery.error]);

  const gamesQuery = trpc.games.getAll.useQuery(
    { userId: user?.id || '' },
    { 
      enabled: !!user?.id,
      retry: 1
    }
  );

  useEffect(() => {
    if (gamesQuery.error) {
      console.error('Error fetching games:', { 
        message: gamesQuery.error.message, 
        details: gamesQuery.error.toString(), 
        hint: '', 
        code: '' 
      });
    }
  }, [gamesQuery.error]);

  const playsQuery = trpc.plays.getAll.useQuery(
    { userId: user?.id || '' },
    { 
      enabled: !!user?.id,
      retry: 1
    }
  );

  useEffect(() => {
    if (playsQuery.error) {
      console.error('Error fetching plays:', { 
        message: playsQuery.error.message, 
        details: playsQuery.error.toString(), 
        hint: '', 
        code: '' 
      });
    }
  }, [playsQuery.error]);

  const fansQuery = trpc.fans.getAll.useQuery(
    { userId: user?.id || '' },
    { 
      enabled: !!user?.id,
      retry: 1
    }
  );

  useEffect(() => {
    if (fansQuery.error) {
      console.error('Error fetching fans:', { 
        message: fansQuery.error.message, 
        details: fansQuery.error.toString(), 
        hint: '', 
        code: '' 
      });
    }
  }, [fansQuery.error]);

  const teams = useMemo(() => teamsQuery.data || [], [teamsQuery.data]);
  const players = useMemo(() => playersQuery.data || [], [playersQuery.data]);
  const events = useMemo(() => eventsQuery.data || [], [eventsQuery.data]);
  const games = useMemo(() => gamesQuery.data || [], [gamesQuery.data]);
  const plays = useMemo(() => playsQuery.data || [], [playsQuery.data]);
  const fans = useMemo(() => fansQuery.data || [], [fansQuery.data]);

  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('Attempting login to Supabase...');
      console.log('Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error('Login error:', error.message);
        throw error;
      }
      console.log('Login successful');
      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const signup = useCallback(async (fullName: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: undefined,
      },
    });
    if (error) {
      console.error('Signup error:', error.message);
      throw error;
    }
    return data;
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
      throw error;
    }
    setUser(null);
    setSelectedTeamId('');
  }, []);

  const addTeamMutation = useMutation({
    mutationFn: async (team: Team) => {
      if (!user?.id) throw new Error('Not authenticated');
      console.log('Adding team:', team);
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          id: team.id,
          user_id: user.id,
          name: team.name,
          record: team.record,
          player_count: team.playerCount,
          avg_ppg: team.avgPPG,
        }])
        .select()
        .single();
      if (error) {
        console.error('Error adding team:', error);
        throw new Error(`Failed to add team: ${error.message}`);
      }
      console.log('Team added successfully:', data);
      return data;
    },
    onSuccess: () => {
      utils.teams.getAll.invalidate();
    },
    onError: (error: Error) => {
      console.error('Error adding team:', error.message);
      alert(`Error adding team: ${error.message}`);
    },
  });
  const { mutate: mutateAddTeam } = addTeamMutation;

  const addTeam = useCallback((team: Team): Promise<void> => {
    return new Promise((resolve, reject) => {
      mutateAddTeam(team, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      });
    });
  }, [mutateAddTeam]);

  const addPlayerMutation = useMutation({
    mutationFn: async (player: Player) => {
      if (!user?.id) throw new Error('Not authenticated');
      console.log('Adding player:', player);
      
      /* 
      const teamExists = teams.find(t => t.id === player.teamId);
      if (!teamExists) {
        throw new Error('Team no longer exists. Please refresh and try again.');
      }
      */
      
      const { data, error } = await supabase
        .from('players')
        .insert([{
          id: player.id,
          user_id: user.id,
          team_id: player.teamId,
          name: player.name,
          jersey_number: player.jerseyNumber,
          position: player.position || null,
          points: player.stats.points,
          assists: player.stats.assists,
          rebounds: player.stats.rebounds,
          offensive_rebounds: player.stats.offensiveRebounds,
          defensive_rebounds: player.stats.defensiveRebounds,
          steals: player.stats.steals,
          blocks: player.stats.blocks,
          turnovers: player.stats.turnovers,
          fouls: player.stats.fouls,
        }])
        .select()
        .single();
      if (error) {
        console.error('Error adding player:', error);
        if (error.code === '23503') {
          throw new Error('Team no longer exists. Please go back and refresh.');
        }
        throw new Error(`Failed to add player: ${error.message}`);
      }
      console.log('Player added successfully:', data);
      return data;
    },
    onSuccess: () => {
      utils.players.getAll.invalidate();
      utils.teams.getAll.invalidate();
    },
    onError: (error: Error) => {
      console.error('Error adding player:', error.message);
      alert(`Error adding player: ${error.message}`);
    },
  });
  const { mutate: mutateAddPlayer } = addPlayerMutation;

  const addPlayer = useCallback((player: Player): Promise<void> => {
    return new Promise((resolve, reject) => {
      mutateAddPlayer(player, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      });
    });
  }, [mutateAddPlayer]);

  const updatePlayerMutation = useMutation({
    mutationFn: async (updatedPlayer: Player) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('players')
        .update({
          name: updatedPlayer.name,
          jersey_number: updatedPlayer.jerseyNumber,
          position: updatedPlayer.position,
          points: updatedPlayer.stats.points,
          assists: updatedPlayer.stats.assists,
          rebounds: updatedPlayer.stats.rebounds,
          offensive_rebounds: updatedPlayer.stats.offensiveRebounds,
          defensive_rebounds: updatedPlayer.stats.defensiveRebounds,
          steals: updatedPlayer.stats.steals,
          blocks: updatedPlayer.stats.blocks,
          turnovers: updatedPlayer.stats.turnovers,
          fouls: updatedPlayer.stats.fouls,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedPlayer.id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      utils.players.getAll.invalidate();
    },
  });
  const { mutate: mutateUpdatePlayer } = updatePlayerMutation;

  const updatePlayer = useCallback((updatedPlayer: Player) => {
    mutateUpdatePlayer(updatedPlayer);
  }, [mutateUpdatePlayer]);

  const addEventMutation = useMutation({
    mutationFn: async (event: Event) => {
      if (!user?.id) throw new Error('Not authenticated');
      console.log('Adding event:', event);
      const { data, error } = await supabase
        .from('events')
        .insert([{
          id: event.id,
          user_id: user.id,
          team_id: event.teamId,
          type: event.type,
          title: event.title,
          opponent: event.opponent || null,
          team_name: event.teamName,
          date: event.date,
          time: event.time,
          location: event.location,
          is_home: event.isHome !== undefined ? event.isHome : true,
        }])
        .select()
        .single();
      if (error) {
        console.error('Error adding event:', error);
        throw new Error(`Failed to add event: ${error.message}`);
      }
      console.log('Event added successfully:', data);
      return data;
    },
    onSuccess: () => {
      utils.events.getAll.invalidate();
    },
    onError: (error: Error) => {
      console.error('Error adding event:', error.message);
      alert(`Error adding event: ${error.message}`);
    },
  });
  const { mutate: mutateAddEvent } = addEventMutation;

  const addEvent = useCallback((event: Event) => {
    mutateAddEvent(event);
  }, [mutateAddEvent]);

  const updateEventMutation = useMutation({
    mutationFn: async (updatedEvent: Event) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('events')
        .update({
          type: updatedEvent.type,
          title: updatedEvent.title,
          opponent: updatedEvent.opponent,
          team_name: updatedEvent.teamName,
          date: updatedEvent.date,
          time: updatedEvent.time,
          location: updatedEvent.location,
          is_home: updatedEvent.isHome,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedEvent.id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      utils.events.getAll.invalidate();
    },
  });
  const { mutate: mutateUpdateEvent } = updateEventMutation;

  const updateEvent = useCallback((updatedEvent: Event) => {
    mutateUpdateEvent(updatedEvent);
  }, [mutateUpdateEvent]);

  const addGameMutation = useMutation({
    mutationFn: async (game: Game) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('games')
        .insert([{
          id: game.id,
          user_id: user.id,
          home_team_id: game.homeTeamId,
          away_team_id: game.awayTeamId,
          home_score: game.homeScore,
          away_score: game.awayScore,
          quarter: game.quarter,
          date: game.date,
          location: game.location,
          player_game_stats: game.playerGameStats,
          on_court: game.onCourt,
          events: game.events,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      utils.games.getAll.invalidate();
    },
  });
  const { mutate: mutateAddGame } = addGameMutation;

  const addGame = useCallback((game: Game) => {
    mutateAddGame(game);
  }, [mutateAddGame]);

  const updateGameMutation = useMutation({
    mutationFn: async ({ gameId, updates }: { gameId: string; updates: Partial<Game> }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const updateData: Record<string, unknown> = {};
      if (updates.homeScore !== undefined) updateData.home_score = updates.homeScore;
      if (updates.awayScore !== undefined) updateData.away_score = updates.awayScore;
      if (updates.quarter !== undefined) updateData.quarter = updates.quarter;
      if (updates.playerGameStats !== undefined) updateData.player_game_stats = updates.playerGameStats;
      if (updates.onCourt !== undefined) updateData.on_court = updates.onCourt;
      if (updates.events !== undefined) updateData.events = updates.events;
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('games')
        .update(updateData)
        .eq('id', gameId)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      utils.games.getAll.invalidate();
      utils.players.getAll.invalidate();
    },
  });
  const { mutate: mutateUpdateGame } = updateGameMutation;

  const updateGame = useCallback((gameId: string, updates: Partial<Game>) => {
    mutateUpdateGame({ gameId, updates });
  }, [mutateUpdateGame]);

  const addPlayMutation = useMutation({
    mutationFn: async (play: Play) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('plays')
        .insert([{
          id: play.id,
          user_id: user.id,
          name: play.name,
          drawing: play.drawing,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      utils.plays.getAll.invalidate();
    },
  });
  const { mutate: mutateAddPlay } = addPlayMutation;

  const addPlay = useCallback((play: Play) => {
    mutateAddPlay(play);
  }, [mutateAddPlay]);

  const deletePlayMutation = useMutation({
    mutationFn: async (playId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('plays')
        .delete()
        .eq('id', playId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      utils.plays.getAll.invalidate();
    },
  });
  const { mutate: mutateDeletePlay } = deletePlayMutation;

  const deletePlay = useCallback((playId: string) => {
    mutateDeletePlay(playId);
  }, [mutateDeletePlay]);

  const addFanMutation = useMutation({
    mutationFn: async (fan: Fan) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('fans')
        .insert([{
          id: fan.id,
          user_id: user.id,
          team_id: fan.teamId,
          player_id: fan.playerId,
          name: fan.name,
          email: fan.email,
          player_name: fan.playerName,
          status: fan.status,
          joined_at: fan.joinedAt,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      utils.fans.getAll.invalidate();
    },
  });
  const { mutate: mutateAddFan } = addFanMutation;

  const addFan = useCallback((fan: Fan) => {
    mutateAddFan(fan);
  }, [mutateAddFan]);

  const updateFanMutation = useMutation({
    mutationFn: async (updatedFan: Fan) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('fans')
        .update({
          name: updatedFan.name,
          email: updatedFan.email,
          player_id: updatedFan.playerId,
          player_name: updatedFan.playerName,
          status: updatedFan.status,
          joined_at: updatedFan.joinedAt,
        })
        .eq('id', updatedFan.id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      utils.fans.getAll.invalidate();
    },
  });
  const { mutate: mutateUpdateFan } = updateFanMutation;

  const updateFan = useCallback((updatedFan: Fan) => {
    mutateUpdateFan(updatedFan);
  }, [mutateUpdateFan]);

  const deleteFanMutation = useMutation({
    mutationFn: async (fanId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('fans')
        .delete()
        .eq('id', fanId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      utils.fans.getAll.invalidate();
    },
  });
  const { mutate: mutateDeleteFan } = deleteFanMutation;

  const deleteFan = useCallback((fanId: string) => {
    mutateDeleteFan(fanId);
  }, [mutateDeleteFan]);

  const deleteTeamMutation = useMutation({
    mutationFn: async (teamId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      console.log('Deleting team:', teamId);
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId)
        .eq('user_id', user.id);
      if (error) {
        console.error('Error deleting team:', error);
        throw new Error(`Failed to delete team: ${error.message}`);
      }
      console.log('Team deleted successfully');
    },
    onSuccess: () => {
      utils.teams.getAll.invalidate();
      utils.players.getAll.invalidate();
      utils.events.getAll.invalidate();
      utils.fans.getAll.invalidate();
    },
    onError: (error: Error) => {
      console.error('Error deleting team:', error.message);
      alert(`Error deleting team: ${error.message}`);
    },
  });
  const { mutate: mutateDeleteTeam } = deleteTeamMutation;

  const deleteTeam = useCallback((teamId: string) => {
    mutateDeleteTeam(teamId);
  }, [mutateDeleteTeam]);

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      console.log('Deleting event:', eventId);
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);
      if (error) {
        console.error('Error deleting event:', error);
        throw new Error(`Failed to delete event: ${error.message}`);
      }
      console.log('Event deleted successfully');
    },
    onSuccess: () => {
      utils.events.getAll.invalidate();
    },
    onError: (error: Error) => {
      console.error('Error deleting event:', error.message);
      alert(`Error deleting event: ${error.message}`);
    },
  });
  const { mutate: mutateDeleteEvent } = deleteEventMutation;

  const deleteEvent = useCallback((eventId: string) => {
    mutateDeleteEvent(eventId);
  }, [mutateDeleteEvent]);

  const refreshData = useCallback(async () => {
    await Promise.all([
      utils.teams.getAll.invalidate(),
      utils.players.getAll.invalidate(),
      utils.events.getAll.invalidate(),
      utils.games.getAll.invalidate(),
      utils.plays.getAll.invalidate(),
      utils.fans.getAll.invalidate(),
    ]);
  }, [utils]);

  return useMemo(() => ({
    user,
    session,
    selectedTeamId,
    setSelectedTeamId,
    teams,
    players,
    events,
    messages,
    games,
    plays,
    fans,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    addTeam,
    addPlayer,
    updatePlayer,
    addEvent,
    updateEvent,
    deleteEvent,
    addGame,
    updateGame,
    addPlay,
    deletePlay,
    addFan,
    updateFan,
    deleteFan,
    deleteTeam,
    refreshData,
    isLoading: teamsQuery.isLoading || playersQuery.isLoading || eventsQuery.isLoading || authLoading,
  }), [user, session, selectedTeamId, teams, players, events, messages, games, plays, fans, login, signup, logout, addTeam, addPlayer, updatePlayer, addEvent, updateEvent, deleteEvent, addGame, updateGame, addPlay, deletePlay, addFan, updateFan, deleteFan, deleteTeam, refreshData, teamsQuery.isLoading, playersQuery.isLoading, eventsQuery.isLoading, authLoading]);
});
