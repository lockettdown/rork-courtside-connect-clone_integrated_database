import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { theme } from '@/constants/theme';
import { Calendar, MapPin, Mail, CheckCircle, Clock, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import AddPlayerModal from '@/components/AddPlayerModal';
import PlayerDetailModal from '@/components/PlayerDetailModal';
import AddEventModal from '@/components/AddEventModal';
import AddFanModal from '@/components/AddFanModal';
import { Player, Event } from '@/types';
import uuid from 'react-native-uuid';

export default function TeamScreen() {
  const { teamId } = useLocalSearchParams();
  const { teams, players, fans = [], addPlayer, updatePlayer, addEvent, deleteTeam, events } = useApp();
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<'roster' | 'stats' | 'events' | 'fans'>('roster');
  const [isAddPlayerModalVisible, setIsAddPlayerModalVisible] = useState<boolean>(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isPlayerDetailModalVisible, setIsPlayerDetailModalVisible] = useState<boolean>(false);
  const [isAddEventModalVisible, setIsAddEventModalVisible] = useState<boolean>(false);
  const [isAddFanModalVisible, setIsAddFanModalVisible] = useState<boolean>(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  
  const team = teams.find((t) => t.id === teamId);
  const teamPlayers = players.filter((p) => p.teamId === teamId);
  const teamEvents = events.filter((e) => e.teamId === teamId).sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);
    return dateB.getTime() - dateA.getTime();
  });
  const teamFans = fans.filter((f) => f.teamId === teamId);

  const handleDeleteTeam = () => {
    if (!team) return;
    setIsDeleteModalVisible(true);
  };

  const confirmDeleteTeam = () => {
    deleteTeam(teamId as string);
    setIsDeleteModalVisible(false);
    setIsAddPlayerModalVisible(false);
    setIsPlayerDetailModalVisible(false);
    setIsAddEventModalVisible(false);
    setIsAddFanModalVisible(false);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  if (!team) {
    return (
      <>
        <Stack.Screen options={{ title: 'Team Not Found' }} />
        <View style={styles.container}>
          <View style={styles.emptyState}>
            <Text style={styles.errorText}>Team not found</Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: team.name,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerRight: () => (
            <TouchableOpacity 
              onPress={handleDeleteTeam}
              style={{ marginRight: 8 }}
            >
              <Trash2 size={22} color={theme.colors.error} />
            </TouchableOpacity>
          ),
        }} 
      />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <Text style={styles.teamName}>{team.name}</Text>
                <Text style={styles.record}>{team.record}</Text>
                <Text style={styles.season}>2024-2025 Season</Text>
              </View>
              <TouchableOpacity 
                style={styles.addEventButton}
                onPress={() => setIsAddEventModalVisible(true)}
              >
                <Text style={styles.addEventButtonText}>+ Add Event</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tabContainer}
            contentContainerStyle={styles.tabContentContainer}
          >
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => setSelectedTab('roster')}
            >
              <Text style={[styles.tabText, selectedTab === 'roster' && styles.tabTextActive]}>Roster</Text>
              {selectedTab === 'roster' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => setSelectedTab('stats')}
            >
              <Text style={[styles.tabText, selectedTab === 'stats' && styles.tabTextActive]}>Stats</Text>
              {selectedTab === 'stats' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => setSelectedTab('events')}
            >
              <Text style={[styles.tabText, selectedTab === 'events' && styles.tabTextActive]}>Events</Text>
              {selectedTab === 'events' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.tab}
              onPress={() => setSelectedTab('fans')}
            >
              <Text style={[styles.tabText, selectedTab === 'fans' && styles.tabTextActive]}>Fans</Text>
              {selectedTab === 'fans' && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.section}>
            {selectedTab === 'roster' ? (
              <>
                <View style={styles.sectionHeader}>
                  <TouchableOpacity onPress={() => setIsAddPlayerModalVisible(true)}>
                    <Text style={styles.addButton}>+ Add Player</Text>
                  </TouchableOpacity>
                </View>

                {teamPlayers.map((player, index) => (
                  <TouchableOpacity 
                    key={player.id} 
                    style={styles.playerCard}
                    onPress={() => {
                      setSelectedPlayer(player);
                      setIsPlayerDetailModalVisible(true);
                    }}
                  >
                    <View style={styles.playerAvatar}>
                      <Text style={styles.playerAvatarText}>{player.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{player.name}</Text>
                      <Text style={styles.playerDetails}>
                        #{player.jerseyNumber}{player.position ? ` · ${player.position}` : ''}
                      </Text>
                    </View>
                    <View style={styles.playerStats}>
                      <Text style={styles.playerStatValue}>{player.stats.points.toFixed(1)}</Text>
                      <Text style={styles.playerStatLabel}>PTS</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                {teamPlayers.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No players added yet</Text>
                    <Text style={styles.emptySubtext}>Tap + Add Player to get started</Text>
                  </View>
                )}
              </>
            ) : selectedTab === 'stats' ? (
              <View style={styles.emptyState}>
                <Text style={styles.sectionSubtitle}>Coming soon</Text>
              </View>
            ) : selectedTab === 'fans' ? (
              <>
                <View style={styles.sectionHeader}>
                  <TouchableOpacity onPress={() => setIsAddFanModalVisible(true)}>
                    <Text style={styles.addButton}>+ Invite Fan</Text>
                  </TouchableOpacity>
                </View>

                {teamFans.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Mail size={32} color={theme.colors.textSecondary} />
                    <Text style={styles.emptyText}>No fans yet</Text>
                    <Text style={styles.emptySubtext}>Invite parents to join the team</Text>
                  </View>
                ) : (
                  teamFans.map((fan) => (
                    <View key={fan.id} style={styles.fanCard}>
                      <View style={styles.fanAvatar}>
                        <Text style={styles.fanAvatarText}>{fan.name.split(' ').map((n: string) => n[0]).join('')}</Text>
                      </View>
                      <View style={styles.fanInfo}>
                        <Text style={styles.fanName}>{fan.name}</Text>
                        <Text style={styles.fanPlayer}>{fan.playerName || 'No player linked'}</Text>
                      </View>
                      <View style={[styles.statusBadge, fan.status === 'active' ? styles.activeBadge : styles.invitedBadge]}>
                        {fan.status === 'active' ? (
                          <CheckCircle size={14} color={theme.colors.success} />
                        ) : (
                          <Clock size={14} color={theme.colors.textSecondary} />
                        )}
                        <Text style={[styles.statusText, fan.status === 'active' ? styles.activeText : styles.invitedText]}>
                          {fan.status === 'active' ? 'Active' : 'Invited'}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </>
            ) : (
              <>
                {teamEvents.map((event) => (
                  <TouchableOpacity key={event.id} style={styles.eventCard}>
                    <View style={styles.eventHeader}>
                      <View style={[styles.eventTypeBadge, event.type === 'game' ? styles.gameBadge : styles.practiceBadge]}>
                        <Text style={styles.eventTypeText}>{event.type === 'game' ? 'GAME' : 'PRACTICE'}</Text>
                      </View>
                      {event.isHome !== undefined && (
                        <Text style={styles.homeAwayText}>{event.isHome ? 'HOME' : 'AWAY'}</Text>
                      )}
                    </View>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.eventDetails}>
                      <View style={styles.eventDetailRow}>
                        <Calendar size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.eventDetailText}>
                          {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {event.time}
                        </Text>
                      </View>
                      <View style={styles.eventDetailRow}>
                        <MapPin size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.eventDetailText}>{event.location}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

                {teamEvents.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No events scheduled</Text>
                    <Text style={styles.emptySubtext}>Add events from the home screen</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>

        <AddPlayerModal
          visible={isAddPlayerModalVisible}
          onClose={() => setIsAddPlayerModalVisible(false)}
          onSave={(playerData) => {
            const newPlayer: Player = {
              id: uuid.v4() as string,
              name: playerData.name,
              jerseyNumber: playerData.jerseyNumber,
              position: playerData.position,
              teamId: teamId as string,
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
            setIsAddPlayerModalVisible(false);
          }}
        />

        <PlayerDetailModal
          visible={isPlayerDetailModalVisible}
          player={selectedPlayer}
          onClose={() => {
            setIsPlayerDetailModalVisible(false);
            setSelectedPlayer(null);
          }}
          onSave={(updatedPlayer) => {
            updatePlayer(updatedPlayer);
            setIsPlayerDetailModalVisible(false);
            setSelectedPlayer(null);
          }}
        />

        <AddEventModal
          visible={isAddEventModalVisible}
          onClose={() => setIsAddEventModalVisible(false)}
          onSave={(eventData) => {
            const newEvent: Event = {
              id: uuid.v4() as string,
              type: eventData.type,
              title: eventData.title,
              teamId: eventData.teamId,
              teamName: eventData.teamName,
              date: eventData.date,
              time: eventData.time,
              location: eventData.location,
              opponent: eventData.opponent,
            };
            addEvent(newEvent);
            setIsAddEventModalVisible(false);
          }}
        />

        <AddFanModal
          visible={isAddFanModalVisible}
          onClose={() => setIsAddFanModalVisible(false)}
          teamId={teamId as string}
        />

        <Modal
          visible={isDeleteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsDeleteModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.deleteModalContainer}>
              <View style={styles.deleteModalHeader}>
                <Text style={styles.deleteModalTitle}>Delete Team</Text>
              </View>
              <View style={styles.deleteModalBody}>
                <Text style={styles.deleteModalText}>
                  Are you sure you want to delete <Text style={styles.teamNameBold}>{team.name}</Text>?
                </Text>
                <Text style={styles.deleteModalWarning}>
                  This action cannot be undone. All players, events, and data will be permanently deleted.
                </Text>
              </View>
              <View style={styles.deleteModalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsDeleteModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={confirmDeleteTeam}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  teamName: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  record: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  season: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  addEventButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginTop: 4,
  },
  addEventButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  addButton: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.primary,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  playerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  playerAvatarText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  playerDetails: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  playerStats: {
    alignItems: 'center',
  },
  playerStatValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700' as const,
    color: theme.colors.primary,
  },
  playerStatLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  tabContainer: {
    marginBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  tabContentContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  tab: {
    paddingVertical: theme.spacing.md,
    position: 'relative' as const,
  },
  tabText: {
    fontSize: 18,
    fontWeight: '400' as const,
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '400' as const,
  },
  tabIndicator: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#007AFF',
  },
  eventCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  eventTypeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  gameBadge: {
    backgroundColor: theme.colors.primary + '20',
  },
  practiceBadge: {
    backgroundColor: theme.colors.textSecondary + '20',
  },
  eventTypeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  homeAwayText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
  },
  eventTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  eventDetails: {
    gap: theme.spacing.xs,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  eventDetailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  fanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  fanAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fanAvatarText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  fanInfo: {
    flex: 1,
  },
  fanName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  fanPlayer: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  activeBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  invitedBadge: {
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600' as const,
  },
  activeText: {
    color: theme.colors.success,
  },
  invitedText: {
    color: theme.colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  deleteModalContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  deleteModalHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background,
  },
  deleteModalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  deleteModalBody: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  deleteModalText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    lineHeight: 22,
  },
  teamNameBold: {
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  deleteModalWarning: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
  },
  backButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
});
