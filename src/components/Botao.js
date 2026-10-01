import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { cores, raio } from '../theme';

const VARIANTES = {
  primario: { fundo: cores.destaque, texto: '#fff', borda: cores.destaque },
  neutro: { fundo: cores.superficie, texto: cores.texto, borda: cores.borda },
  perigo: { fundo: cores.perigoSuave, texto: cores.perigo, borda: cores.perigoSuave },
};

export default function Botao({ titulo, variante = 'neutro', onPress, style }) {
  const v = VARIANTES[variante];
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[s.botao, { backgroundColor: v.fundo, borderColor: v.borda }, style]}
    >
      <Text style={[s.texto, { color: v.texto }]} numberOfLines={1}>{titulo}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  botao: {
    borderWidth: 1,
    borderRadius: raio.botao,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { fontWeight: '600', fontSize: 13 },
});
