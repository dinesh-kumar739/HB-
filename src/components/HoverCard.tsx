import React from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, shadow } from '../theme';

const web = {
  transitionProperty: 'transform, box-shadow, border-color',
  transitionDuration: '180ms',
  transitionTimingFunction: 'ease-out',
  cursor: 'default',
} as object;

export default function HoverCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessible={false}
      style={(state) => {
        const hovered = (state as any).hovered as boolean | undefined;
        return [styles.card, web, style, hovered && styles.hover];
      }}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.tint,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: 20,
    gap: 6,
    boxShadow: shadow.rest,
  },
  hover: {
    borderColor: colors.borderStrong,
    transform: [{ scale: 1.02 }],
    boxShadow: shadow.hover,
  },
});