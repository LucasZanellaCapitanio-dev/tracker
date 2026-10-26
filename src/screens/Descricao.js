import React from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Cartao from '../components/Cartao';
import { cores, raio, fonte } from '../theme';

const PASSOS = [
  { icone: 'bluetooth', texto: 'CONECTE O RASTREADOR' },
  { icone: 'waveform', texto: 'TOQUE PARA LOCALIZAR' },
  { icone: 'alert-circle-outline', texto: 'AJUSTE VOZ E ALERTAS' },
  { icone: 'account-question-outline', texto: 'PERGUNTE AO TRACKER' },
];

export default function Descricao() {
  return (
    <ScrollView style={s.tela} contentContainerStyle={s.pad}>
      {PASSOS.map((p, i) => (
        <Cartao key={p.texto} style={s.passo}>
          <MaterialCommunityIcons name={p.icone} size={64} color={cores.texto} />
          <Text style={s.texto} accessibilityLabel={`Passo ${i + 1}: ${p.texto.toLowerCase()}`}>
            {p.texto}
          </Text>
        </Cartao>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.amarelo },
  pad: { padding: 20, gap: 16 },
  passo: {
    minHeight: 140,
    borderRadius: raio.cartao,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  texto: { flex: 1, textAlign: 'center', fontSize: 30, fontWeight: '800', color: cores.texto },
});
