import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { theme } from '@/constants/theme';

interface AddPlayerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (playerData: {
    name: string;
    jerseyNumber: string;
    position: string;
  }) => void;
}

export default function AddPlayerModal({ visible, onClose, onSave }: AddPlayerModalProps) {
  const [playerName, setPlayerName] = useState<string>('');
  const [jerseyNumber, setJerseyNumber] = useState<string>('');
  const [position, setPosition] = useState<string>('');

  const handleSave = () => {
    const hasName = playerName.trim().length > 0;
    const hasJersey = jerseyNumber.trim().length > 0;
    
    if (hasName || hasJersey) {
      onSave({
        name: playerName.trim(),
        jerseyNumber: jerseyNumber.trim(),
        position: position.trim(),
      });
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setPlayerName('');
    setJerseyNumber('');
    setPosition('');
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
          <Text style={styles.headerTitle}>Add Player</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.label}>Player Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter player name"
              placeholderTextColor={theme.colors.textSecondary}
              value={playerName}
              onChangeText={setPlayerName}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Jersey Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter jersey number"
              placeholderTextColor={theme.colors.textSecondary}
              value={jerseyNumber}
              onChangeText={setJerseyNumber}
            />
          </View>

          <View style={styles.section}>
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

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Add Player</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  section: {
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
