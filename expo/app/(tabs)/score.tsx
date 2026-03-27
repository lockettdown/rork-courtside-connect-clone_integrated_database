import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RotateCcw, UserPlus, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { theme } from '@/constants/theme';
import { useState, useMemo } from 'react';
import AddPlayerModal from '@/components/AddPlayerModal';
import GameScoreModal from '@/components/GameScoreModal';
import { Player, PlayerGameStats } from '@/types';

export default function ScoreScreen() {
  const { players, teams, addPlayer, updatePlayer } = useApp();
  const insets = useSafeAreaInsets();
  const [quarter, setQuarter] = useState<number>(1);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [activeTeam, setActiveTeam] = useState<'home' | 'away'>('home');
  const [homeTeamId, setHomeTeamId] = useState<string>(teams[0]?.id || '');
  const [awayTeamId, setAwayTeamId] = useState<string>(teams[1]?.id || teams[0]?.id || '');
  const [onCourt, setOnCourt] = useState<string[]>([]);
  const [addPlayerModalVisible, setAddPlayerModalVisible] = useState<boolean>(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [gameScoreVisible, setGameScoreVisible] = useState<boolean>(false);
  const [gameStats, setGameStats] = useState<Record<string, PlayerGameStats>>({});
  const [lastAction, setLastAction] = useState<{
    type: 'stat' | 'score';
    playerId?: string;
    statKey?: keyof PlayerGameStats;
    team?: 'home' | 'away';
    value: number;
  } | null>(null);

  const currentTeamId = activeTeam === 'home' ? homeTeamId : awayTeamId;
  const currentTeam = teams.find(t => t.id === currentTeamId);
  const teamPlayers = players.filter((p) => p.teamId === currentTeamId);
  const bench = teamPlayers.filter((p) => !onCourt.includes(p.id));

  const adjustScore = (team: 'home' | 'away', delta: number) => {
    if (team === 'home') {
      setHomeScore(Math.max(0, homeScore + delta));
    } else {
      setAwayScore(Math.max(0, awayScore + delta));
    }
    if (delta !== 0) {
      setLastAction({
        type: 'score',
        team,
        value: delta,
      });
    }
  };

  const togglePlayer = (playerId: string) => {
    if (onCourt.includes(playerId)) {
      setOnCourt(onCourt.filter((id) => id !== playerId));
    } else {
      setOnCourt([...onCourt, playerId]);
    }
  };

  const handleSaveNewPlayer = (playerData: { name: string; jerseyNumber: string; position: string }) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: playerData.name,
      jerseyNumber: playerData.jerseyNumber,
      position: playerData.position,
      teamId: currentTeamId,
      stats: {
        points: 0,
        assists: 0,
        rebounds: 0,
        offensiveRebounds: 0,
        defensiveRebounds: 0,
        steals: 0,
        blocks: 0,
        turnovers: 0,
        fouls: 0,
      },
    };
    addPlayer(newPlayer);
    console.log('Created new player for bench:', newPlayer);
  };

  const handlePlayerPress = (player: Player) => {
    setSelectedPlayer(player);
    setGameScoreVisible(true);
    console.log('Player selected for game scoring:', player.name);
  };

  const getPlayerGameStats = (playerId: string): PlayerGameStats => {
    return gameStats[playerId] || {
      points: 0,
      assists: 0,
      offensiveRebounds: 0,
      defensiveRebounds: 0,
      steals: 0,
      turnovers: 0,
      fouls: 0,
      missedShots: 0,
      missedFreeThrows: 0,
    };
  };

  const handleUpdateGameStats = (playerId: string, stats: PlayerGameStats, statKey?: keyof PlayerGameStats, delta?: number) => {
    setGameStats((prev) => ({
      ...prev,
      [playerId]: stats,
    }));
    
    if (statKey === 'points' && delta) {
      const player = players.find(p => p.id === playerId);
      if (player) {
        if (player.teamId === homeTeamId) {
          setHomeScore(prev => Math.max(0, prev + delta));
        } else if (player.teamId === awayTeamId) {
          setAwayScore(prev => Math.max(0, prev + delta));
        }
      }
    }
    
    if (statKey && delta) {
      setLastAction({
        type: 'stat',
        playerId,
        statKey,
        value: delta,
      });
    }
    console.log('Game stats updated for player:', playerId, stats);
  };

  const handleUndo = () => {
    if (!lastAction) {
      console.log('No action to undo');
      return;
    }

    if (lastAction.type === 'stat' && lastAction.playerId && lastAction.statKey) {
      const playerId = lastAction.playerId;
      const statKey = lastAction.statKey;
      const delta = lastAction.value;
      
      setGameStats((prev) => {
        const playerStats = prev[playerId] || getPlayerGameStats(playerId);
        const newValue = Math.max(0, playerStats[statKey] - delta);
        return {
          ...prev,
          [playerId]: {
            ...playerStats,
            [statKey]: newValue,
          },
        };
      });
      
      if (statKey === 'points') {
        const player = players.find(p => p.id === playerId);
        if (player) {
          if (player.teamId === homeTeamId) {
            setHomeScore(prev => Math.max(0, prev - delta));
          } else if (player.teamId === awayTeamId) {
            setAwayScore(prev => Math.max(0, prev - delta));
          }
        }
      }
      
      console.log('Undid stat action:', lastAction);
      setLastAction(null);
    } else if (lastAction.type === 'score' && lastAction.team) {
      adjustScore(lastAction.team, -lastAction.value);
      console.log('Undid score action:', lastAction);
      setLastAction(null);
    }
  };

  const totalGamePoints = useMemo(() => {
    return Object.values(gameStats).reduce((sum, stats) => sum + stats.points, 0);
  }, [gameStats]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.quarterButton}
          onPress={() => setQuarter((prev) => (prev >= 4 ? 1 : prev + 1))}
          activeOpacity={0.7}
        >
          <Text style={styles.quarterText}>Q{quarter}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.undoButton}
          onPress={handleUndo}
          disabled={!lastAction}
        >
          <RotateCcw size={20} color={lastAction ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.undoText, lastAction && { color: theme.colors.primary }]}>Undo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scoreBoard}>
        <View style={styles.teamScore}>
          <Text style={styles.teamLabel}>Home</Text>
          <View style={styles.scoreControls}>
            <TouchableOpacity
              style={styles.scoreButton}
              onPress={() => adjustScore('home', -1)}
            >
              <Text style={styles.scoreButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.score}>{homeScore}</Text>
            <TouchableOpacity
              style={styles.scoreButton}
              onPress={() => adjustScore('home', 1)}
            >
              <Text style={styles.scoreButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.teamScore}>
          <Text style={styles.teamLabel}>Away</Text>
          <View style={styles.scoreControls}>
            <TouchableOpacity
              style={styles.scoreButton}
              onPress={() => adjustScore('away', -1)}
            >
              <Text style={styles.scoreButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.score}>{awayScore}</Text>
            <TouchableOpacity
              style={styles.scoreButton}
              onPress={() => adjustScore('away', 1)}
            >
              <Text style={styles.scoreButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.teamToggle}>
        <TouchableOpacity
          style={styles.teamToggleButton}
          onPress={() => setActiveTeam('home')}
          activeOpacity={0.7}
        >
          {activeTeam === 'home' ? (
            <LinearGradient
              colors={['#FF6900', '#FF6900']}
              style={styles.teamToggleActive}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.teamToggleTextActive}>Home</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.teamToggleText}>Home</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.teamToggleButton}
          onPress={() => setActiveTeam('away')}
          activeOpacity={0.7}
        >
          {activeTeam === 'away' ? (
            <LinearGradient
              colors={['#FF6900', '#FF6900']}
              style={styles.teamToggleActive}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.teamToggleTextActive}>Away</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.teamToggleText}>Away</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.addPlayerButton} 
        activeOpacity={0.7}
        onPress={() => setAddPlayerModalVisible(true)}
      >
        <UserPlus size={20} color={theme.colors.text} />
        <Text style={styles.addPlayerText}>Add Player to {activeTeam === 'home' ? currentTeam?.name || 'Home' : currentTeam?.name || 'Away'}</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.onCourtHeader}>
            <Text style={styles.sectionTitle}>On Court</Text>
          </View>
          {onCourt.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No players on court</Text>
            </View>
          ) : (
            onCourt.map((playerId) => {
              const player = teamPlayers.find((p) => p.id === playerId);
              if (!player) return null;
              return (
                <TouchableOpacity 
                  key={player.id} 
                  style={styles.playerCard}
                  onPress={() => handlePlayerPress(player)}
                  activeOpacity={0.7}
                >
                  <View style={styles.playerInfo}>
                    <View style={styles.jerseyNumber}>
                      <Text style={styles.jerseyText}>{player.jerseyNumber}</Text>
                    </View>
                    <View style={styles.playerDetails}>
                      <Text style={styles.playerName}>{player.name}</Text>
                      <Text style={styles.playerStats}>
                        {getPlayerGameStats(player.id).points} PTS • {getPlayerGameStats(player.id).assists} AST • {getPlayerGameStats(player.id).offensiveRebounds + getPlayerGameStats(player.id).defensiveRebounds} REB
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.subButton}
                    onPress={() => togglePlayer(player.id)}
                  >
                    <Text style={styles.subButtonText}>Sub Out</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <TouchableOpacity style={styles.benchHeader} activeOpacity={0.7}>
          <Text style={styles.benchTitle}>Bench ({bench.length})</Text>
          <Text style={styles.benchArrow}>▼</Text>
        </TouchableOpacity>

        {bench.map((player) => (
          <TouchableOpacity 
            key={player.id} 
            style={styles.playerCard}
            onPress={() => handlePlayerPress(player)}
            activeOpacity={0.7}
          >
            <View style={styles.playerInfo}>
              <View style={styles.jerseyNumber}>
                <Text style={styles.jerseyText}>{player.jerseyNumber}</Text>
              </View>
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerStats}>
                  {getPlayerGameStats(player.id).points} PTS • {getPlayerGameStats(player.id).assists} AST • {getPlayerGameStats(player.id).offensiveRebounds + getPlayerGameStats(player.id).defensiveRebounds} REB
                </Text>
              </View>
            </View>
            <View style={styles.playerActions}>
              <TouchableOpacity
                style={styles.subInButton}
                onPress={() => togglePlayer(player.id)}
              >
                <Text style={styles.subInButtonText}>Sub In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton}>
                <Trash2 size={20} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <AddPlayerModal
        visible={addPlayerModalVisible}
        onClose={() => setAddPlayerModalVisible(false)}
        onSave={handleSaveNewPlayer}
      />

      <GameScoreModal
        visible={gameScoreVisible}
        player={selectedPlayer}
        currentGameStats={selectedPlayer ? getPlayerGameStats(selectedPlayer.id) : {
          points: 0,
          assists: 0,
          offensiveRebounds: 0,
          defensiveRebounds: 0,
          steals: 0,
          turnovers: 0,
          fouls: 0,
          missedShots: 0,
          missedFreeThrows: 0,
        }}
        onClose={() => setGameScoreVisible(false)}
        onUpdateStats={handleUpdateGameStats}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  quarterButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  quarterText: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  undoText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  scoreBoard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  teamScore: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  teamLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '500' as const,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center' as const,
  },
  scoreControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  scoreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreButtonText: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  score: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: '700' as const,
    color: theme.colors.primary,
    minWidth: 60,
    textAlign: 'center' as const,
  },
  teamToggle: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  teamToggleButton: {
    flex: 1,
  },
  teamToggleActive: {
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  teamToggleTextActive: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  teamToggleText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
    paddingVertical: theme.spacing.sm,
    textAlign: 'center' as const,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
  },
  addPlayerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  addPlayerText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  onCourtHeader: {
    backgroundColor: '#FF6900',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 20,
    alignSelf: 'flex-start' as const,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  emptyState: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  jerseyNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jerseyText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  playerStats: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  playerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  subButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
  },
  subButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
  },
  subInButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.sm,
  },
  subInButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  deleteButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  benchTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  benchArrow: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },

});
