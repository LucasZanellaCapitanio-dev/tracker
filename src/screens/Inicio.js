import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Cartao from '../components/Cartao';
import Botao from '../components/Botao';
import { cores, raio, fonte } from '../theme';

export default function Inicio({ onTocar, onAdicionar }) {
  return (
    <View style={s.tela}>
      <Cartao>
        <Text style={s.titulo}>MALA VIAGEM</Text>
        <View style={s.linha}>
          <View style={s.icone}>
            <MaterialCommunityIcons name="briefcase-outline" size={64} color={cores.branco} />
          </View>
          <Botao titulo="TOCAR" tamanho="grande" onPress={onTocar} style={s.tocar} rotulo="Tocar a tag da mala de viagem" />
        </View>
      </Cartao>

      <Cartao>
        <Text style={s.titulo}>ADICIONAR TAG</Text>
        <Botao onPress={onAdicionar} style={s.adicionar} rotulo="Adicionar tag">
          <MaterialCommunityIcons name="plus" size={64} color={cores.branco} />
        </Botao>
      </Cartao>
    </View>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.amarelo, padding: 20, gap: 20 },
  titulo: { textAlign: 'center', fontSize: fonte.titulo, fontWeight: '800', color: cores.texto, marginBottom: 10 },
  linha: { flexDirection: 'row', gap: 10 },
  icone: {
    width: 108,
    height: 108,
    borderRadius: raio.cartao,
    backgroundColor: cores.cinza,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tocar: { flex: 1, minHeight: 108 },
  adicionar: { minHeight: 108 },
});
