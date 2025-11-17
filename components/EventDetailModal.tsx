import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { X, Calendar, Clock, MapPin } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Event } from '@/types';
import { useApp } from '@/contexts/AppContext';

interface EventDetailModalProps {
  visible: boolean;
  event: Event | null;
  onClose: () => void;
  onUpdate: (updatedEvent: Event) => void;
}

export default function EventDetailModal({
  visible,
  event,
  onClose,
  onUpdate,
}: EventDetailModalProps) {
  const { teams } = useApp();
  const [eventType, setEventType] = useState<'game' | 'practice' | 'tournament'>('game');
  const [title, setTitle] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [opponent, setOpponent] = useState<string>('');
  const [isHome, setIsHome] = useState<boolean>(false);

  useEffect(() => {
    if (event) {
      setEventType(event.type);
      setTitle(event.title);
      setSelectedTeamId(event.teamId);
      setDate(event.date);
      setTime(event.time);
      setLocation(event.location);
      setOpponent(event.opponent || '');
      setIsHome(event.isHome || false);
    }
  }, [event]);

  const handleSave = () => {
    if (!event) return;

    if (title.trim() && selectedTeamId && date.trim() && time.trim() && location.trim()) {
      const selectedTeam = teams.find(t => t.id === selectedTeamId);
      const updatedEvent: Event = {
        ...event,
        type: eventType,
        title: title.trim(),
        teamId: selectedTeamId,
        teamName: selectedTeam?.name || event.teamName,
        date: date.trim(),
        time: time.trim(),
        location: location.trim(),
        opponent: opponent.trim() || undefined,
        isHome,
      };
      onUpdate(updatedEvent);
      onClose();
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateStr;
    }
  };

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

  if (!event) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={[
                styles.typeBadge,
                eventType === 'game' && styles.gameBadge,
                eventType === 'practice' && styles.practiceBadge,
                eventType === 'tournament' && styles.tournamentBadge,
              ]}>
                <Text style={[
                  styles.typeBadgeText,
                  eventType === 'game' && styles.gameBadgeText,
                  eventType === 'practice' && styles.practiceBadgeText,
                  eventType === 'tournament' && styles.tournamentBadgeText,
                ]}>
                  {eventType.toUpperCase()}
                </Text>
              </View>
              {(isHome && eventType === 'game') ? (
                <View style={styles.homeBadge}>
                  <Text style={styles.homeBadgeText}>HOME</Text>
                </View>
              ) : null}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.eventTitle}>{title}</Text>
          {opponent && (
            <Text style={styles.opponentText}>vs {opponent}</Text>
          )}
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Calendar size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>{formatDate(date)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Clock size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>{formatTime(time)}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MapPin size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>{location}</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Edit Event</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Event Type</Text>
            <View style={styles.typeSelector}>
              {(['game', 'practice', 'tournament'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    eventType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setEventType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      eventType === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Event Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter event title"
              placeholderTextColor={theme.colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {eventType === 'game' && (
            <>
              <View style={styles.section}>
                <Text style={styles.label}>Opponent (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter opponent name"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={opponent}
                  onChangeText={setOpponent}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.label}>Game Location</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      isHome && styles.typeButtonActive,
                    ]}
                    onPress={() => setIsHome(true)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        isHome && styles.typeButtonTextActive,
                      ]}
                    >
                      Home
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      !isHome && styles.typeButtonActive,
                    ]}
                    onPress={() => setIsHome(false)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        !isHome && styles.typeButtonTextActive,
                      ]}
                    >
                      Away
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>Team</Text>
            <View style={styles.teamSelector}>
              {teams.map((team) => (
                <TouchableOpacity
                  key={team.id}
                  style={[
                    styles.teamButton,
                    selectedTeamId === team.id && styles.teamButtonActive,
                  ]}
                  onPress={() => setSelectedTeamId(team.id)}
                >
                  <Text
                    style={[
                      styles.teamButtonText,
                      selectedTeamId === team.id && styles.teamButtonTextActive,
                    ]}
                  >
                    {team.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/DD/YYYY"
              placeholderTextColor={theme.colors.textSecondary}
              value={date}
              onChangeText={setDate}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM AM/PM"
              placeholderTextColor={theme.colors.textSecondary}
              value={time}
              onChangeText={setTime}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter location"
              placeholderTextColor={theme.colors.textSecondary}
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  gameBadge: {
    backgroundColor: 'rgba(255, 105, 0, 0.2)',
  },
  practiceBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  tournamentBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  typeBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700' as const,
  },
  gameBadgeText: {
    color: theme.colors.primary,
  },
  practiceBadgeText: {
    color: '#3B82F6',
  },
  tournamentBadgeText: {
    color: '#8B5CF6',
  },
  homeBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  homeBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '700' as const,
    color: '#22C55E',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  opponentText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '500' as const,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  infoText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700' as const,
    color: theme.colors.text,
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
  typeSelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: 'rgba(255, 105, 0, 0.15)',
    borderColor: theme.colors.primary,
  },
  typeButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize' as const,
  },
  typeButtonTextActive: {
    color: theme.colors.primary,
  },
  teamSelector: {
    gap: theme.spacing.sm,
  },
  teamButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  teamButtonActive: {
    backgroundColor: 'rgba(255, 105, 0, 0.15)',
    borderColor: theme.colors.primary,
  },
  teamButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
  },
  teamButtonTextActive: {
    color: theme.colors.primary,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  saveButton: {
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
});
