import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Event, Fan, Game, Message, Play, Player, Team, User } from '@/types';
import { MOCK_MESSAGES } from '@/constants/mockData';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
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
        queryClient.invalidateQueries({ queryKey: ['teams'] });
        queryClient.invalidateQueries({ queryKey: ['players'] });
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['games'] });
        queryClient.invalidateQueries({ queryKey: ['plays'] });
        queryClient.invalidateQueries({ queryKey: ['fans'] });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const teamsQuery = useQuery({
    queryKey: ['teams', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log('Fetching teams for user:', user.id);
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching teams:', JSON.stringify(error, null, 2));
        if (error.code === 'PGRST205') {
          console.log('Teams table not found - returning empty array');
          return [];
        }
        throw error;
      }
      console.log('Fetched teams:', data);
      return data.map(t => ({
        id: t.id,
        name: t.name,
        record: t.record,
        playerCount: t.player_count,
        avgPPG: t.avg_ppg,
      })) as Team[];
    },
    enabled: !!user?.id,
    retry: false,
  });

  const playersQuery = useQuery({
    queryKey: ['players', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log('Fetching players for user:', user.id);
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching players:', JSON.stringify(error, null, 2));
        if (error.code === 'PGRST205') {
          console.log('Players table not found - returning empty array');
          return [];
        }
        throw error;
      }
      console.log('Fetched players:', data);
      return data.map(p => ({
        id: p.id,
        name: p.name,
        jerseyNumber: p.jersey_number,
        position: p.position,
        teamId: p.team_id,
        stats: {
          points: p.points,
          assists: p.assists,
          rebounds: p.rebounds,
          offensiveRebounds: p.offensive_rebounds,
          defensiveRebounds: p.defensive_rebounds,
          steals: p.steals,
          blocks: p.blocks,
          turnovers: p.turnovers,
          fouls: p.fouls,
        },
      })) as Player[];
    },
    enabled: !!user?.id,
    retry: false,
  });

  const eventsQuery = useQuery({
    queryKey: ['events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log('Fetching events for user:', user.id);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching events:', JSON.stringify(error, null, 2));
        if (error.code === 'PGRST205') {
          console.log('Events table not found - returning empty array');
          return [];
        }
        throw error;
      }
      console.log('Fetched events:', data);
      return data.map(e => ({
        id: e.id,
        type: e.type,
        title: e.title,
        opponent: e.opponent,
        teamId: e.team_id,
        teamName: e.team_name,
        date: e.date,
        time: e.time,
        location: e.location,
        isHome: e.is_home,
      })) as Event[];
    },
    enabled: !!user?.id,
    retry: false,
  });

  const gamesQuery = useQuery({
    queryKey: ['games', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching games:', JSON.stringify(error, null, 2));
        if (error.code === 'PGRST205') {
          console.log('Games table not found - returning empty array');
          return [];
        }
        throw error;
      }
      return data.map(g => ({
        id: g.id,
        homeTeamId: g.home_team_id,
        awayTeamId: g.away_team_id,
        homeScore: g.home_score,
        awayScore: g.away_score,
        quarter: g.quarter,
        date: g.date,
        location: g.location,
        playerGameStats: g.player_game_stats || {},
        onCourt: g.on_court || [],
        events: g.events || [],
      })) as Game[];
    },
    enabled: !!user?.id,
    retry: false,
  });

  const playsQuery = useQuery({
    queryKey: ['plays', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('plays')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching plays:', JSON.stringify(error, null, 2));
        if (error.code === 'PGRST205') {
          console.log('Plays table not found - returning empty array');
          return [];
        }
        throw error;
      }
      return data.map(p => ({
        id: p.id,
        name: p.name,
        drawing: p.drawing,
        createdAt: p.created_at,
      })) as Play[];
    },
    enabled: !!user?.id,
    retry: false,
  });

  const fansQuery = useQuery({
    queryKey: ['fans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('fans')
        .select('*')
        .eq('user_id', user.id)
        .order('invited_at', { ascending: false });
      if (error) {
        console.error('Error fetching fans:', JSON.stringify(error, null, 2));
        if (error.code === 'PGRST205') {
          console.log('Fans table not found - returning empty array');
          return [];
        }
        throw error;
      }
      return data.map(f => ({
        id: f.id,
        name: f.name,
        email: f.email,
        teamId: f.team_id,
        playerId: f.player_id,
        playerName: f.player_name,
        status: f.status,
        invitedAt: f.invited_at,
        joinedAt: f.joined_at,
      })) as Fan[];
    },
    enabled: !!user?.id,
    retry: false,
  });

  const teams = teamsQuery.data || [];
  const players = playersQuery.data || [];
  const events = eventsQuery.data || [];
  const games = gamesQuery.data || [];
  const plays = playsQuery.data || [];
  const fans = fansQuery.data || [];

  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('Login error:', error.message);
      throw error;
    }
    return data;
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
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (error: Error) => {
      console.error('Error adding team:', error.message);
      alert(`Error adding team: ${error.message}`);
    },
  });

  const addTeam = (team: Team): Promise<void> => {
    return new Promise((resolve, reject) => {
      addTeamMutation.mutate(team, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      });
    });
  };

  const addPlayerMutation = useMutation({
    mutationFn: async (player: Player) => {
      if (!user?.id) throw new Error('Not authenticated');
      console.log('Adding player:', player);
      
      const teamExists = teams.find(t => t.id === player.teamId);
      if (!teamExists) {
        throw new Error('Team no longer exists. Please refresh and try again.');
      }
      
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
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (error: Error) => {
      console.error('Error adding player:', error.message);
      alert(`Error adding player: ${error.message}`);
    },
  });

  const addPlayer = (player: Player): Promise<void> => {
    return new Promise((resolve, reject) => {
      addPlayerMutation.mutate(player, {
        onSuccess: () => resolve(),
        onError: (error) => reject(error),
      });
    });
  };

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
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });

  const updatePlayer = (updatedPlayer: Player) => {
    updatePlayerMutation.mutate(updatedPlayer);
  };

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
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: Error) => {
      console.error('Error adding event:', error.message);
      alert(`Error adding event: ${error.message}`);
    },
  });

  const addEvent = (event: Event) => {
    addEventMutation.mutate(event);
  };

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
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const updateEvent = (updatedEvent: Event) => {
    updateEventMutation.mutate(updatedEvent);
  };

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
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });

  const addGame = (game: Game) => {
    addGameMutation.mutate(game);
  };

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
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });

  const updateGame = (gameId: string, updates: Partial<Game>) => {
    updateGameMutation.mutate({ gameId, updates });
  };

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
      queryClient.invalidateQueries({ queryKey: ['plays'] });
    },
  });

  const addPlay = (play: Play) => {
    addPlayMutation.mutate(play);
  };

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
      queryClient.invalidateQueries({ queryKey: ['plays'] });
    },
  });

  const deletePlay = (playId: string) => {
    deletePlayMutation.mutate(playId);
  };

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
      queryClient.invalidateQueries({ queryKey: ['fans'] });
    },
  });

  const addFan = (fan: Fan) => {
    addFanMutation.mutate(fan);
  };

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
      queryClient.invalidateQueries({ queryKey: ['fans'] });
    },
  });

  const updateFan = (updatedFan: Fan) => {
    updateFanMutation.mutate(updatedFan);
  };

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
      queryClient.invalidateQueries({ queryKey: ['fans'] });
    },
  });

  const deleteFan = (fanId: string) => {
    deleteFanMutation.mutate(fanId);
  };

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
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['fans'] });
    },
    onError: (error: Error) => {
      console.error('Error deleting team:', error.message);
      alert(`Error deleting team: ${error.message}`);
    },
  });

  const deleteTeam = (teamId: string) => {
    deleteTeamMutation.mutate(teamId);
  };

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
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: Error) => {
      console.error('Error deleting event:', error.message);
      alert(`Error deleting event: ${error.message}`);
    },
  });

  const deleteEvent = (eventId: string) => {
    deleteEventMutation.mutate(eventId);
  };

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
    isLoading: teamsQuery.isLoading || playersQuery.isLoading || eventsQuery.isLoading || authLoading,
  }), [user, session, selectedTeamId, teams, players, events, messages, games, plays, fans, login, signup, logout, addTeam, addPlayer, updatePlayer, addEvent, updateEvent, deleteEvent, addGame, updateGame, addPlay, deletePlay, addFan, updateFan, deleteFan, deleteTeam, teamsQuery.isLoading, playersQuery.isLoading, eventsQuery.isLoading, authLoading]);
});
