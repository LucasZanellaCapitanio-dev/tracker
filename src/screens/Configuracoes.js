import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import Cartao from '../components/Cartao';
import { cores } from '../theme';

function Linha({ rotulo, ultima, children }) {
  return (
    <View style={[s.linha, !ultima && s.divisor]}>
      <Text style={s.rotulo}>{rotulo}</Text>
      {children}
    </View>
  );
}

function Interruptor({ value, onValueChange }) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#D1D5DB', true: cores.destaque }}
      thumbColor="#fff"
    />
  );
}

export default function Configuracoes() {
  const [wifi, setWifi] = useState(false);
  const [silencio, setSilencio] = useState(true);

  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Text style={s.secao}>Modo não incomodar</Text>
      <Cartao style={s.grupo}>
        <Linha rotulo="Modo Não Incomodar Wi-Fi">
          <Interruptor value={wifi} onValueChange={setWifi} />
        </Linha>
        <Linha rotulo="Período de silêncio (23:00–07:00)" ultima>
          <Interruptor value={silencio} onValueChange={setSilencio} />
        </Linha>
      </Cartao>

      <Text style={[s.secao, { marginTop: 24 }]}>Sobre o software</Text>
      <Cartao style={s.grupo}>
        <Linha rotulo="Versão" ultima>
          <Text style={s.valor}>v2.0.7</Text>
        </Linha>
      </Cartao>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pad: { padding: 16 },
  secao: { fontSize: 14, fontWeight: '700', color: cores.textoSuave, marginBottom: 8, marginLeft: 4 },
  grupo: { padding: 0, overflow: 'hidden' },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  divisor: { borderBottomWidth: 1, borderBottomColor: cores.borda },
  rotulo: { flex: 1, fontSize: 15, color: cores.texto },
  valor: { fontSize: 15, color: cores.textoSuave },
});
