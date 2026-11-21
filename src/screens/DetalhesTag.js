import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import Botao from '../components/Botao';
import { cores, raio, fonte } from '../theme';

// Mostra as informações da tag por inteiro (sem "..."), em letras grandes.
// A distância (valor do sinal, em dBm) e o status chegam prontos do TelaInicio, ao vivo enquanto a tag toca.
export default function DetalhesTag({ visivel, item, onFechar }) {
  if (!item) return null;
  const linhas = [
    { rotulo: 'NOME', valor: item.nome },
    { rotulo: 'DISTÂNCIA', valor: item.distancia ?? 'Toque em TOCAR para medir' },
    { rotulo: 'STATUS', valor: item.status ?? 'Pronta para tocar' },
  ];
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <View style={s.fundo}>
        <View style={s.caixa} accessibilityViewIsModal>
          <Text style={s.titulo} accessibilityRole="header">Detalhes da tag</Text>
          {linhas.map((l) => (
            <View key={l.rotulo} style={s.linha} accessible accessibilityLabel={`${l.rotulo}: ${l.valor}`}>
              <Text style={s.rotulo}>{l.rotulo}</Text>
              <Text style={s.valor}>{l.valor}</Text>
            </View>
          ))}
          <Botao titulo="FECHAR" tamanho="medio" onPress={onFechar} style={s.fechar} rotulo="Fechar os detalhes" />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  caixa: { width: '100%', backgroundColor: cores.branco, borderRadius: raio.cartao, padding: 24, gap: 14 },
  titulo: { fontSize: fonte.titulo, fontWeight: '800', color: cores.texto, textAlign: 'center' },
  linha: { gap: 2 },
  rotulo: { fontSize: 18, fontWeight: '800', color: cores.escuro },
  valor: { fontSize: 32, fontWeight: '800', color: cores.texto },
  fechar: { minHeight: 72, marginTop: 8 },
});
