import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Cabecalho, BarraNav } from './src/components/Navegacao';
import Inicio from './src/screens/Inicio';
import Configuracoes from './src/screens/Configuracoes';
import Descricao from './src/screens/Descricao';
import Assistente from './src/screens/Assistente';
import { cores } from './src/theme';

const TELAS = {
  config: { titulo: 'CONFIGURAÇÕES', Tela: Configuracoes },
  inicio: { titulo: 'TRACKER', Tela: Inicio },
  como: { titulo: 'COMO USAR', Tela: Descricao },
  assistente: { titulo: 'Assistente', Tela: Assistente },
};
const NA_BARRA = ['config', 'inicio', 'como'];

export default function App() {
  const [tela, setTela] = useState('inicio');
  const { titulo, Tela } = TELAS[tela];
  const doAssistente = tela === 'assistente';

  // O assistente não está na barra, então ganha uma seta para voltar.
  const esquerda = doAssistente
    ? { icone: 'arrow-left', rotulo: 'Voltar', onPress: () => setTela('inicio') }
    : undefined;

  return (
    <View style={s.root}>
      <Cabecalho titulo={titulo} fundo={doAssistente ? cores.amarelo : cores.branco} esquerda={esquerda} />
      <View style={{ flex: 1 }}>
        <Tela />
        {tela === 'inicio' && (
          <TouchableOpacity
            style={s.robo}
            onPress={() => setTela('assistente')}
            accessibilityRole="button"
            accessibilityLabel="Abrir o assistente por voz"
          >
            <MaterialCommunityIcons name="robot-happy-outline" size={92} color={cores.branco} />
          </TouchableOpacity>
        )}
      </View>
      <BarraNav ativa={NA_BARRA.includes(tela) ? tela : null} onChange={setTela} fundo={cores.branco} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: cores.branco, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50 },
  // Centralizado na tela, logo acima da barra de baixo.
  robo: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    marginLeft: -68,
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: cores.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
});
