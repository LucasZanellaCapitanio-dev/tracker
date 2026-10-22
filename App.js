import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Cabecalho, BarraNav } from './src/components/Navegacao';
import Inicio from './src/screens/Inicio';
import Localizacao from './src/screens/Localizacao';
import Equipamento from './src/screens/Equipamento';
import Configuracoes from './src/screens/Configuracoes';
import Descricao from './src/screens/Descricao';
import Assistente from './src/screens/Assistente';
import { cores } from './src/theme';

const TELAS = {
  inicio: { titulo: 'TRACKER', Tela: Inicio },
  localizacao: { titulo: 'LOCALIZAÇÃO', Tela: Localizacao },
  radar: { titulo: 'EQUIPAMENTOS', Tela: Equipamento },
  config: { titulo: 'CONFIGURAÇÕES', Tela: Configuracoes },
  como: { titulo: 'COMO USAR', Tela: Descricao },
  assistente: { titulo: 'Assistente', Tela: Assistente },
};
const NA_BARRA = ['localizacao', 'inicio', 'radar'];

export default function App() {
  const [tela, setTela] = useState('inicio');
  const { titulo, Tela } = TELAS[tela];
  const doAssistente = tela === 'assistente';

  // Atalhos no cabeçalho para chegar em "Como usar" e "Configurações"
  // (o protótipo não mostrava como abrir essas telas).
  let esquerda, direita;
  if (tela === 'inicio') {
    esquerda = { icone: 'help-circle-outline', rotulo: 'Como usar', onPress: () => setTela('como') };
    direita = { icone: 'cog-outline', rotulo: 'Configurações', onPress: () => setTela('config') };
  } else if (!NA_BARRA.includes(tela)) {
    esquerda = { icone: 'arrow-left', rotulo: 'Voltar', onPress: () => setTela('inicio') };
  }

  return (
    <View style={s.root}>
      <Cabecalho titulo={titulo} fundo={doAssistente ? cores.amarelo : cores.branco} esquerda={esquerda} direita={direita} />
      <View style={{ flex: 1 }}>
        <Tela onTocar={() => setTela('radar')} onAdicionar={() => setTela('radar')} />
        {tela === 'inicio' && (
          <TouchableOpacity
            style={s.robo}
            onPress={() => setTela('assistente')}
            accessibilityRole="button"
            accessibilityLabel="Abrir o assistente por voz"
          >
            <MaterialCommunityIcons name="robot-happy-outline" size={64} color={cores.branco} />
          </TouchableOpacity>
        )}
      </View>
      <BarraNav
        ativa={NA_BARRA.includes(tela) ? tela : null}
        onChange={setTela}
        fundo={doAssistente ? cores.cinzaAzulado : cores.branco}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: cores.branco, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50 },
  // Fica no canto, acima da barra, para não cobrir o botão "Adicionar tag" como no protótipo.
  robo: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: cores.vermelho,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
