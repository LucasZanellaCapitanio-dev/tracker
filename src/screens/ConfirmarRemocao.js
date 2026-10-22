import React from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import Botao from './Botao';
import { cores, raio, fonte } from '../theme';

// Janela de confirmação antes de remover. Só interface por enquanto.
export default function ConfirmarRemocao({ visivel, nome, onCancelar, onConfirmar }) {
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={s.fundo}>
        <View style={s.caixa} accessibilityViewIsModal>
          <Text style={s.titulo} accessibilityRole="header">Remover tag?</Text>
          <Text style={s.texto}>Você quer mesmo remover a tag {nome}?</Text>
          <View style={s.botoes}>
            <Botao titulo="CANCELAR" tamanho="medio" variante="claro" onPress={onCancelar} style={[s.botao, s.contorno]} rotulo="Cancelar e manter a tag" />
            <Botao titulo="REMOVER" tamanho="medio" variante="perigo" onPress={onConfirmar} style={s.botao} rotulo={`Confirmar a remoção da tag ${nome}`} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  caixa: { width: '100%', backgroundColor: cores.branco, borderRadius: raio.cartao, padding: 24 },
  titulo: { fontSize: fonte.titulo, fontWeight: '800', color: cores.texto, textAlign: 'center' },
  texto: { marginTop: 8, fontSize: fonte.secao, fontWeight: '700', color: cores.escuro, textAlign: 'center' },
  botoes: { flexDirection: 'row', gap: 12, marginTop: 24 },
  botao: { flex: 1, minHeight: 72 },
  contorno: { borderWidth: 3, borderColor: cores.escuro },
});
