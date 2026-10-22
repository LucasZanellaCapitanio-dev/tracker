import React, { useState } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Cartao from '../components/Cartao';
import Botao from '../components/Botao';
import { cores, raio, fonte } from '../theme';

// Exemplos só para mostrar a rolagem horizontal.
const TAGS = [
  { id: '1', nome: 'MALA VIAGEM', icone: 'briefcase-outline' },
  { id: '2', nome: 'CHAVES', icone: 'key-outline' },
  { id: '3', nome: 'MOCHILA', icone: 'bag-personal-outline' },
];

// Sem equipamentos: mostrar "Nenhum equipamento" e botão "Procurar rastreador".
export default function Inicio({ onTocar, onDesconectar, onRemover, onAdicionar }) {
  const { width } = useWindowDimensions();
  const largura = width - 40 - 28; // margem da tela (20+20) e padding do cartão (14+14)
  const [indice, setIndice] = useState(0);

  function Tag({ item }) {
    return (
      <View style={{ width: largura }}>
        <View style={s.linha}>
          <View style={s.icone}>
            <MaterialCommunityIcons name={item.icone} size={64} color={cores.branco} />
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
        <Botao titulo="TOCAR" tamanho="grande" onPress={onTocar} style={s.tocar} rotulo={`Tocar a tag ${item.nome.toLowerCase()}`} />
        <View style={s.acoes}>
          <Botao titulo="DESCONECTAR" tamanho="medio" variante="claro" onPress={onDesconectar} style={[s.acao, s.contorno]} rotulo={`Desconectar a tag ${item.nome.toLowerCase()}`} />
          <Botao titulo="REMOVER" tamanho="medio" variante="perigo" onPress={onRemover} style={s.acao} rotulo={`Remover a tag ${item.nome.toLowerCase()}`} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={s.tela} contentContainerStyle={s.pad}>
      {/* Um cartão só: lista de tags (rola para o lado) + adicionar */}
      <Cartao>
        <FlatList
          horizontal
          data={TAGS}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => <Tag item={item} />}
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          snapToInterval={largura}
          decelerationRate="fast"
          onMomentumScrollEnd={(e) => setIndice(Math.round(e.nativeEvent.contentOffset.x / largura))}
        />

        <View style={s.paginas}>
          {TAGS.map((t, i) => (
            <View key={t.id} style={[s.bolinha, i === indice && s.bolinhaAtiva]} />
          ))}
          <Text style={s.contagem}>{indice + 1} de {TAGS.length}</Text>
        </View>

        <View style={s.divisor} />

        <TouchableOpacity
          style={s.adicionar}
          onPress={onAdicionar}
          accessibilityRole="button"
          accessibilityLabel="Adicionar tag. Procurar novo rastreador"
        >
          <View style={s.mais}>
            <MaterialCommunityIcons name="plus" size={48} color={cores.branco} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.adicionarTitulo}>ADICIONAR TAG</Text>
            <Text style={s.suave}>Procurar novo rastreador</Text>
          </View>
        </TouchableOpacity>
      </Cartao>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.amarelo },
  // espaço no fim para o botão do robô não cobrir o conteúdo
  pad: { padding: 20, paddingBottom: 200 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  icone: {
    width: 108,
    height: 108,
    borderRadius: raio.cartao,
    backgroundColor: cores.cinza,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 6 },
  nome: { fontSize: fonte.titulo - 4, fontWeight: '800', color: cores.texto },
  suave: { fontSize: fonte.rotulo, fontWeight: '700', color: cores.escuro },
  status: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: cores.amarelo,
    borderRadius: raio.pill,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  ponto: { width: 12, height: 12, borderRadius: 6, backgroundColor: cores.escuro },
  statusTexto: { fontSize: 16, fontWeight: '800', color: cores.texto },
  tocar: { minHeight: 108, marginTop: 14 },
  acoes: { flexDirection: 'row', gap: 10, marginTop: 10 },
  acao: { flex: 1, minHeight: 72 },
  contorno: { borderWidth: 3, borderColor: cores.escuro },
  paginas: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  bolinha: { width: 12, height: 12, borderRadius: 6, backgroundColor: cores.cinza },
  bolinhaAtiva: { width: 28, backgroundColor: cores.escuro },
  contagem: { marginLeft: 8, fontSize: 16, fontWeight: '800', color: cores.texto },
  divisor: { height: 2, backgroundColor: cores.texto, marginVertical: 16 },
  adicionar: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: raio.cartao,
    borderWidth: 4,
    borderStyle: 'dashed',
    borderColor: cores.escuro,
  },
  mais: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: cores.escuro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adicionarTitulo: { fontSize: fonte.titulo - 4, fontWeight: '800', color: cores.texto },
});
