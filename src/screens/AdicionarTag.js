import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import Cartao from '../components/Cartao';
import Botao from '../components/Botao';
import { cores } from '../theme';
import { useDispositivosBluetooth } from '../bluetooth';

// Aviso com ação opcional (Bluetooth desligado, sem permissão, etc.).
function Aviso({ texto, botao, onPress }) {
  return (
    <View style={s.aviso}>
      <Text style={s.textoAviso} accessibilityLiveRegion="polite">{texto}</Text>
      {botao ? <Botao titulo={botao} variante="azul" tamanho="medio" onPress={onPress} style={s.botaoAviso} /> : null}
    </View>
  );
}

export default function AdicionarTag({ onEscolher }) {
  const { estado, procurando, dispositivos, demo, procurar, reverificar, ligar } = useDispositivosBluetooth();

  let corpo;
  if (estado === 'verificando') {
    corpo = <Aviso texto="Verificando o Bluetooth…" />;
  } else if (estado === 'desligado') {
    corpo = <Aviso texto="O Bluetooth está desligado. Ligue para procurar dispositivos." botao="LIGAR BLUETOOTH" onPress={ligar} />;
  } else if (estado === 'sem_permissao') {
    corpo = <Aviso texto="Permita o acesso ao Bluetooth para procurar dispositivos." botao="PERMITIR" onPress={reverificar} />;
  } else if (estado === 'indisponivel') {
    corpo = <Aviso texto="Bluetooth indisponível aqui. Rode em um build de desenvolvimento (não no Expo Go nem no Snack)." />;
  } else {
    corpo = (
      <>
        {demo ? (
          <Text style={s.demo} accessibilityLabel="Identificando aparelhos bluetooth.">
            Identificando aparelhos bluetooth.
          </Text>
        ) : null}
        {dispositivos.map((d) => (
          <TouchableOpacity
            key={d.id}
            style={s.linha}
            onPress={() => onEscolher && onEscolher(d)}
            accessibilityRole="button"
            accessibilityLabel={`Escolher ${d.nome}`}
          >
            <Text style={s.texto} numberOfLines={2}>{d.nome}</Text>
          </TouchableOpacity>
        ))}

        {procurando ? (
          <View style={s.status} accessible accessibilityLiveRegion="polite" accessibilityLabel="Procurando dispositivos">
            <ActivityIndicator size="large" color={cores.texto} />
            <Text style={s.textoStatus}>Procurando…</Text>
          </View>
        ) : (
          <View style={s.status}>
            {dispositivos.length === 0 ? (
              <Text style={s.textoStatus} accessibilityLiveRegion="polite">Nenhum dispositivo encontrado.</Text>
            ) : null}
            <Botao titulo="PROCURAR NOVAMENTE" variante="azul" tamanho="medio" onPress={procurar} style={s.botaoAviso} />
          </View>
        )}
      </>
    );
  }

  return (
    <ScrollView style={s.tela} contentContainerStyle={s.pad}>
      <Cartao style={s.cartao}>{corpo}</Cartao>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.amarelo },
  pad: { padding: 20, paddingTop: 28 },
  cartao: { minHeight: 440, paddingVertical: 6 },
  linha: {
    minHeight: 92,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: cores.texto,
  },
  texto: { fontSize: 26, fontWeight: '800', color: cores.texto, textAlign: 'center' },
  demo: { textAlign: 'center', fontSize: 14, fontWeight: '800', color: cores.escuro, paddingVertical: 10 },
  aviso: { flex: 1, minHeight: 420, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 20 },
  textoAviso: { fontSize: 24, fontWeight: '800', color: cores.texto, textAlign: 'center' },
  botaoAviso: { alignSelf: 'stretch', minHeight: 72 },
  status: { alignItems: 'center', justifyContent: 'center', padding: 20, gap: 14 },
  textoStatus: { fontSize: 22, fontWeight: '700', color: cores.escuro, textAlign: 'center' },
});