import React from 'react';
import { View, StyleSheet } from 'react-native';
import { cores, raio } from '../theme';

export default function Cartao({ children, style }) {
  return <View style={[s.cartao, style]}>{children}</View>;
}

const s = StyleSheet.create({
  cartao: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.cartao,
    padding: 14,
  },
});
