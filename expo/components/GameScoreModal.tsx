import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { X } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Player, PlayerGameStats } from '@/types';

interface GameScoreModalProps {
  visible: boolean;
  player: Player | null;
  currentGameStats: PlayerGameStats;
  onClose: () => void;
  onUpdateStats: (playerId: string, stats: PlayerGameStats, statKey?: keyof PlayerGameStats, delta?: number) => void;
}

interface StatButton {
  label: string;
  key: keyof PlayerGameStats;
  value: number;
}

export default function GameScoreModal({
  visible,
  player,
  currentGameStats,
  onClose,
  onUpdateStats,
}: GameScoreModalProps) {
  const [stats, setStats] = useState<PlayerGameStats>(currentGameStats);

  useEffect(() => {
    if (visible) {
      setStats(currentGameStats);
    }
  }, [visible, currentGameStats]);

  const updateStat = useCallback((key: keyof PlayerGameStats, delta: number) => {
    
    setStats((prev) => {
      const newValue = Math.max(0, prev[key] + delta);
      const newStats = { ...prev, [key]: newValue };
      
      if (player) {
        onUpdateStats(player.id, newStats, key, delta);
      }
      
      return newStats;
    });
  }, [player, onUpdateStats]);

  const quickPoints: StatButton[] = [
    { label: '+1', key: 'points', value: 1 },
    { label: '+2', key: 'points', value: 2 },
    { label: '+3', key: 'points', value: 3 },
  ];

  const quickMisses: StatButton[] = [
    { label: 'Missed Shot', key: 'missedShots', value: 1 },
    { label: 'Missed FT', key: 'missedFreeThrows', value: 1 },
  ];

  const reboundButtons: StatButton[] = [
    { label: 'Off Reb', key: 'offensiveRebounds', value: 1 },
    { label: 'Def Reb', key: 'defensiveRebounds', value: 1 },
  ];

  const assistButtons: StatButton[] = [
    { label: 'Assists', key: 'assists', value: 1 },
  ];

  const negativeButtons: StatButton[] = [
    { label: 'Fouls', key: 'fouls', value: 1 },
    { label: 'TO', key: 'turnovers', value: 1 },
  ];

  const statButtons: { label: string; key: keyof PlayerGameStats }[] = [
    { label: 'Points', key: 'points' },
    { label: 'Assist', key: 'assists' },
    { label: 'Off Reb', key: 'offensiveRebounds' },
    { label: 'Def Reb', key: 'defensiveRebounds' },
    { label: 'Steal', key: 'steals' },
    { label: 'TO', key: 'turnovers' },
    { label: 'Foul', key: 'fouls' },
  ];

  if (!player) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.jerseyBadge}>
              <Text style={styles.jerseyBadgeText}>{player.jerseyNumber}</Text>
            </View>
            <View>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.subtitle}>Game Stats</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.currentStats}>
            <Text style={styles.sectionTitle}>Current Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{stats.points}</Text>
                <Text style={styles.statBoxLabel}>PTS</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{stats.assists}</Text>
                <Text style={styles.statBoxLabel}>AST</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>
                  {stats.offensiveRebounds + stats.defensiveRebounds}
                </Text>
                <Text style={styles.statBoxLabel}>REB</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{stats.turnovers}</Text>
                <Text style={styles.statBoxLabel}>TO</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxValue}>{stats.fouls}</Text>
                <Text style={styles.statBoxLabel}>PF</Text>
              </View>
            </View>
          </View>

          <View style={styles.quickPointsSection}>
            <Text style={styles.sectionTitle}>Quick Points</Text>
            <View style={styles.quickPointsRow}>
              {quickPoints.map((btn) => (
                <TouchableOpacity
                  key={btn.label}
                  style={styles.quickPointButton}
                  onPress={() => updateStat(btn.key, btn.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickPointText}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.missesRow}>
              {quickMisses.map((btn) => (
                <TouchableOpacity
                  key={btn.label}
                  style={styles.missButton}
                  onPress={() => updateStat(btn.key, btn.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.missButtonText}>{btn.label}</Text>
                  <Text style={styles.missButtonValue}>{stats[btn.key]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.reboundsRow}>
              {reboundButtons.map((btn) => (
                <TouchableOpacity
                  key={btn.label}
                  style={styles.reboundButton}
                  onPress={() => updateStat(btn.key, btn.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reboundButtonText}>{btn.label}</Text>
                  <Text style={styles.reboundButtonValue}>{stats[btn.key]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.assistRow}>
              {assistButtons.map((btn) => (
                <TouchableOpacity
                  key={btn.label}
                  style={styles.assistButton}
                  onPress={() => updateStat(btn.key, btn.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.assistButtonText}>{btn.label}</Text>
                  <Text style={styles.assistButtonValue}>{stats[btn.key]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.negativeRow}>
              {negativeButtons.map((btn) => (
                <TouchableOpacity
                  key={btn.label}
                  style={styles.negativeButton}
                  onPress={() => updateStat(btn.key, btn.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.negativeButtonText}>{btn.label}</Text>
                  <Text style={styles.negativeButtonValue}>{stats[btn.key]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Quick Stats</Text>
            <View style={styles.statButtonGrid}>
              {statButtons.map((btn) => (
                <View key={btn.key} style={styles.statButtonRow}>
                  <TouchableOpacity
                    style={styles.statButtonLarge}
                    onPress={() => updateStat(btn.key, 1)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.statButtonLabel}>{btn.label}</Text>
                    <Text style={styles.statButtonValue}>{stats[btn.key]}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.undoStatButton}
                    onPress={() => updateStat(btn.key, -1)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.undoStatText}>-</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
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
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    ...Platform.select({
      ios: {
        paddingTop: 60,
      },
      android: {
        paddingTop: theme.spacing.lg,
      },
      web: {
        paddingTop: theme.spacing.lg,
      },
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  jerseyBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6900',
    alignItems: 'center',
    justifyContent: 'center',
  },
  jerseyBadgeText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  playerName: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  currentStats: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase' as const,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FF6900',
    marginBottom: 4,
  },
  statBoxLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '600' as const,
  },
  quickPointsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  quickPointsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  quickPointButton: {
    flex: 1,
    backgroundColor: '#FF6900',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPointText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },

  statsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  statButtonGrid: {
    gap: theme.spacing.sm,
  },
  statButtonRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statButtonLarge: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statButtonLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  statButtonValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FF6900',
  },
  undoStatButton: {
    width: 56,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  undoStatText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: theme.colors.textSecondary,
  },
  missesRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  missButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  missButtonValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  reboundsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  reboundButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reboundButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  reboundButtonValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  assistRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  assistButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assistButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  assistButtonValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  negativeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  negativeButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  negativeButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  negativeButtonValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
