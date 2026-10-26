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
      <Cartao style={s.grupo}>
        <Linha rotulo="LEITURA POR VOZ" valor={leitura} onChange={setLeitura} />
        <Linha rotulo="RESPOSTA POR ÁUDIO" valor={resposta} onChange={setResposta} />
        <Linha rotulo="VIBRAÇÃO DO RASTREADOR" valor={vibracao} onChange={setVibracao} />
        <Linha rotulo="SOM DO RASTREADOR" valor={som} onChange={setSom} ultima />
      </Cartao>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.amarelo },
  pad: { padding: 20 },
  grupo: { padding: 0, overflow: 'hidden' },
  linha: {
    minHeight: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  divisor: { borderBottomWidth: 2, borderBottomColor: cores.texto },
  rotulo: { flex: 1, fontSize: 28, fontWeight: '800', color: cores.texto },
  interruptor: { transform: [{ scaleX: 1.6 }, { scaleY: 1.6 }] },
});
