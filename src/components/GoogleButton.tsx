import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme';

type Props = { onPress: () => void; loading?: boolean };

const web = {
  transitionProperty: 'border-color, background-color',
  transitionDuration: '150ms',
} as object;

export default function GoogleButton({ onPress, loading }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel="Login with Google"
      style={(state) => {
        const hovered = (state as any).hovered as boolean | undefined;
        return [
          styles.btn,
          web,
          hovered && !loading && styles.hover,
          state.pressed && styles.pressed,
          loading && styles.disabled,
        ];
      }}
    >
      {loading ? (
        <>
          <ActivityIndicator color={colors.brand} />
          <Text style={styles.label}>Signing in…</Text>
        </>
      ) : (
        <>
          <Text style={styles.g}>G</Text>
          <Text style={styles.label}>Login with Google</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 50,
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.tint,
    paddingHorizontal: 16,
  },
  hover: { borderColor: colors.borderStrong },
  pressed: { backgroundColor: 'rgba(158, 62, 33, 0.09)' },
  disabled: { opacity: 0.85 },
  g: { color: '#4285F4', fontWeight: '800', fontSize: 18 },
  label: { fontSize: 15, fontWeight: '600', color: colors.text },
});