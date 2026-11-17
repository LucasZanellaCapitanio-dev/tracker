import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import Cartao from '../components/Cartao';
import Botao from '../components/Botao';
import { cores } from '../theme';
import { useDispositivosBluetooth, descreverProximidade } from '../bluetooth';

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
  const { estado, procurando, dispositivos, demo, modo, mudarModo, erroBusca, procurar, reverificar, ligar } = useDispositivosBluetooth();
  const [mostrarSemNome, setMostrarSemNome] = useState(false);

  // Na busca por aparelhos próximos aparece muita coisa anônima (celulares, relógios...).
  // Por padrão só entram os que têm nome; um botão libera os sem nome, que podem ser tags.
  const todos = dispositivos.map((d) => ({
    ...d,
    nomeExibido: d.nome || `Aparelho sem nome, final ${String(d.id).slice(-5)}`,
  }));
  const visiveis = mostrarSemNome ? todos : todos.filter((d) => d.nome);
  const ocultos = todos.length - visiveis.length;

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
        {Platform.OS === 'android' ? (
          <View style={s.modos}>
            <Botao
              titulo="PAREADOS"
              variante={modo === 'pareados' ? 'escuro' : 'claro'}
              tamanho="medio"
              rotulo={`Aparelhos pareados${modo === 'pareados' ? ', selecionado' : ''}`}
              onPress={() => mudarModo('pareados')}
              style={s.botaoModo}
            />
            <Botao
              titulo="PRÓXIMOS"
              variante={modo === 'proximos' ? 'escuro' : 'claro'}
              tamanho="medio"
              rotulo={`Aparelhos próximos, inclui tags não pareadas${modo === 'proximos' ? ', selecionado' : ''}`}
              onPress={() => mudarModo('proximos')}
              style={s.botaoModo}
            />
          </View>
        ) : null}
        {demo ? (
          <Text style={s.demo} accessibilityLabel="Identificando aparelhos bluetooth.">
            Identificando aparelhos bluetooth.
          </Text>
        ) : null}
        {visiveis.map((d) => {
          const prox = descreverProximidade(d.rssi);
          return (
            <TouchableOpacity
              key={d.id}
              style={s.linha}
              onPress={() => onEscolher && onEscolher({ id: d.id, nome: d.nomeExibido })}
              accessibilityRole="button"
              accessibilityLabel={`Escolher ${d.nomeExibido}${prox ? `, ${prox}` : ''}`}
            >
              <Text style={s.texto} numberOfLines={2}>{d.nomeExibido}</Text>
              {prox ? <Text style={s.proximidade}>{prox}</Text> : null}
            </TouchableOpacity>
          );
        })}

        {procurando ? (
          <View style={s.status} accessible accessibilityLiveRegion="polite" accessibilityLabel="Procurando dispositivos">
            <ActivityIndicator size="large" color={cores.texto} />
            <Text style={s.textoStatus}>Procurando…</Text>
          </View>
        ) : (
          <View style={s.status}>
            {erroBusca ? (
              <Text style={s.textoStatus} accessibilityLiveRegion="polite">Não foi possível procurar. Confira se a localização do celular está ligada.</Text>
            ) : null}
            {!erroBusca && visiveis.length === 0 ? (
              <Text style={s.textoStatus} accessibilityLiveRegion="polite">
                {modo === 'pareados'
                  ? 'Nenhum aparelho pareado encontrado. Toque em PRÓXIMOS para procurar tags que não estão pareadas.'
                  : 'Nenhum aparelho encontrado por perto. Aproxime a tag do celular, confira se ela está ligada e procure novamente.'}
              </Text>
            ) : null}
            {modo === 'proximos' && ocultos > 0 ? (
              <Botao
                titulo={`MOSTRAR ${ocultos} SEM NOME`}
                rotulo={`Mostrar ${ocultos} aparelhos sem nome`}
                variante="claro"
                tamanho="medio"
                onPress={() => setMostrarSemNome(true)}
                style={s.botaoAviso}
              />
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
  proximidade: { fontSize: 20, fontWeight: '700', color: cores.escuro, textAlign: 'center', marginTop: 2 },
  modos: { flexDirection: 'row', gap: 12, padding: 12, borderBottomWidth: 2, borderBottomColor: cores.texto },
  botaoModo: { flex: 1, minHeight: 64 },
  demo: { textAlign: 'center', fontSize: 26, fontWeight: '800', color: cores.escuro, paddingVertical: 10 },
  aviso: { flex: 1, minHeight: 420, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 20 },
  textoAviso: { fontSize: 24, fontWeight: '800', color: cores.texto, textAlign: 'center' },
  botaoAviso: { alignSelf: 'stretch', minHeight: 72 },
  status: { alignItems: 'center', justifyContent: 'center', padding: 20, gap: 14 },
  textoStatus: { fontSize: 22, fontWeight: '700', color: cores.escuro, textAlign: 'center' },
});