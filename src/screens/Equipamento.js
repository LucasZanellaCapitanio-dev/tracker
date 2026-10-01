import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Cartao from '../components/Cartao';
import Botao from '../components/Botao';
import { cores, raio } from '../theme';

export default function Equipamento() {
  return (
    <ScrollView contentContainerStyle={s.pad}>
      <Cartao>
        <View style={s.linha}>
          <View style={s.icone}>
            <Ionicons name="bluetooth" size={24} color={cores.destaque} />
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
          <Botao titulo="Tocar" variante="primario" style={s.acao} />
          <Botao titulo="Desconectar" style={s.acao} />
          <Botao titulo="Remover" variante="perigo" style={s.acao} />
        </View>
      </Cartao>

      <Text style={s.nota}>
        Sem equipamentos: mostrar "Nenhum equipamento" e botão "Procurar rastreador".
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pad: { padding: 16 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icone: {
    width: 48,
    height: 48,
    borderRadius: raio.cartao,
    backgroundColor: cores.destaqueSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nome: { fontSize: 16, fontWeight: '700', color: cores.texto },
  suave: { marginTop: 2, fontSize: 13, color: cores.textoSuave },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: cores.sucessoSuave,
    borderRadius: raio.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  ponto: { width: 7, height: 7, borderRadius: 4, backgroundColor: cores.sucesso },
  statusTexto: { fontSize: 12, fontWeight: '600', color: cores.sucesso },
  acoes: { flexDirection: 'row', gap: 8, marginTop: 14 },
  acao: { flex: 1 },
  nota: { color: cores.textoSuave, fontStyle: 'italic', fontSize: 13, marginTop: 14 },
});
