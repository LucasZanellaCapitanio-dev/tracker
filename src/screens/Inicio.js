import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Cartao from '../components/Cartao';
import Botao from '../components/Botao';
import { cores, raio, fonte } from '../theme';

// Tela única: lista de tags (antiga tela de equipamentos) + adicionar.
// Sem equipamentos: mostrar "Nenhum equipamento" e botão "Procurar rastreador".
export default function Inicio({ onTocar, onDesconectar, onRemover, onAdicionar }) {
  return (
    <ScrollView style={s.tela} contentContainerStyle={s.pad}>
      <Cartao>
        <View style={s.linha}>
          <View style={s.icone}>
            <MaterialCommunityIcons name="briefcase-outline" size={64} color={cores.branco} />
          </View>
          <View style={s.info}>
            <Text style={s.nome}>MALA VIAGEM</Text>
            <Text style={s.suave}>Distância · Bateria</Text>
            <View style={s.status}>
              <View style={s.ponto} />
              <Text style={s.statusTexto}>Conectado</Text>
            </View>
          </View>
        </View>

        <Botao titulo="TOCAR" tamanho="grande" onPress={onTocar} style={s.tocar} rotulo="Tocar a tag da mala de viagem" />

        <View style={s.acoes}>
          <Botao titulo="DESCONECTAR" tamanho="medio" variante="claro" onPress={onDesconectar} style={[s.acao, s.contorno]} rotulo="Desconectar a tag da mala de viagem" />
          <Botao titulo="REMOVER" tamanho="medio" variante="perigo" onPress={onRemover} style={s.acao} rotulo="Remover a tag da mala de viagem" />
        </View>
      </Cartao>

      <TouchableOpacity
        style={s.adicionar}
        onPress={onAdicionar}
        accessibilityRole="button"
        accessibilityLabel="Adicionar tag. Procurar novo rastreador"
      >
        <View style={s.mais}>
          <MaterialCommunityIcons name="plus" size={56} color={cores.branco} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.adicionarTitulo}>ADICIONAR TAG</Text>
          <Text style={s.suave}>Procurar novo rastreador</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.amarelo },
  // espaço no fim para o botão do robô não cobrir o conteúdo
  pad: { padding: 20, gap: 20, paddingBottom: 200 },
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
  adicionar: {
    minHeight: 128,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    backgroundColor: cores.branco,
    borderRadius: raio.cartao,
    borderWidth: 4,
    borderStyle: 'dashed',
    borderColor: cores.escuro,
  },
  mais: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: cores.escuro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adicionarTitulo: { fontSize: fonte.titulo - 4, fontWeight: '800', color: cores.texto },
});
