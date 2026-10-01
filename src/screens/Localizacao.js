import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Botao from '../components/Botao';
import { cores, raio } from '../theme';

export default function Localizacao() {
  return (
    <View style={{ flex: 1 }}>
      <View style={s.mapa}>
        <Ionicons name="location" size={40} color={cores.destaque} />
        <Text style={s.titulo}>(Mapa)</Text>
        <Text style={s.suave}>Posição do rastreador</Text>
      </View>
      <Botao titulo="História de Perdidas" style={s.historico} />
    </View>
  );
}

const s = StyleSheet.create({
  mapa: {
    flex: 1,
    margin: 16,
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.destaqueSuave,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.cartao,
  },
  titulo: { marginTop: 6, fontSize: 16, fontWeight: '700', color: cores.texto },
  suave: { fontSize: 13, color: cores.textoSuave },
  historico: { marginHorizontal: 16, marginBottom: 16, paddingVertical: 14 },
});
