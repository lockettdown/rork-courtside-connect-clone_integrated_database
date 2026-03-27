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
import { X, Plus, Trash2 } from 'lucide-react-native';
import { theme } from '@/constants/theme';

interface TeamMember {
  id: string;
  name: string;
  jerseyNumber: string;
  position: string;
}

interface AddTeamModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (teamData: {
    name: string;
    members: TeamMember[];
  }) => void;
}

export default function AddTeamModal({ visible, onClose, onSave }: AddTeamModalProps) {
  const [teamName, setTeamName] = useState<string>('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  
  const [memberName, setMemberName] = useState<string>('');
  const [jerseyNumber, setJerseyNumber] = useState<string>('');
  const [position, setPosition] = useState<string>('');

  const handleAddMember = () => {
    if (memberName.trim() && jerseyNumber.trim() && position.trim()) {
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: memberName.trim(),
        jerseyNumber: jerseyNumber.trim(),
        position: position.trim(),
      };
      setMembers([...members, newMember]);
      setMemberName('');
      setJerseyNumber('');
      setPosition('');
    }
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleSave = () => {
    if (teamName.trim()) {
      onSave({
        name: teamName.trim(),
        members,
      });
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setTeamName('');
    setMembers([]);
    setMemberName('');
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
          <Text style={styles.headerTitle}>New Team</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Team Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter team name"
              placeholderTextColor={theme.colors.textSecondary}
              value={teamName}
              onChangeText={setTeamName}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Members</Text>
            <View style={styles.addMemberForm}>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.flexInput]}
                  placeholder="Player name"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={memberName}
                  onChangeText={setMemberName}
                />
                <TextInput
                  style={[styles.input, styles.jerseyInput]}
                  placeholder="No."
                  placeholderTextColor={theme.colors.textSecondary}
                  value={jerseyNumber}
                  onChangeText={setJerseyNumber}
                  keyboardType="number-pad"
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Position"
                placeholderTextColor={theme.colors.textSecondary}
                value={position}
                onChangeText={setPosition}
              />
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={handleAddMember}
                activeOpacity={0.7}
              >
                <Plus size={20} color={theme.colors.text} />
                <Text style={styles.addButtonText}>Add Member</Text>
              </TouchableOpacity>
            </View>

            {members.length > 0 && (
              <View style={styles.list}>
                {members.map((member) => (
                  <View key={member.id} style={styles.listItem}>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemText}>{member.name}</Text>
                      <Text style={styles.listItemSubtext}>#{member.jerseyNumber} • {member.position}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveMember(member.id)}
                      style={styles.deleteButton}
                    >
                      <Trash2 size={18} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>


        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Create Team</Text>
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
    paddingVertical: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase' as const,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  flexInput: {
    flex: 1,
  },
  jerseyInput: {
    width: 80,
  },
  addMemberForm: {
    marginBottom: theme.spacing.md,
  },

  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6900',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  addButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  list: {
    gap: theme.spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  listItemContent: {
    flex: 1,
  },
  listItemText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: 2,
  },
  listItemSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  deleteButton: {
    padding: theme.spacing.sm,
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
