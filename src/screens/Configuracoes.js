import React from 'react';
import { View, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import Cartao from '../components/Cartao';
import { cores, fonte } from '../theme';
import { usePreferencias, definirPreferencia } from '../preferencias';

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
  const p = usePreferencias();

  return (
    <ScrollView style={s.tela} contentContainerStyle={s.pad}>
      <Cartao style={s.grupo}>
        <Linha rotulo="LEITURA POR VOZ" valor={p.leitura} onChange={(v) => definirPreferencia('leitura', v)} />
        <Linha rotulo="RESPOSTA POR ÁUDIO" valor={p.resposta} onChange={(v) => definirPreferencia('resposta', v)} />
        <Linha rotulo="VIBRAÇÃO DO RASTREADOR" valor={p.vibracao} onChange={(v) => definirPreferencia('vibracao', v)} />
        <Linha rotulo="SOM DO RASTREADOR" valor={p.som} onChange={(v) => definirPreferencia('som', v)} ultima />
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
