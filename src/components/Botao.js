import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { cores, raio, fonte } from '../theme';

const VARIANTES = {
  escuro: { fundo: cores.escuro, texto: cores.branco },
  claro: { fundo: cores.amarelo, texto: cores.texto },
  azul: { fundo: cores.azul, texto: cores.texto },
  perigo: { fundo: cores.vermelho, texto: cores.branco },
};

// Área de toque grande (mín. 56) para facilitar o uso com leitor de tela.
export default function Botao({ titulo, variante = 'escuro', tamanho = 'normal', onPress, style, children, rotulo }) {
  const v = VARIANTES[variante];
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo || titulo}
      style={[s.botao, { backgroundColor: v.fundo }, style]}
    >
      {children || (
        <Text
          style={[s.texto, { color: v.texto }, tamanho === 'grande' && s.textoGrande, tamanho === 'medio' && s.textoMedio]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {titulo}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  botao: {
    minHeight: 56,
    borderRadius: raio.botao,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { fontWeight: '800', fontSize: fonte.rotulo },
  textoGrande: { fontSize: fonte.botao },
  textoMedio: { fontSize: 22 },
});
