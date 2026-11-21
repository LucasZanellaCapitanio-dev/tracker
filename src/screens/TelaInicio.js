// TELA INICIAL (versão 5). É este arquivo que o App.js usa: src/screens/TelaInicio.js
import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Cartao from '../components/Cartao';
import Botao from '../components/Botao';
import ConfirmarRemocao from './ConfirmarRemocao';
import DetalhesTag from './DetalhesTag';
import { cores, raio, fonte } from '../theme';
import { useToque, textoDistancia, rotuloDistancia, textoStatus, statusRuim } from '../bluetooth';

// ===== AJUSTE DO BOTÃO TOCAR (mexa só aqui; salve e recarregue o app) =====
const TOCAR_ALTURA = 130;         // altura do botão TOCAR, em pixels. Maior número = botão mais alto
const TOCAR_ESPACO_LATERAL = 8;   // espaço branco nas laterais. Menor número = botão mais largo
const DETALHES_TAMANHO = 72;      // botão cinza do olho (largura e altura)
const DETALHES_ESPACO = 12;       // espaço entre o TOCAR e o olho
// ===========================================================================

// Sem equipamentos: mostrar "Nenhum equipamento" e botão "Procurar rastreador".
function Tag({ item, largura, altura, tocando, status, onTocar, onDetalhes }) {
  const nome = item.nome.toLowerCase();
  return (
    <View style={[s.tag, { width: largura, height: altura }]}>
      <View style={s.linha}>
        <View style={s.icone}>
          <MaterialCommunityIcons name={item.icone} size={60} color={cores.branco} />
        </View>
        <View style={s.info}>
          {/* uma linha só: se não couber, termina em "..." e o TOCAR não se deforma */}
          <Text style={s.nome} numberOfLines={1} ellipsizeMode="tail">{item.nome}</Text>
          <Text style={s.distancia} numberOfLines={2} ellipsizeMode="tail" accessibilityLiveRegion="polite" accessibilityLabel={rotuloDistancia(status)}>
            {textoDistancia(status)}
          </Text>
          <View style={[s.status, statusRuim(status) && s.statusRuim]}>
            <View style={s.ponto} />
            <Text style={s.statusTexto} numberOfLines={1} accessibilityLiveRegion="polite">{textoStatus(status)}</Text>
          </View>
        </View>
      </View>
      <View style={s.zonaTocar}>
        <View style={s.linhaTocar}>
          <Botao
            titulo={tocando ? 'PARAR' : 'TOCAR'}
            tamanho="grande"
            onPress={onTocar}
            style={s.tocar}
            rotulo={tocando ? `Parar de tocar a tag ${nome}` : `Tocar a tag ${nome}`}
          />
          <TouchableOpacity style={s.detalhes} onPress={onDetalhes} accessibilityRole="button" accessibilityLabel={`Ver todos os detalhes da tag ${nome}`}>
            <MaterialCommunityIcons name="eye" size={48} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function Inicio({ tags = [], onTocar, onRemover, onEditar, onAdicionar, onAssistente }) {
  // Tamanho real da área da lista: cada página tem exatamente esse tamanho.
  const [medida, setMedida] = useState({ w: 0, h: 0 });
  const [indice, setIndice] = useState(0);
  const [confirmando, setConfirmando] = useState(false);
  const [detalhes, setDetalhes] = useState(false);
  const { tocandoId, status, alternar, parar } = useToque();
  const lista = useRef(null);
  const atual = tags[indice] || tags[0]; // fica undefined quando não há nenhuma tag
  // Dados ao vivo só existem para a tag que está tocando agora.
  const statusAtual = atual && tocandoId === atual.id ? status : null;
  // Nos detalhes, a distância mostra o valor do sinal (RSSI) que o app acabou de medir.
  const detalheDistancia = !statusAtual
    ? 'Toque em TOCAR para medir'
    : statusAtual.rssi != null ? `${statusAtual.rssi} dBm` : 'Sem leitura de sinal';

  // Remove a tag atual: para o toque se ela estiver tocando, avisa o App e ajusta a página.
  const remover = () => {
    if (!atual) return;
    if (tocandoId === atual.id) parar(); // para vibração, busca e conexão desta tag
    const restantes = tags.length - 1;
    const novoIndice = Math.max(0, Math.min(indice, restantes - 1)); // se era a última, vai para a anterior
    setIndice(novoIndice);
    onRemover && onRemover(atual);
    if (restantes > 0) {
      // depois que a lista atualiza, posiciona na página certa (sem animação)
      setTimeout(() => lista.current && lista.current.scrollToIndex({ index: novoIndice, animated: false }), 0);
    }
  };

  return (
    <View style={s.tela}>
      <Cartao style={s.cartao}>
        {tags.length === 0 ? (
          <View style={s.vazio}>
            <MaterialCommunityIcons name="tag-outline" size={80} color={cores.escuro} />
            <Text style={s.vazioTitulo} accessibilityRole="header">Nenhuma tag</Text>
            <Text style={s.vazioTexto}>Toque no botão abaixo para adicionar uma tag.</Text>
            <Botao titulo="ADICIONAR TAG" tamanho="grande" variante="azul" onPress={onAdicionar} style={s.vazioBotao} rotulo="Adicionar nova tag" />
          </View>
        ) : (
          <>
        <View
          style={s.listaBox}
          onLayout={(e) => setMedida({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        >
          {medida.w > 0 && (
            <FlatList
              ref={lista}
              style={{ width: medida.w, height: medida.h }}
              horizontal
              data={tags}
              extraData={`${tocandoId}-${status.tipo}-${status.distancia}`}
              keyExtractor={(t) => t.id}
              renderItem={({ item }) => (
                <Tag item={item} largura={medida.w} altura={medida.h} tocando={tocandoId === item.id} status={tocandoId === item.id ? status : null} onTocar={() => { onTocar && onTocar(item); alternar(item); }} onDetalhes={() => { setIndice(tags.findIndex((t) => t.id === item.id)); setDetalhes(true); }} />
              )}
              getItemLayout={(_, i) => ({ length: medida.w, offset: medida.w * i, index: i })}
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToInterval={medida.w}
              snapToAlignment="start"
              decelerationRate="fast"
              disableIntervalMomentum
              onMomentumScrollEnd={(e) => setIndice(Math.round(e.nativeEvent.contentOffset.x / medida.w))}
            />
          )}
        </View>

        <View style={s.icones}>
          <Botao variante="escuro" onPress={() => onEditar && onEditar(atual)} style={s.circulo} rotulo={`Editar a tag ${atual.nome.toLowerCase()}`}>
            <MaterialCommunityIcons name="pencil" size={40} color={cores.branco} />
          </Botao>
          <Botao variante="perigo" onPress={() => setConfirmando(true)} style={s.circulo} rotulo={`Remover a tag ${atual.nome.toLowerCase()}`}>
            <MaterialCommunityIcons name="trash-can-outline" size={40} color={cores.branco} />
          </Botao>
          <Botao variante="azul" onPress={onAdicionar} style={s.circulo} rotulo="Adicionar nova tag">
            <MaterialCommunityIcons name="plus" size={48} color={cores.texto} />
          </Botao>
        </View>

        <View style={s.paginas}>
          {tags.map((t, i) => (
            <View key={t.id} style={[s.bolinha, i === indice && s.bolinhaAtiva]} />
          ))}
          <Text style={s.contagem}>{indice + 1} de {tags.length}</Text>
        </View>
          </>
        )}
      </Cartao>

      {/* Zona própria do robô: não cobre o cartão e a tela não precisa rolar */}
      <View style={s.zonaRobo}>
        <TouchableOpacity style={s.robo} onPress={onAssistente} accessibilityRole="button" accessibilityLabel="Abrir o assistente por voz">
          <MaterialCommunityIcons name="robot-happy-outline" size={92} color={cores.branco} />
        </TouchableOpacity>
      </View>

      <DetalhesTag visivel={detalhes} item={atual ? { ...atual, distancia: detalheDistancia, status: textoStatus(statusAtual) } : atual} onFechar={() => setDetalhes(false)} />

      <ConfirmarRemocao
        visivel={confirmando && !!atual}
        nome={atual ? atual.nome.toLowerCase() : ''}
        onCancelar={() => setConfirmando(false)}
        onConfirmar={() => { setConfirmando(false); remover(); }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.amarelo, paddingHorizontal: 20, paddingTop: 20 },
  cartao: { flex: 1 },
  listaBox: { flex: 1, minHeight: 0 },
  tag: { paddingHorizontal: 2 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icone: {
    width: 100,
    height: 100,
    borderRadius: raio.cartao,
    backgroundColor: cores.cinza,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, minWidth: 0, gap: 4 },
  nome: { fontSize: 38, fontWeight: '800', color: cores.texto },
  distancia: { fontSize: 22, fontWeight: '700', color: cores.escuro },
  status: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.amarelo,
    borderRadius: raio.pill,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  statusRuim: { backgroundColor: cores.vermelho },
  ponto: { width: 12, height: 12, borderRadius: 6, backgroundColor: cores.escuro },
  statusTexto: { fontSize: 18, fontWeight: '800', color: cores.texto },
  // a zona ocupa o espaço livre e centraliza o TOCAR (altura fixa em TOCAR_ALTURA)
  zonaTocar: { flex: 1, justifyContent: 'center', paddingHorizontal: TOCAR_ESPACO_LATERAL },
  linhaTocar: { flexDirection: 'row', alignItems: 'center', gap: DETALHES_ESPACO },
  tocar: { flex: 1, height: TOCAR_ALTURA, maxHeight: '100%' },
  detalhes: {
    width: DETALHES_TAMANHO,
    height: DETALHES_TAMANHO,
    borderRadius: raio.botao,
    backgroundColor: cores.cinza,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icones: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginTop: 12 },
  circulo: { width: 80, height: 80, minHeight: 80, borderRadius: 40, paddingHorizontal: 0 },
  paginas: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 },
  bolinha: { width: 12, height: 12, borderRadius: 6, backgroundColor: cores.cinza },
  bolinhaAtiva: { width: 28, backgroundColor: cores.escuro },
  contagem: { marginLeft: 8, fontSize: 16, fontWeight: '800', color: cores.texto },
  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 12 },
  vazioTitulo: { fontSize: 38, fontWeight: '800', color: cores.texto, textAlign: 'center' },
  vazioTexto: { fontSize: 24, fontWeight: '700', color: cores.escuro, textAlign: 'center' },
  vazioBotao: { alignSelf: 'stretch', minHeight: 96, marginTop: 12 },
  zonaRobo: { alignItems: 'center', paddingVertical: 8 },
  robo: {
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