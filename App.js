import React, { useState } from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Cabecalho, BarraNav } from './src/components/Navegacao';
import Inicio, { TAGS_EXEMPLO } from './src/screens/TelaInicio';
import Configuracoes from './src/screens/Configuracoes';
import Descricao from './src/screens/Descricao';
import Assistente from './src/screens/Assistente';
import AdicionarTag from './src/screens/AdicionarTag';
import NovaTag from './src/screens/NovaTag';
import EditarTag from './src/screens/EditarTag';
import { cores } from './src/theme';

const TITULOS = {
  config: 'CONFIGURAÇÕES',
  inicio: 'TRACKER',
  como: 'COMO USAR',
  assistente: 'ASSISTENTE',
  adicionar: 'ADICIONAR TAG',
  novaTag: 'ADICIONAR TAG',
  editar: 'EDITAR TAG',
};
const NA_BARRA = ['config', 'inicio', 'como'];
// Telas fora da barra ganham uma seta para voltar.
const VOLTAR = { assistente: 'inicio', adicionar: 'inicio', novaTag: 'adicionar', editar: 'inicio' };

export default function App() {
  return (
    <SafeAreaProvider>
      <Principal />
    </SafeAreaProvider>
  );
}

function Principal() {
  const [tela, setTela] = useState('inicio');
  const [aparelho, setAparelho] = useState({ id: null, nome: 'aparelho 1' });
  const [tags, setTags] = useState(TAGS_EXEMPLO);
  const [editando, setEditando] = useState({ nome: '', icone: 'briefcase-outline' });

  const esquerda = VOLTAR[tela]
    ? { icone: 'arrow-left', rotulo: 'Voltar', onPress: () => setTela(VOLTAR[tela]) }
    : undefined;

  // Adicionar tag faz parte do fluxo do Início, então o ícone da casa fica marcado.
  const ativa = NA_BARRA.includes(tela) ? tela : tela === 'adicionar' || tela === 'novaTag' || tela === 'editar' ? 'inicio' : null;

  let conteudo;
  if (tela === 'config') conteudo = <Configuracoes />;
  else if (tela === 'como') conteudo = <Descricao />;
  else if (tela === 'assistente') conteudo = <Assistente onNavegar={setTela} />;
  else if (tela === 'adicionar') conteudo = <AdicionarTag onEscolher={(d) => { setAparelho(d); setTela('novaTag'); }} />;
  else if (tela === 'novaTag') conteudo = (
    <NovaTag
      aparelho={aparelho.nome}
      onConfirmar={(dados) => {
        // A tag guarda o id do aparelho pareado: é com ele que o botão TOCAR mede o sinal.
        setTags((l) => [...l, {
          id: String(Date.now()),
          nome: (dados && dados.nome) || aparelho.nome,
          icone: (dados && dados.icone) || 'briefcase-outline',
          deviceId: aparelho.id,
        }]);
        setTela('inicio');
      }}
    />
  ); 
  else if (tela === 'editar') conteudo = <EditarTag tag={editando} onSalvar={() => setTela('inicio')} />;
  else conteudo = <Inicio tags={tags} onAdicionar={() => setTela('adicionar')} onEditar={(tag) => { setEditando(tag); setTela('editar'); }} onAssistente={() => setTela('assistente')} />;

  return (
    <View style={s.root}>
      <Cabecalho titulo={TITULOS[tela]} fundo={cores.branco} esquerda={esquerda} />
      <View style={{ flex: 1 }}>
        {conteudo}
      </View>
      <BarraNav ativa={ativa} onChange={setTela} fundo={cores.branco} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: cores.branco, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50 },
});