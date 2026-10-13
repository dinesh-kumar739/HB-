import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import HoverCard from '../components/HoverCard';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { ALLOWED_DOMAIN } from '../services/domain';
import { colors, radius } from '../theme';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const [imgFailed, setImgFailed] = useState(false);
  const wide = width >= 768;

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const firstName = user.name.split(' ')[0];
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const pad = wide ? 32 : 16;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.topbar}>
        <View style={[styles.inner, styles.topInner, { paddingHorizontal: pad }]}>
          <Logo size={34} />
          <View style={styles.topRight}>
            {wide && <Text style={styles.topEmail}>{user.email}</Text>}
            {user.photoURL && !imgFailed ? (
              <Image
                source={{ uri: user.photoURL }}
                style={styles.avatar}
                onError={() => setImgFailed(true)}
              />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <Pressable
              onPress={logout}
              accessibilityRole="button"
              style={(state) => {
                const hovered = (state as any).hovered as boolean | undefined;
                return [styles.logout, hovered && { borderColor: colors.borderStrong }];
              }}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingVertical: wide ? 40 : 24 }}>
        <View style={[styles.inner, { paddingHorizontal: pad, gap: 24 }]}>
          <View style={{ gap: 4 }}>
            <Text style={styles.h1}>Hi, {firstName}</Text>
            <Text style={styles.sub}>You are signed in as {user.email}</Text>
          </View>

          <View style={[styles.grid, { flexDirection: wide ? 'row' : 'column' }]}>
            <HoverCard style={styles.item}>
              <Text style={styles.label}>ACCOUNT</Text>
              <Text style={styles.value} numberOfLines={1}>{user.name}</Text>
              <Text style={styles.desc} numberOfLines={1}>{user.email}</Text>
            </HoverCard>

            <HoverCard style={styles.item}>
              <Text style={styles.label}>ROLE</Text>
              <Text style={styles.value}>{isAdmin ? 'Admin' : 'User'}</Text>
              <Text style={styles.desc}>
                {isAdmin ? 'Full access, including admin tools.' : 'Standard access.'}
              </Text>
            </HoverCard>

            <HoverCard style={styles.item}>
              <Text style={styles.label}>DOMAIN</Text>
              <Text style={styles.value}>@{ALLOWED_DOMAIN}</Text>
              <View style={styles.pill}>
                <Text style={styles.pillText}>Verified</Text>
              </View>
            </HoverCard>
          </View>

          {isAdmin && (
            <HoverCard style={{ borderColor: colors.borderStrong }}>
              <Text style={styles.label}>ADMIN PANEL</Text>
              <Text style={styles.value}>Admin tools</Text>
              <Text style={styles.desc}>This section is visible only to users with the admin role.</Text>
            </HoverCard>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: { borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bg },
  inner: { width: '100%', maxWidth: 1080, alignSelf: 'center' },
  topInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topEmail: { fontSize: 13, color: colors.muted },
  avatar: { width: 34, height: 34, borderRadius: 17 },
  avatarFallback: { backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  logout: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.tint,
  },
  logoutText: { fontSize: 13, fontWeight: '600', color: colors.text },
  h1: { fontSize: 26, fontWeight: '700', color: colors.text },
  sub: { fontSize: 14, color: colors.muted },
  grid: { gap: 16 },
  item: { flex: 1 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: colors.brand },
  value: { fontSize: 20, fontWeight: '700', color: colors.text },
  desc: { fontSize: 13, lineHeight: 19, color: colors.muted },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.successBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 2,
  },
  pillText: { fontSize: 12, fontWeight: '600', color: colors.success },
});