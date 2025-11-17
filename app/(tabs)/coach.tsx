import { View, Text, StyleSheet, TouchableOpacity, PanResponder, Image, LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eraser } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect } from 'react-native-svg';

import { theme } from '@/constants/theme';
import { useState, useRef, useMemo } from 'react';

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [canvasSize, setCanvasSize] = useState({ width: 360, height: 360 });
  
  const currentPathRef = useRef<string>('');
  const pathsRef = useRef<string[]>([]);

  const panResponder = useMemo(
    () => PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newPath = `M ${locationX} ${locationY}`;
        currentPathRef.current = newPath;
        setCurrentPath(newPath);
        console.log('Drawing started at:', locationX, locationY);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPathRef.current = `${currentPathRef.current} L ${locationX} ${locationY}`;
        setCurrentPath(currentPathRef.current);
      },
      onPanResponderRelease: () => {
        console.log('Drawing ended. Current path:', currentPathRef.current);
        if (currentPathRef.current) {
          const newPaths = [...pathsRef.current, currentPathRef.current];
          pathsRef.current = newPaths;
          setPaths(newPaths);
          console.log('Total paths:', newPaths.length);
          currentPathRef.current = '';
          setCurrentPath('');
        }
      },
    }),
    []
  );

  const clearCanvas = () => {
    console.log('Clearing canvas');
    pathsRef.current = [];
    setPaths([]);
    setCurrentPath('');
    currentPathRef.current = '';
  };

  const onCanvasLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCanvasSize({ width, height });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Coaches Corner</Text>
        <Text style={styles.subtitle}>Draw and save plays for your team</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.canvasContainer}>
          <View style={styles.canvas} onLayout={onCanvasLayout} {...panResponder.panHandlers}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/9t1g9akkuw5vbiiij1891' }}
              style={styles.courtImage}
              resizeMode="cover"
            />
            <Svg width="100%" height="100%" viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`} style={styles.drawingOverlay}>
              <Rect x="0" y="0" width={canvasSize.width} height={canvasSize.height} fill="transparent" />
              
              {paths.map((path, index) => (
                <Path
                  key={index}
                  d={path}
                  stroke="#FF0000"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              
              {currentPath && (
                <Path
                  d={currentPath}
                  stroke="#FF0000"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearCanvas}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#E8743B', '#D96428']}
              style={styles.clearButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Eraser size={18} color="#FFFFFF" />
              <Text style={styles.clearButtonText}>Clear</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  canvasContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden' as const,
  },
  canvas: {
    width: '100%',
    aspectRatio: 0.64,
    position: 'relative' as const,
  },
  courtImage: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
  },
  drawingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
  },
  controls: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: 60,
  },
  clearButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden' as const,
    elevation: 3,
    shadowColor: '#E8743B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  clearButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
  },
  clearButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },

});
