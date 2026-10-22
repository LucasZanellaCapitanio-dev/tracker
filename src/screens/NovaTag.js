import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Cartao from '../components/Cartao';
import Botao from '../components/Botao';
import { cores, raio } from '../theme';

export default function NovaTag({ aparelho = 'aparelho 1', onCriar }) {
  const [nome, setNome] = useState('');

  return (
    <ScrollView style={s.tela} contentContainerStyle={s.pad} keyboardShouldPersistTaps="handled">
      <Cartao style={s.cartao}>
        <Text style={s.titulo}>{aparelho}</Text>
        <View style={s.divisor} />

        <View style={s.linhaNome}>
          <TextInput
            style={s.campo}
            value={nome}
            onChangeText={setNome}
            placeholder="Nome"
            placeholderTextColor={cores.escuro}
            accessibilityLabel="Nome da tag"
          />
        </View>
        <View style={s.divisor} />

        <View style={s.linhaIcone}>
          <Text style={s.rotulo}>Ícone</Text>
          <TouchableOpacity style={s.icone} accessibilityRole="button" accessibilityLabel="Escolher ícone">
            <MaterialCommunityIcons name="briefcase-outline" size={56} color={cores.branco} />
          </TouchableOpacity>
        </View>
        <View style={s.divisor} />

        <Botao titulo="CRIAR TAG" variante="azul" tamanho="grande" onPress={onCriar} style={s.criar} />
      </Cartao>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.amarelo },
  pad: { padding: 20 },
  cartao: { paddingVertical: 10 },
  titulo: { textAlign: 'center', fontSize: 28, fontWeight: '800', color: cores.texto, paddingVertical: 18 },
  divisor: { height: 2, backgroundColor: cores.texto },
  linhaNome: { paddingVertical: 18, alignItems: 'center' },
  campo: {
    width: '70%',
    minHeight: 68,
    borderRadius: raio.pill,
    backgroundColor: cores.cinza,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '800',
    color: cores.texto,
  },
  linhaIcone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  rotulo: { fontSize: 28, fontWeight: '800', color: cores.texto },
  icone: {
    width: 96,
    height: 96,
    borderRadius: raio.cartao,
    backgroundColor: cores.cinza,
    alignItems: 'center',
    justifyContent: 'center',
  },
  criar: { alignSelf: 'center', width: '70%', minHeight: 96, marginVertical: 26 },
});
