import { useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleNative(
  onIdToken: (token: string) => void,
  onError: (message: string) => void
) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    selectAccount: true,
  });

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const token = response.params?.id_token;
      token ? onIdToken(token) : onError('Google did not return a token.');
    } else if (response.type === 'cancel' || response.type === 'dismiss') {
      onError('Sign-in was cancelled.');
    } else if (response.type === 'error') {
      onError('Google sign-in failed. Please try again.');
    }
  }, [response]);

  return { ready: !!request, prompt: async () => { await promptAsync(); } };
}