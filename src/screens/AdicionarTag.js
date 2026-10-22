import React from 'react';
import { Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Cartao from '../components/Cartao';
import { cores } from '../theme';

// Lista de aparelhos encontrados (exemplo).
const APARELHOS = ['aparelho 1', 'aparelho 2', 'aparelho 3', 'aparelho 4'];

export default function AdicionarTag({ onEscolher }) {
  return (
    <ScrollView style={s.tela} contentContainerStyle={s.pad}>
      <Cartao style={s.cartao}>
        {APARELHOS.map((a) => (
          <TouchableOpacity
            key={a}
            style={s.linha}
            onPress={() => onEscolher && onEscolher(a)}
            accessibilityRole="button"
            accessibilityLabel={`Escolher ${a}`}
          >
            <Text style={s.texto}>{a}</Text>
          </TouchableOpacity>
        ))}
      </Cartao>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.amarelo },
  pad: { padding: 20, paddingTop: 28 },
  cartao: { minHeight: 440, paddingVertical: 6 },
  linha: {
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: cores.texto,
  },
  texto: { fontSize: 26, fontWeight: '800', color: cores.texto },
});
