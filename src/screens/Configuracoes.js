import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import Cartao from '../components/Cartao';
import { cores, fonte } from '../theme';

function Linha({ rotulo, ultima, valor, onChange }) {
  return (
    <View style={[s.linha, !ultima && s.divisor]}>
      <Text style={s.rotulo}>{rotulo}</Text>
      <Switch
        value={valor}
        onValueChange={onChange}
        accessibilityLabel={rotulo}
        trackColor={{ false: cores.cinza, true: cores.escuro }}
        ios_backgroundColor={cores.cinza}
        thumbColor={cores.amarelo}
        style={s.interruptor}
      />
    </View>
  );
}

export default function Configuracoes() {
  const [leitura, setLeitura] = useState(true);
  const [resposta, setResposta] = useState(false);
  const [vibracao, setVibracao] = useState(false);
  const [som, setSom] = useState(true);

  return (
    <ScrollView style={s.tela} contentContainerStyle={s.pad}>
      <Text style={s.secao} accessibilityRole="header">CONFIGURAÇÕES</Text>
      <Cartao style={s.grupo}>
        <Linha rotulo="LEITURA POR VOZ" valor={leitura} onChange={setLeitura} />
        <Linha rotulo="RESPOSTA POR ÁUDIO" valor={resposta} onChange={setResposta} />
        <Linha rotulo="VIBRAÇÃO DO RASTREADOR" valor={vibracao} onChange={setVibracao} />
        <Linha rotulo="SOM DO RASTREADOR" valor={som} onChange={setSom} ultima />
      </Cartao>
      <Text style={s.versao}>Versão v2.0.7</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.amarelo },
  pad: { padding: 20 },
  secao: { fontSize: fonte.secao, fontWeight: '800', color: cores.texto, marginBottom: 10 },
  grupo: { padding: 0, overflow: 'hidden' },
  linha: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
  },
  divisor: { borderBottomWidth: 2, borderBottomColor: cores.texto },
  rotulo: { flex: 1, fontSize: fonte.rotulo, fontWeight: '800', color: cores.texto },
  interruptor: { transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] },
  versao: { marginTop: 16, textAlign: 'center', fontSize: 14, fontWeight: '700', color: cores.escuro },
});
