import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cores, fonte } from '../theme';

export function BotaoIcone({ nome, rotulo, onPress, tamanho = 32 }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      style={s.iconeBotao}
    >
      <MaterialCommunityIcons name={nome} size={tamanho} color={cores.texto} />
    </TouchableOpacity>
  );
}

// esquerda / direita: { icone, rotulo, onPress } (opcionais)
export function Cabecalho({ titulo, fundo = cores.branco, esquerda, direita }) {
  return (
    <View style={[s.cabecalho, { backgroundColor: fundo }]}>
      <View style={s.lado}>
        {esquerda && <BotaoIcone nome={esquerda.icone} rotulo={esquerda.rotulo} onPress={esquerda.onPress} />}
      </View>
      <Text style={s.titulo} accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit>
        {titulo}
      </Text>
      <View style={s.lado}>
        {direita && <BotaoIcone nome={direita.icone} rotulo={direita.rotulo} onPress={direita.onPress} />}
      </View>
    </View>
  );
}

const ITENS = [
  { id: 'config', icone: 'cog-outline', rotulo: 'Configurações' },
  { id: 'inicio', icone: 'home', rotulo: 'Início' },
  { id: 'como', icone: 'help-circle-outline', rotulo: 'Como usar' },
];

export function BarraNav({ ativa, onChange, fundo = cores.branco }) {
  return (
    <View style={[s.barra, { backgroundColor: fundo }]}>
      {ITENS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[s.item, ativa === item.id && s.itemAtivo]}
          onPress={() => onChange(item.id)}
          accessibilityRole="tab"
          accessibilityLabel={item.rotulo}
          accessibilityState={{ selected: ativa === item.id }}
        >
          <MaterialCommunityIcons name={item.icone} size={66} color={cores.texto} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  cabecalho: { minHeight: 72, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  lado: { width: 56, alignItems: 'center' },
  titulo: { flex: 1, textAlign: 'center', fontSize: fonte.titulo, fontWeight: '800', color: cores.texto },
  iconeBotao: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  barra: { flexDirection: 'row', paddingBottom: 18 },
  item: {
    flex: 1,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderRightWidth: 2,
    borderRightColor: cores.cinzaAzulado,
  },
  itemAtivo: { borderTopColor: cores.escuro },
});
