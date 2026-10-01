import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Cartao from '../components/Cartao';
import { cores } from '../theme';

const PASSOS = [
  'Toque em @ e ligue o rastreador para conectar via Bluetooth.',
  'Use "Tocar" para o rastreador emitir um alarme.',
  'Veja a última posição e o histórico na aba Localização.',
  'No período de silêncio, o alarme não toca.',
];

export default function Descricao() {
  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Text style={s.titulo}>Como usar</Text>
      {PASSOS.map((texto, i) => (
        <Cartao key={i} style={s.passo}>
          <View style={s.numero}>
            <Text style={s.numeroTexto}>{i + 1}</Text>
          </View>
          <Text style={s.texto}>{texto}</Text>
        </Cartao>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pad: { padding: 16, gap: 10 },
  titulo: { fontSize: 18, fontWeight: '700', color: cores.texto, marginBottom: 2 },
  passo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  numero: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: cores.destaqueSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroTexto: { fontSize: 13, fontWeight: '700', color: cores.destaque },
  texto: { flex: 1, fontSize: 15, lineHeight: 21, color: cores.texto },
});
