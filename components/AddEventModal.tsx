import { useState } from 'react';
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
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { X, Calendar, Clock } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (eventData: {
    type: 'game' | 'practice' | 'tournament';
    title: string;
    teamId: string;
    teamName: string;
    date: string;
    time: string;
    location: string;
    opponent?: string;
  }) => void;
}

export default function AddEventModal({ visible, onClose, onSave }: AddEventModalProps) {
  const { teams } = useApp();
  const [eventType, setEventType] = useState<'game' | 'practice' | 'tournament'>('game');
  const [title, setTitle] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [opponent, setOpponent] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());

  const handleSave = () => {
    if (title.trim() && selectedTeamId && date.trim() && time.trim() && location.trim()) {
      const selectedTeam = teams.find(t => t.id === selectedTeamId);
      onSave({
        type: eventType,
        title: title.trim(),
        teamId: selectedTeamId,
        teamName: selectedTeam?.name || '',
        date: date.trim(),
        time: time.trim(),
        location: location.trim(),
        opponent: opponent.trim() || undefined,
      });
      resetForm();
      onClose();
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android' || Platform.OS === 'web') {
      setShowDatePicker(false);
    }
    if (selectedDate && event.type !== 'dismissed') {
      setSelectedDate(selectedDate);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      setDate(formattedDate);
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (Platform.OS === 'android' || Platform.OS === 'web') {
      setShowTimePicker(false);
    }
    if (selectedTime && event.type !== 'dismissed') {
      setSelectedTime(selectedTime);
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      setTime(formattedTime);
    } else if (event.type === 'dismissed') {
      setShowTimePicker(false);
    }
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
  };

  const closeTimePicker = () => {
    setShowTimePicker(false);
  };

  const resetForm = () => {
    setEventType('game');
    setTitle('');
    setSelectedTeamId(teams[0]?.id || '');
    setDate('');
    setTime('');
    setLocation('');
    setOpponent('');
    setShowDatePicker(false);
    setShowTimePicker(false);
    setSelectedDate(new Date());
    setSelectedTime(new Date());
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Event</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Calendar size={20} color={date ? theme.colors.text : theme.colors.textSecondary} />
              <Text style={[styles.dateTimeText, !date && styles.dateTimePlaceholder]}>
                {date || 'Select Date'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.select({
                    ios: 'spinner',
                    android: 'default',
                    web: 'default',
                  })}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  style={Platform.OS === 'web' ? styles.webPicker : undefined}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={closeDatePicker}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
              activeOpacity={0.7}
            >
              <Clock size={20} color={time ? theme.colors.text : theme.colors.textSecondary} />
              <Text style={[styles.dateTimeText, !time && styles.dateTimePlaceholder]}>
                {time || 'Select Time'}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display={Platform.select({
                    ios: 'spinner',
                    android: 'default',
                    web: 'default',
                  })}
                  onChange={handleTimeChange}
                  style={Platform.OS === 'web' ? styles.webPicker : undefined}
                />
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={closeTimePicker}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
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
            <Text style={styles.saveButtonText}>Create Event</Text>
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
  section: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
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
  dateTimeButton: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dateTimeText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  dateTimePlaceholder: {
    color: theme.colors.textSecondary,
  },
  doneButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  doneButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  pickerContainer: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  webPicker: {
    width: '100%',
  },
});
