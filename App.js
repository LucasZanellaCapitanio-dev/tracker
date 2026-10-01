import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Platform, StatusBar } from 'react-native';

const TABS = ['Equipamento', 'Localização', 'Configurações', 'Descrição'];

function Equipamento() {
  return (
    <ScrollView contentContainerStyle={s.pad}>
      <View style={s.box}>
        <View style={s.row}>
          <View style={s.square}><Text>ícone</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.bold}>Nome do equipamento</Text>
            <Text>Distância · Bateria</Text>
          </View>
          <Text>Conectado</Text>
        </View>
        <View style={[s.row, { marginTop: 10 }]}>
          <Text style={s.btn}>Tocar</Text>
          <Text style={s.btn}>Desconectar</Text>
          <Text style={s.btn}>Remover</Text>
        </View>
      </View>
      <Text style={s.note}>Sem equipamentos: mostrar "Nenhum equipamento" e botão "Procurar rastreador".</Text>
    </ScrollView>
  );
}

function Localizacao() {
  return (
    <View style={{ flex: 1 }}>
      <View style={[s.gray, { flex: 1, margin: 16, alignItems: 'center', justifyContent: 'center' }]}>
        <Text>(Mapa)</Text>
        <Text style={{ marginTop: 8 }}>Posição do rastreador</Text>
  </View>
      <Text style={[s.btn, { margin: 16, marginTop: 0, textAlign: 'center', padding: 14 }]}>História de Perdidas</Text>
    </View>
  );
}

function Configuracoes() {
  const [wifi, setWifi] = useState(false);
  const [silencio, setSilencio] = useState(true);
  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Text style={s.bold}>Modo não incomodar</Text>
      <View style={[s.box, s.row, s.between]}>
        <Text>Modo Não Incomodar Wi-Fi</Text>
        <Switch value={wifi} onValueChange={setWifi} />
      </View>
      <View style={[s.box, s.row, s.between]}>
        <Text>Período de silêncio (23:00–07:00)</Text>
        <Switch value={silencio} onValueChange={setSilencio} />
      </View>
      <Text style={[s.bold, { marginTop: 16 }]}>Sobre o software</Text>
      <View style={[s.box, s.row, s.between]}>
        <Text>Versão</Text>
        <Text>v2.0.7</Text>
      </View>
    </ScrollView>
  );
}

function Descricao() {
  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Text style={s.title}>Como usar</Text>
      <View style={s.box}><Text>1. Toque em @ e ligue o rastreador para conectar via Bluetooth.</Text></View>
      <View style={s.box}><Text>2. Use "Tocar" para o rastreador emitir um alarme.</Text></View>
      <View style={s.box}><Text>3. Veja a última posição e o histórico na aba Localização.</Text></View>
      <View style={s.box}><Text>4. No período de silêncio, o alarme não toca.</Text></View>
    </ScrollView>
  );
}

const SCREENS = [Equipamento, Localizacao, Configuracoes, Descricao];

export default function App() {
  const [tab, setTab] = useState(0);
  const Screen = SCREENS[tab];
  return (
    <View style={s.root}>
      <View style={s.header}>
        <Text style={s.title}>{TABS[tab]}</Text>
        {tab === 0 && <Text style={s.add}>@</Text>}
      </View>
      <View style={{ flex: 1 }}><Screen /></View>
      <View style={s.tabs}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={t} style={[s.tab, tab === i && s.tabOn]} onPress={() => setTab(i)}>
            <Text style={tab === i ? s.bold : null}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const line = { borderWidth: 1, borderColor: '#000' };
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50 },
  header: { height: 50, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1 },
  add: { position: 'absolute', right: 16, fontSize: 28 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  pad: { padding: 16, gap: 10 },
  box: { ...line, padding: 12, borderRadius: 4, marginTop: 6 },
  gray: { ...line, backgroundColor: '#ddd' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  between: { justifyContent: 'space-between' },
  square: { ...line, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ddd' },
  btn: { ...line, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 4 },
  bold: { fontWeight: 'bold' },
  note: { color: '#666', fontStyle: 'italic', marginTop: 10 },
  tabs: { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 16 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabOn: { backgroundColor: '#eee' },
});
