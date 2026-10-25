import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Cartao from '../components/Cartao';
import Botao from '../components/Botao';
import ConfirmarRemocao from '../components/ConfirmarRemocao';
import { cores, raio, fonte } from '../theme';

// Exemplos só para mostrar a rolagem horizontal.
const TAGS = [
  { id: '1', nome: 'MALA VIAGEM', icone: 'briefcase-outline' },
  { id: '2', nome: 'CHAVES', icone: 'key-outline' },
  { id: '3', nome: 'MOCHILA', icone: 'bag-personal-outline' },
];

// Sem equipamentos: mostrar "Nenhum equipamento" e botão "Procurar rastreador".
function Tag({ item, largura, altura, onTocar, onDesconectar }) {
  const nome = item.nome.toLowerCase();
  return (
    <View style={[s.tag, { width: largura, height: altura }]}>
      <View style={s.linha}>
        <View style={s.icone}>
          <MaterialCommunityIcons name={item.icone} size={60} color={cores.branco} />
        </View>
        <View style={s.info}>
          <Text style={s.nome} numberOfLines={2}>{item.nome}</Text>
          <Text style={s.suave}>Distância · Bateria</Text>
          <View style={s.status}>
            <View style={s.ponto} />
            <Text style={s.statusTexto}>Conectado</Text>
          </View>
        </View>
      </View>
      <Botao titulo="TOCAR" tamanho="grande" onPress={onTocar} style={s.tocar} rotulo={`Tocar a tag ${nome}`} />
      <View style={s.acoes}>
        <Botao titulo="DESCONECTAR" tamanho="medio" variante="claro" onPress={onDesconectar} style={[s.acao, s.contorno]} rotulo={`Desconectar a tag ${nome}`} />
      </View>
    </View>
  );
}

export default function Inicio({ onTocar, onDesconectar, onRemover, onEditar, onAdicionar, onAssistente }) {
  // Tamanho real da área da lista: cada página tem exatamente esse tamanho.
  const [medida, setMedida] = useState({ w: 0, h: 0 });
  const [indice, setIndice] = useState(0);
  const [confirmando, setConfirmando] = useState(false);
  const atual = TAGS[indice] || TAGS[0];

  return (
    <View style={s.tela}>
      <Cartao style={s.cartao}>
        <View
          style={s.listaBox}
          onLayout={(e) => setMedida({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        >
          {medida.w > 0 && (
            <FlatList
              style={{ width: medida.w, height: medida.h }}
              horizontal
              data={TAGS}
              keyExtractor={(t) => t.id}
              renderItem={({ item }) => (
                <Tag item={item} largura={medida.w} altura={medida.h} onTocar={onTocar} onDesconectar={onDesconectar} />
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
          {TAGS.map((t, i) => (
            <View key={t.id} style={[s.bolinha, i === indice && s.bolinhaAtiva]} />
          ))}
          <Text style={s.contagem}>{indice + 1} de {TAGS.length}</Text>
        </View>
      </Cartao>

      {/* Zona própria do robô: não cobre o cartão e a tela não precisa rolar */}
      <View style={s.zonaRobo}>
        <TouchableOpacity style={s.robo} onPress={onAssistente} accessibilityRole="button" accessibilityLabel="Abrir o assistente por voz">
          <MaterialCommunityIcons name="robot-happy-outline" size={92} color={cores.branco} />
        </TouchableOpacity>
      </View>

      <ConfirmarRemocao
        visivel={confirmando}
        nome={atual.nome.toLowerCase()}
        onCancelar={() => setConfirmando(false)}
        onConfirmar={() => { setConfirmando(false); onRemover && onRemover(atual); }}
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
  info: { flex: 1, gap: 4 },
  nome: { fontSize: fonte.titulo - 4, fontWeight: '800', color: cores.texto },
  suave: { fontSize: fonte.rotulo, fontWeight: '700', color: cores.escuro },
  status: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.amarelo,
    borderRadius: raio.pill,
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  ponto: { width: 12, height: 12, borderRadius: 6, backgroundColor: cores.escuro },
  statusTexto: { fontSize: 16, fontWeight: '800', color: cores.texto },
  // o TOCAR ocupa todo o espaço que sobrar, então a tela sempre fecha certinho
  tocar: { flex: 1, minHeight: 64, marginTop: 10 },
  acoes: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  acao: { flex: 1, minHeight: 72 },
  contorno: { borderWidth: 3, borderColor: cores.escuro },
  icones: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginTop: 12 },
  circulo: { width: 80, height: 80, minHeight: 80, borderRadius: 40, paddingHorizontal: 0 },
  paginas: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 },
  bolinha: { width: 12, height: 12, borderRadius: 6, backgroundColor: cores.cinza },
  bolinhaAtiva: { width: 28, backgroundColor: cores.escuro },
  contagem: { marginLeft: 8, fontSize: 16, fontWeight: '800', color: cores.texto },
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
//teste