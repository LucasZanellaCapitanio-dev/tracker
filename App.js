import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Cabecalho, BarraNav } from './src/components/Navegacao';
import Inicio from './src/screens/Inicio';
import Configuracoes from './src/screens/Configuracoes';
import Descricao from './src/screens/Descricao';
import Assistente from './src/screens/Assistente';
import AdicionarTag from './src/screens/AdicionarTag';
import NovaTag from './src/screens/NovaTag';
import { cores } from './src/theme';

const TITULOS = {
  config: 'CONFIGURAÇÕES',
  inicio: 'TRACKER',
  como: 'COMO USAR',
  assistente: 'Assistente',
  adicionar: 'ADICIONAR TAG',
  novaTag: 'ADICIONAR TAG',
};
const NA_BARRA = ['config', 'inicio', 'como'];
// Telas fora da barra ganham uma seta para voltar.
const VOLTAR = { assistente: 'inicio', adicionar: 'inicio', novaTag: 'adicionar' };

export default function App() {
  const [tela, setTela] = useState('inicio');
  const [aparelho, setAparelho] = useState('aparelho 1');
  const doAssistente = tela === 'assistente';

  const esquerda = VOLTAR[tela]
    ? { icone: 'arrow-left', rotulo: 'Voltar', onPress: () => setTela(VOLTAR[tela]) }
    : undefined;

  // Adicionar tag faz parte do fluxo do Início, então o ícone da casa fica marcado.
  const ativa = NA_BARRA.includes(tela) ? tela : tela === 'adicionar' || tela === 'novaTag' ? 'inicio' : null;

  let conteudo;
  if (tela === 'config') conteudo = <Configuracoes />;
  else if (tela === 'como') conteudo = <Descricao />;
  else if (tela === 'assistente') conteudo = <Assistente />;
  else if (tela === 'adicionar') conteudo = <AdicionarTag onEscolher={(a) => { setAparelho(a); setTela('novaTag'); }} />;
  else if (tela === 'novaTag') conteudo = <NovaTag aparelho={aparelho} onCriar={() => setTela('inicio')} />;
  else conteudo = <Inicio onAdicionar={() => setTela('adicionar')} />;

  return (
    <View style={s.root}>
      <Cabecalho titulo={TITULOS[tela]} fundo={doAssistente ? cores.amarelo : cores.branco} esquerda={esquerda} />
      <View style={{ flex: 1 }}>
        {conteudo}
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
      <BarraNav ativa={ativa} onChange={setTela} fundo={cores.branco} />
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
