import { TouchableOpacity, StyleSheet, Animated, View, Text, Modal } from 'react-native';
import { Plus, X, Users, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/constants/theme';
import { useState } from 'react';

interface FABProps {
  onPress?: () => void;
  onAddTeam?: () => void;
  onAddEvent?: () => void;
}

export default function FAB({ onPress, onAddTeam, onAddEvent }: FABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleAddTeam = () => {
    setIsOpen(false);
    onAddTeam?.();
  };

  const handleAddEvent = () => {
    setIsOpen(false);
    onAddEvent?.();
  };

  return (
    <>
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem} 
              activeOpacity={0.7}
              onPress={handleAddTeam}
            >
              <View style={styles.menuIconContainer}>
                <Users size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Add Team</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              activeOpacity={0.7}
              onPress={handleAddEvent}
            >
              <View style={styles.menuIconContainer}>
                <Calendar size={24} color={theme.colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity
        style={styles.fab}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#FF6900', '#FF6900']}
          style={styles.gradient}
        >
          {isOpen ? (
            <X size={28} color={theme.colors.text} strokeWidth={3} />
          ) : (
            <Plus size={28} color={theme.colors.text} strokeWidth={3} />
          )}
        </LinearGradient>
        <Animated.View style={styles.glow} />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute' as const,
    bottom: 90,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'visible' as const,
    elevation: 8,
    zIndex: 1000,
  },
  gradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute' as const,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6900',
    opacity: 0.4,
    shadowColor: '#FF6900',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    paddingBottom: 170,
    paddingRight: 24,
  },
  menuContainer: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    minWidth: 200,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 105, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
});
