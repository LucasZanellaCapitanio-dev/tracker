import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Botao from '../components/Botao';
import { cores, raio, fonte } from '../theme';

export default function Localizacao() {
  return (
    <View style={s.tela}>
      <View style={s.mapa}>
        <MaterialCommunityIcons name="map-marker" size={64} color={cores.texto} />
        <Text style={s.titulo}>MAPA</Text>
        <Text style={s.suave}>Posição do rastreador</Text>
      </View>
      <Botao titulo="HISTÓRICO DE PERDIDAS" />
    </View>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.amarelo, padding: 20, gap: 20 },
  mapa: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.branco,
    borderRadius: raio.cartao,
  },
  titulo: { marginTop: 6, fontSize: fonte.titulo, fontWeight: '800', color: cores.texto },
  suave: { fontSize: fonte.rotulo, fontWeight: '600', color: cores.escuro },
});
