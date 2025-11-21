import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings, Trash2 } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { theme } from '@/constants/theme';
import FAB from '@/components/FAB';
import AddTeamModal from '@/components/AddTeamModal';
import AddEventModal from '@/components/AddEventModal';
import SettingsModal from '@/components/SettingsModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import EventDetailModal from '@/components/EventDetailModal';
import { useRouter, usePathname } from 'expo-router';
import { useState } from 'react';
import { Event, Team, Player } from '@/types';
import uuid from 'react-native-uuid';

export default function HomeScreen() {
  const { user, teams = [], events = [], addTeam, addEvent, addPlayer, deleteEvent, updateEvent, refreshData, isLoading } = useApp();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [showAddTeamModal, setShowAddTeamModal] = useState<boolean>(false);
  const [showAddEventModal, setShowAddEventModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string } | null>(null);
  const [showEventDetail, setShowEventDetail] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } finally {
      setRefreshing(false);
    }
  };

  const upcomingEvents = (events || [])
    .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
    .slice(0, 3);

  if (isLoading && !refreshing && teams.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }



  const handleSaveTeam = async (teamData: {
    name: string;
    members: { id: string; name: string; jerseyNumber: string; position: string }[];
  }) => {
    const teamId = uuid.v4() as string;
    
    const newTeam: Team = {
      id: teamId,
      name: teamData.name,
      record: '0-0',
      playerCount: teamData.members.length,
      avgPPG: 0,
    };
    
    try {
      await addTeam(newTeam);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      for (const member of teamData.members) {
        const newPlayer: Player = {
          id: uuid.v4() as string,
          name: member.name,
          jerseyNumber: member.jerseyNumber,
          position: member.position,
          teamId: teamId,
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
        await addPlayer(newPlayer);
      }
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handleSaveEvent = (eventData: {
    type: 'game' | 'practice' | 'tournament';
    title: string;
    teamId: string;
    teamName: string;
    date: string;
    time: string;
    location: string;
    opponent?: string;
  }) => {
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
  };

  const handleDeleteEvent = (eventId: string, eventTitle: string) => {
    setEventToDelete({ id: eventId, title: eventTitle });
    setDeleteDialogVisible(true);
  };

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetail(true);
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    updateEvent(updatedEvent);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteEvent(eventToDelete.id);
      setEventToDelete(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{user?.fullName || 'Coach'}</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={() => setShowSettingsModal(true)}>
            <Settings size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Teams</Text>
            <TouchableOpacity onPress={() => setShowAddTeamModal(true)}>
              <Text style={styles.addButton}>+ Add Team</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.teamsGrid}>
            {teams.map((team) => (
              <View key={team.id} style={styles.teamCard}>
                <TouchableOpacity
                  style={styles.teamCardInner}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/(tabs)/team/${team.id}`)}
                >
                  <Text style={styles.teamCardName}>{team.name}</Text>
                  <Text style={styles.teamCardRecord}>{team.record}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <TouchableOpacity onPress={() => setShowAddEventModal(true)}>
              <Text style={styles.addButton}>+ Add Event</Text>
            </TouchableOpacity>
          </View>

          {upcomingEvents.map((event) => {
            const eventDate = new Date(event.date + ' ' + event.time);
            return (
              <View key={event.id} style={styles.eventCard}>
              <TouchableOpacity
                style={styles.eventMainContent}
                onPress={() => handleEventPress(event)}
                activeOpacity={0.7}
              >
                <View style={styles.eventBadge}>
                  <Text style={[styles.eventBadgeText, event.type === 'game' ? styles.gameBadge : styles.practiceBadge]}>
                    {event.type}
                  </Text>
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventTime}>{`${eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} | ${eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`}</Text>
                <Text style={styles.eventLocation}>{event.location}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteEvent(event.id, event.title)}
                activeOpacity={0.7}
                style={styles.deleteButton}
              >
                <Trash2 size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Results</Text>
          <View style={styles.resultCard}>
            <View>
              <Text style={styles.resultOpponent}>vs Central Warriors</Text>
              <Text style={styles.resultDate}>Oct 31</Text>
            </View>
            <Text style={styles.resultScore}>78-65</Text>
          </View>
        </View>
      </ScrollView>

      {pathname === '/' && (
        <FAB 
          onAddTeam={() => setShowAddTeamModal(true)}
          onAddEvent={() => setShowAddEventModal(true)}
        />
      )}

      <AddTeamModal
        visible={showAddTeamModal}
        onClose={() => setShowAddTeamModal(false)}
        onSave={handleSaveTeam}
      />

      <AddEventModal
        visible={showAddEventModal}
        onClose={() => setShowAddEventModal(false)}
        onSave={handleSaveEvent}
      />

      <SettingsModal
        visible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
      
      <ConfirmDialog
        visible={deleteDialogVisible}
        title="Delete Event"
        message={eventToDelete ? `Are you sure you want to delete "${eventToDelete.title}"?` : "Are you sure you want to delete this event?"}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialogVisible(false)}
      />

      <EventDetailModal
        visible={showEventDetail}
        event={selectedEvent}
        onClose={() => setShowEventDetail(false)}
        onUpdate={handleUpdateEvent}
      />
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  greeting: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  username: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.sm,
  },
  teamCard: {
    width: '50%',
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  teamCardInner: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  teamCardName: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  teamCardRecord: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: '700' as const,
    color: theme.colors.primary,
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
    marginBottom: theme.spacing.md,
  },
  addButton: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.primary,
  },

  eventCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventMainContent: {
    flex: 1,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  eventBadge: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  eventBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  gameBadge: {
    backgroundColor: 'rgba(255, 105, 0, 0.2)',
    color: theme.colors.primary,
  },
  practiceBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    color: '#3B82F6',
  },
  eventTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  eventTime: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  eventLocation: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  resultCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultOpponent: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  resultDate: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  resultScore: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700' as const,
    color: theme.colors.success,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
  },
  emptyStateText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});