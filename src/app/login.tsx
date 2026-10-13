import React from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import GoogleButton from '../components/GoogleButton';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { ALLOWED_DOMAIN } from '../services/domain';
import { colors } from '../theme';

export default function Login() {
  const { signInWithGoogle, signingIn, error } = useAuth();
  const { width } = useWindowDimensions();
  const split = width >= 900;

  return (
    <View style={[styles.page, split && { flexDirection: 'row' }]}>
      {split && (
        <View style={styles.panel}>
          <Logo size={120} />
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.formWrap}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          {!split && <Logo size={52} />}

          <View style={{ gap: 6 }}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.sub}>
              Use your @{ALLOWED_DOMAIN} Google account to continue.
            </Text>
          </View>

          {error ? (
            <View style={styles.error} accessibilityRole="alert">
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <GoogleButton onPress={signInWithGoogle} loading={signingIn} />

          <Text style={styles.note}>
            Accounts outside @{ALLOWED_DOMAIN} cannot access this app.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  panel: {
    flex: 1,
    backgroundColor: colors.tint,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formWrap: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  form: { width: '100%', maxWidth: 380, gap: 20 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  sub: { fontSize: 15, lineHeight: 22, color: colors.muted },
  error: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  errorText: { color: colors.danger, fontSize: 14, lineHeight: 20 },
  note: { fontSize: 12, color: colors.muted },
});