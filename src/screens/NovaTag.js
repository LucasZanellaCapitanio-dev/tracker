import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Cartao from '../components/Cartao';
import Botao from '../components/Botao';
import { cores, raio } from '../theme';

const ICONES = [
  { id: 'briefcase-outline', rotulo: 'Mala' },
  { id: 'cellphone', rotulo: 'Celular' },
  { id: 'television', rotulo: 'TV' },
  { id: 'laptop', rotulo: 'Notebook' },
  { id: 'bed-outline', rotulo: 'Cama' },
];

export default function NovaTag({ aparelho = 'aparelho 1', nomeInicial = '', icone: iconeInicial = 'briefcase-outline', textoBotao = 'CRIAR TAG', onConfirmar }) {
  const [nome, setNome] = useState(nomeInicial);
  const [icone, setIcone] = useState(iconeInicial);
  const [escolhendo, setEscolhendo] = useState(false);

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
          <TouchableOpacity style={s.icone} onPress={() => setEscolhendo(!escolhendo)} accessibilityRole="button" accessibilityLabel="Escolher ícone">
            <MaterialCommunityIcons name={icone} size={56} color={cores.texto} />
          </TouchableOpacity>
        </View>
        {escolhendo ? (
          <View style={s.opcoes}>
            {ICONES.map((o) => (
              <TouchableOpacity
                key={o.id}
                style={[s.opcao, icone === o.id && s.opcaoAtiva]}
                onPress={() => { setIcone(o.id); setEscolhendo(false); }}
                accessibilityRole="button"
                accessibilityLabel={o.rotulo}
                accessibilityState={{ selected: icone === o.id }}
              >
                <MaterialCommunityIcons name={o.id} size={44} color={icone === o.id ? cores.branco : cores.texto} />
                <Text style={[s.opcaoTexto, icone === o.id && { color: cores.branco }]}>{o.rotulo}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
        <View style={s.divisor} />

        <Botao titulo={textoBotao} variante="azul" tamanho="grande" onPress={onConfirmar} style={s.criar} />
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
    backgroundColor: cores.amarelo,
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
    backgroundColor: cores.amarelo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, paddingBottom: 18, paddingHorizontal: 8 },
  opcao: {
    width: '30%',
    minHeight: 104,
    borderRadius: raio.cartao,
    backgroundColor: cores.amarelo,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  opcaoAtiva: { backgroundColor: cores.escuro },
  opcaoTexto: { fontSize: 18, fontWeight: '800', color: cores.texto },
  criar: { alignSelf: 'center', width: '70%', minHeight: 96, marginVertical: 26 },
});
