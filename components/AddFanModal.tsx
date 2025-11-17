import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { X, Mail, User } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

interface AddFanModalProps {
  visible: boolean;
  onClose: () => void;
  teamId: string;
}

export default function AddFanModal({ visible, onClose, teamId }: AddFanModalProps) {
  const { players, addFan } = useApp();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  const teamPlayers = players.filter((p) => p.teamId === teamId);

  const handleSave = () => {
    if (name && email) {
      const selectedPlayer = teamPlayers.find((p) => p.id === selectedPlayerId);
      
      addFan({
        id: Date.now().toString(),
        name,
        email,
        teamId,
        playerId: selectedPlayerId || undefined,
        playerName: selectedPlayer?.name,
        status: 'invited',
        invitedAt: new Date().toISOString().split('T')[0],
      });

      setName('');
      setEmail('');
      setSelectedPlayerId('');
      onClose();
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setSelectedPlayerId('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Invite Fan</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parent/Guardian Name *</Text>
              <View style={styles.inputContainer}>
                <User size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter name"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="parent@email.com"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Player (Optional)</Text>
              <Text style={styles.helperText}>Link this fan to a player on the roster</Text>
              <ScrollView style={styles.playersList} showsVerticalScrollIndicator={false}>
                {teamPlayers.map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    style={[
                      styles.playerOption,
                      selectedPlayerId === player.id && styles.playerOptionSelected,
                    ]}
                    onPress={() => setSelectedPlayerId(player.id === selectedPlayerId ? '' : player.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.playerInfo}>
                      <Text style={[
                        styles.playerName,
                        selectedPlayerId === player.id && styles.playerNameSelected,
                      ]}>
                        {player.name}
                      </Text>
                      <Text style={[
                        styles.playerNumber,
                        selectedPlayerId === player.id && styles.playerNumberSelected,
                      ]}>
                        #{player.jerseyNumber}
                      </Text>
                    </View>
                    {selectedPlayerId === player.id && (
                      <View style={styles.selectedIndicator} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.infoBox}>
              <Mail size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>
                An email invitation will be sent to join the team as a fan
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, (!name || !email) && styles.disabledButton]}
              onPress={handleSave}
              disabled={!name || !email}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>Send Invitation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
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
    padding: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  helperText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    paddingVertical: theme.spacing.sm,
  },
  playersList: {
    maxHeight: 200,
  },
  playerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  playerOptionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(255, 105, 0, 0.1)',
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
  playerNameSelected: {
    color: theme.colors.primary,
  },
  playerNumber: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  playerNumberSelected: {
    color: theme.colors.primary,
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
