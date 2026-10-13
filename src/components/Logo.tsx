import React from 'react';
import { Image } from 'react-native';

export const LOGO_URI =
  'https://framerusercontent.com/images/IpzfW24ww6f9zuzr6LGwyNSoY.png?scale-down-to=512&width=2400&height=2400';

export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <Image
      source={{ uri: LOGO_URI }}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityLabel="HB+ logo"
    />
  );
}