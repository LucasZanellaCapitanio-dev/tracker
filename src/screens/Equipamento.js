import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Cartao from '../components/Cartao';
import Botao from '../components/Botao';
import { cores, raio, fonte } from '../theme';

// Sem equipamentos: mostrar "Nenhum equipamento" e botão "Procurar rastreador".
export default function Equipamento() {
  return (
    <ScrollView style={s.tela} contentContainerStyle={s.pad}>
      <Cartao>
        <View style={s.linha}>
          <View style={s.icone}>
            <MaterialCommunityIcons name="bluetooth" size={40} color={cores.branco} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.nome}>Nome do equipamento</Text>
            <Text style={s.suave}>Distância · Bateria</Text>
          </View>
          <View style={s.status}>
            <View style={s.ponto} />
            <Text style={s.statusTexto}>Conectado</Text>
          </View>
        </View>
        <View style={s.acoes}>
          <Botao titulo="Tocar" style={s.acao} />
          <Botao titulo="Desconectar" variante="claro" style={[s.acao, s.contorno]} />
          <Botao titulo="Remover" variante="perigo" style={s.acao} />
        </View>
      </Cartao>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.amarelo },
  pad: { padding: 20 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icone: {
    width: 72,
    height: 72,
    borderRadius: raio.cartao,
    backgroundColor: cores.cinza,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nome: { fontSize: fonte.rotulo + 2, fontWeight: '800', color: cores.texto },
  suave: { marginTop: 2, fontSize: 14, fontWeight: '600', color: cores.escuro },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: cores.amarelo,
    borderRadius: raio.pill,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  ponto: { width: 9, height: 9, borderRadius: 5, backgroundColor: cores.escuro },
  statusTexto: { fontSize: 13, fontWeight: '800', color: cores.texto },
  acoes: { flexDirection: 'row', gap: 8, marginTop: 16 },
  acao: { flex: 1 },
  contorno: { borderWidth: 2, borderColor: cores.escuro },
});
