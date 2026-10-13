export function useGoogleNative(
  _onIdToken: (token: string) => void,
  _onError: (message: string) => void
) {
  return { ready: false, prompt: async () => {} };
}