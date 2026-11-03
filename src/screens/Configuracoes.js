import React from 'react';
import { View, Text, ScrollView, Switch, Vibration, StyleSheet } from 'react-native';
import Cartao from '../components/Cartao';
import { cores } from '../theme';
import { usePreferencias } from '../preferencias';
import { falar, pararVoz } from '../voz';
import { criarBip, prepararAudio } from '../sinais';

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

// Cada opção: chave guardada em preferencias.js + texto exibido.
const OPCOES = [
  { chave: 'leituraVoz', rotulo: 'LEITURA POR VOZ' },
  { chave: 'respostaAudio', rotulo: 'RESPOSTA POR ÁUDIO' },
  { chave: 'vibracao', rotulo: 'VIBRAÇÃO DO RASTREADOR' },
  { chave: 'som', rotulo: 'SOM DO RASTREADOR' },
];

export default function Configuracoes() {
  const { config, definir } = usePreferencias();

  // Salva a opção e dá um retorno na hora, para a pessoa perceber que funcionou.
  function alterar(chave, valor) {
    definir(chave, valor);
    if (chave === 'leituraVoz') {
      if (valor) falar('Leitura por voz ligada.'); else pararVoz();
    } else if (chave === 'respostaAudio') {
      if (valor) falar('Resposta por áudio ligada.'); else pararVoz();
    } else if (chave === 'vibracao') {
      if (valor) Vibration.vibrate(300); else Vibration.cancel();
    } else if (chave === 'som' && valor) {
      const bip = criarBip();
      prepararAudio().then(() => {
        bip.tocar();
        setTimeout(() => bip.remover(), 1000);
      });
    }
  }

  return (
    <ScrollView style={s.tela} contentContainerStyle={s.pad}>
      <Cartao style={s.grupo}>
        {OPCOES.map((o, i) => (
          <Linha
            key={o.chave}
            rotulo={o.rotulo}
            valor={config[o.chave]}
            onChange={(v) => alterar(o.chave, v)}
            ultima={i === OPCOES.length - 1}
          />
        ))}
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
