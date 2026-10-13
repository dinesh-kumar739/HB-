import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { ALLOWED_DOMAIN, DOMAIN_ERROR, isAllowedEmail } from '../services/domain';
import { useGoogleNative } from '../services/useGoogleNative';

export type Role = 'admin' | 'user';
export type AppUser = {
  uid: string;
  email: string;
  name: string;
  photoURL: string | null;
  role: Role;
};

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  signingIn: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

async function syncUserDoc(u: User): Promise<Role> {
  try {
    const ref = doc(db, 'users', u.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: u.uid,
        email: u.email,
        name: u.displayName ?? '',
        photoURL: u.photoURL ?? null,
        role: 'user',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
      return 'user';
    }
    await updateDoc(ref, { lastLoginAt: serverTimestamp() });
    return snap.data().role === 'admin' ? 'admin' : 'user';
  } catch (e) {
    console.warn('Could not sync user document', e);
    return 'user';
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const native = useGoogleNative(
    async (idToken) => {
      try {
        await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
      } catch {
        setError('Google sign-in failed. Please try again.');
        setSigningIn(false);
      }
    },
    (message) => {
      setError(message);
      setSigningIn(false);
    }
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        setSigningIn(false);
        return;
      }

      if (!isAllowedEmail(fbUser.email) || fbUser.emailVerified === false) {
        await signOut(auth).catch(() => {});
        setUser(null);
        setError(DOMAIN_ERROR);
        setLoading(false);
        setSigningIn(false);
        return;
      }

      const role = await syncUserDoc(fbUser);
      setUser({
        uid: fbUser.uid,
        email: fbUser.email as string,
        name: fbUser.displayName ?? fbUser.email!.split('@')[0],
        photoURL: fbUser.photoURL,
        role,
      });
      setError(null);
      setLoading(false);
      setSigningIn(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    setSigningIn(true);
    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ hd: ALLOWED_DOMAIN, prompt: 'select_account' });
        await signInWithPopup(auth, provider);
      } else {
        await native.prompt();
      }
    } catch (e: any) {
      const code = e?.code as string | undefined;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setError('Sign-in was cancelled.');
      } else if (code === 'auth/popup-blocked') {
        setError('Popup was blocked by the browser. Please allow popups and try again.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Check your connection and try again.');
      } else {
        setError('Something went wrong while signing in. Please try again.');
      }
      setSigningIn(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signingIn,
        error,
        signInWithGoogle,
        logout,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}