import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
} from 'react-native';
import { X, Plus, Minus } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Player } from '@/types';

interface PlayerDetailModalProps {
  visible: boolean;
  player: Player | null;
  onClose: () => void;
  onSave: (updatedPlayer: Player) => void;
}

type ViewMode = 'view' | 'edit' | 'stats';

interface StatItem {
  key: keyof Player['stats'];
  label: string;
  shortLabel: string;
}

export default function PlayerDetailModal({ visible, player, onClose, onSave }: PlayerDetailModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('view');
  const [playerName, setPlayerName] = useState<string>('');
  const [jerseyNumber, setJerseyNumber] = useState<string>('');
  const [position, setPosition] = useState<string>('');
  const [currentStats, setCurrentStats] = useState<Player['stats']>({
    points: 0,
    assists: 0,
    rebounds: 0,
    offensiveRebounds: 0,
    defensiveRebounds: 0,
    steals: 0,
    blocks: 0,
    turnovers: 0,
    fouls: 0,
  });

  useEffect(() => {
    if (player) {
      setPlayerName(player.name);
      setJerseyNumber(player.jerseyNumber);
      setPosition(player.position || '');
      setCurrentStats(player.stats);
    }
  }, [player]);

  const handleSave = () => {
    if (player && playerName.trim() && jerseyNumber.trim()) {
      const updatedPlayer: Player = {
        ...player,
        name: playerName.trim(),
        jerseyNumber: jerseyNumber.trim(),
        position: position.trim() || undefined,
      };
      onSave(updatedPlayer);
      setViewMode('view');
    }
  };

  const handleSaveStats = () => {
    if (player) {
      const updatedPlayer: Player = {
        ...player,
        stats: currentStats,
      };
      onSave(updatedPlayer);
      setViewMode('view');
    }
  };

  const handleClose = () => {
    setViewMode('view');
    onClose();
  };

  const handleCancel = () => {
    if (player) {
      setPlayerName(player.name);
      setJerseyNumber(player.jerseyNumber);
      setPosition(player.position || '');
      setCurrentStats(player.stats);
    }
    setViewMode('view');
  };

  const incrementStat = useCallback((statKey: keyof Player['stats'], amount: number = 1) => {
    setCurrentStats(prev => ({
      ...prev,
      [statKey]: Math.max(0, prev[statKey] + amount),
    }));
  }, []);

  const decrementStat = useCallback((statKey: keyof Player['stats'], amount: number = 1) => {
    setCurrentStats(prev => ({
      ...prev,
      [statKey]: Math.max(0, prev[statKey] - amount),
    }));
  }, []);

  const statItems: StatItem[] = [
    { key: 'points', label: 'Points', shortLabel: 'PTS' },
    { key: 'assists', label: 'Assists', shortLabel: 'AST' },
    { key: 'turnovers', label: 'Turnovers', shortLabel: 'TO' },
    { key: 'fouls', label: 'Fouls', shortLabel: 'PF' },
    { key: 'offensiveRebounds', label: 'Off Rebounds', shortLabel: 'OREB' },
    { key: 'defensiveRebounds', label: 'Def Rebounds', shortLabel: 'DREB' },
    { key: 'steals', label: 'Steals', shortLabel: 'STL' },
  ];

  if (!player) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {viewMode === 'edit' ? 'Edit Player' : viewMode === 'stats' ? 'Track Stats' : 'Player Details'}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.playerHeader}>
            <View style={styles.playerAvatar}>
              <Text style={styles.playerAvatarText}>{player.name.charAt(0)}</Text>
            </View>
            
            {viewMode !== 'edit' ? (
              <>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.jerseyText}>#{player.jerseyNumber}</Text>
                {player.position && (
                  <Text style={styles.positionText}>{player.position}</Text>
                )}
              </>
            ) : null}
          </View>

          {viewMode === 'edit' ? (
            <View style={styles.editSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Player Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter player name"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={playerName}
                  onChangeText={setPlayerName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Jersey Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter jersey number"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={jerseyNumber}
                  onChangeText={setJerseyNumber}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Position</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter position (e.g. Guard, Forward, Center)"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={position}
                  onChangeText={setPosition}
                />
              </View>
            </View>
          ) : viewMode === 'stats' ? (
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Add Stats</Text>
              
              <View style={styles.statTrackingGrid}>
                {statItems.map((item) => (
                  <View key={item.key} style={styles.statTrackingCard}>
                    <Text style={styles.statTrackingLabel}>{item.label}</Text>
                    <View style={styles.statTrackingControls}>
                      <TouchableOpacity 
                        style={styles.statButton}
                        onPress={() => decrementStat(item.key)}
                        activeOpacity={0.7}
                      >
                        <Minus size={20} color={theme.colors.text} />
                      </TouchableOpacity>
                      
                      <Text style={styles.statTrackingValue}>
                        {currentStats[item.key].toFixed(0)}
                      </Text>
                      
                      <TouchableOpacity 
                        style={styles.statButton}
                        onPress={() => incrementStat(item.key)}
                        activeOpacity={0.7}
                      >
                        <Plus size={20} color={theme.colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
              
              <View style={styles.quickActions}>
                <Text style={styles.quickActionsTitle}>Quick Actions</Text>
                <View style={styles.quickActionsRow}>
                  <TouchableOpacity 
                    style={styles.quickActionButton}
                    onPress={() => incrementStat('points', 1)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.quickActionText}>+1 PT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickActionButton}
                    onPress={() => incrementStat('points', 2)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.quickActionText}>+2 PTS</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.quickActionButton}
                    onPress={() => incrementStat('points', 3)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.quickActionText}>+3 PTS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Season Stats</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{player.stats.points.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>PTS</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{player.stats.assists.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>AST</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{player.stats.rebounds.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>REB</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{player.stats.steals.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>STL</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{player.stats.blocks.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>BLK</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{player.stats.turnovers.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>TO</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{player.stats.fouls.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>PF</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {viewMode === 'view' ? (
            <View style={styles.viewActions}>
              <TouchableOpacity 
                style={styles.trackStatsButton} 
                onPress={() => setViewMode('stats')}
                activeOpacity={0.8}
              >
                <Text style={styles.trackStatsButtonText}>Track Stats</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => setViewMode('edit')}
                activeOpacity={0.8}
              >
                <Text style={styles.editButtonText}>Edit Player</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={viewMode === 'stats' ? handleSaveStats : handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Save {viewMode === 'stats' ? 'Stats' : 'Changes'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  playerHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  playerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6900',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  playerAvatarText: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  playerName: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  jerseyText: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  positionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  editSection: {
    padding: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase' as const,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statsSection: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FF6900',
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600' as const,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  viewActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  trackStatsButton: {
    flex: 1,
    backgroundColor: '#FF6900',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  trackStatsButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  editButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  editButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  editActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF6900',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  statTrackingGrid: {
    gap: theme.spacing.md,
  },
  statTrackingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statTrackingLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  statTrackingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  statButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6900',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTrackingValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: theme.colors.text,
    minWidth: 60,
    textAlign: 'center' as const,
  },
  quickActions: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  quickActionsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase' as const,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6900',
  },
  quickActionText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700' as const,
    color: '#FF6900',
  },
});
