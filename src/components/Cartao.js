import React from 'react';
import { View, StyleSheet } from 'react-native';
import { cores, raio } from '../theme';

export default function Cartao({ children, style }) {
  return <View style={[s.cartao, style]}>{children}</View>;
}

const s = StyleSheet.create({
  cartao: {
    backgroundColor: cores.branco,
    borderRadius: raio.cartao,
    padding: 14,
  },
});
