import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { theme } from '@/constants/theme';
import EventDetailModal from '@/components/EventDetailModal';
import AddEventModal from '@/components/AddEventModal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useState } from 'react';
import { Event } from '@/types';
import { Plus, Trash2 } from 'lucide-react-native';

type FilterType = 'today' | 'week' | 'all';

export default function EventsScreen() {
  const { events, updateEvent, addEvent, deleteEvent } = useApp();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterType>('today');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<{ id: string; title: string } | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getWeekEnd = () => {
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return weekEnd;
  };

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    if (filter === 'today') {
      return eventDate.getTime() === today.getTime();
    } else if (filter === 'week') {
      return eventDate >= today && eventDate <= getWeekEnd();
    }
    return true;
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const date = new Date(event.date);
    const dateKey = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, typeof events>);

  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return timeStr;
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch (error) {
      return timeStr;
    }
  };

  const handleEventPress = (event: Event) => {
    setSelectedEvent(event);
    setDetailModalVisible(true);
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    updateEvent(updatedEvent);
  };

  const handleAddEvent = (eventData: {
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
      id: Date.now().toString(),
      ...eventData,
    };
    addEvent(newEvent);
  };

  const handleDeleteEvent = (eventId: string, eventTitle: string) => {
    setEventToDelete({ id: eventId, title: eventTitle });
    setDeleteDialogVisible(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteEvent(eventToDelete.id);
      setEventToDelete(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Events</Text>
        <TouchableOpacity 
          onPress={() => setAddModalVisible(true)}
          style={styles.addButton}
          activeOpacity={0.7}
        >
          <Plus size={24} color={theme.colors.text} />
          <Text style={styles.addButtonText}>Add Event</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => setFilter('today')}
          activeOpacity={0.7}
        >
          <View style={[styles.filterPill, filter === 'today' && styles.filterPillActive]}>
            <Text style={[styles.filterText, filter === 'today' && styles.filterTextActive]}>
              Today
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('week')}
          activeOpacity={0.7}
        >
          <View style={[styles.filterPill, filter === 'week' && styles.filterPillActive]}>
            <Text style={[styles.filterText, filter === 'week' && styles.filterTextActive]}>
              This Week
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('all')}
          activeOpacity={0.7}
        >
          <View style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}>
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedEvents).map(([date, dayEvents]) => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateLabel}>{date}</Text>
            {dayEvents.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                <TouchableOpacity
                  onPress={() => handleEventPress(event)}
                  activeOpacity={0.7}
                  style={styles.eventCardTouchable}
                >
                  <Text style={styles.eventTime}>{formatTime(event.time)}</Text>
                  <View style={styles.eventContent}>
                    <View style={styles.eventBadge}>
                      <Text style={[styles.eventBadgeText, event.type === 'game' ? styles.gameBadge : styles.practiceBadge]}>
                        {event.type}
                      </Text>
                    </View>
                    <Text style={styles.eventTeam}>{event.teamName}</Text>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventLocation}>{event.location}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={(e) => {
                    handleDeleteEvent(event.id, event.title);
                  }}
                  activeOpacity={0.7}
                  style={styles.deleteButton}
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      
      <EventDetailModal
        visible={detailModalVisible}
        event={selectedEvent}
        onClose={() => setDetailModalVisible(false)}
        onUpdate={handleUpdateEvent}
      />
      
      <AddEventModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleAddEvent}
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
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  filterPill: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surfaceLight,
  },
  filterPillActive: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
  },
  filterTextActive: {
    color: theme.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: theme.spacing.lg,
  },
  dateLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  eventCardTouchable: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  eventTime: {
    fontSize: theme.fontSize.md,
    fontWeight: '700' as const,
    color: theme.colors.text,
    width: 60,
  },
  eventContent: {
    flex: 1,
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
    backgroundColor: 'rgba(232, 116, 59, 0.2)',
    color: theme.colors.primary,
  },
  practiceBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    color: '#3B82F6',
  },
  eventTeam: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500' as const,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  eventTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  eventLocation: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
