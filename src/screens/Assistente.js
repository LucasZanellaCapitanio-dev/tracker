import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import Botao from '../components/Botao';
import Cartao from '../components/Cartao';

const API = 'http://SEU_IP:3000'; // em produção, uma URL https

export default function Assistente() {
  const [msgs, setMsgs] = useState([]);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function enviar() {
    if (!texto.trim() || carregando) return;
    const novas = [...msgs, { role: 'user', content: texto }];
    setMsgs(novas);
    setTexto('');
    setCarregando(true);
    try {
      const r = await fetch(`${API}/ajuda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagens: novas }),
      });
      const { texto: resposta } = await r.json();
      setMsgs([...novas, { role: 'assistant', content: resposta ?? 'Sem resposta.' }]);
    } catch {
      setMsgs([...novas, { role: 'assistant', content: 'Não consegui responder agora.' }]);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.pad}>
        {msgs.map((m, i) => (
          <Cartao key={i}><Text>{m.content}</Text></Cartao>
        ))}
      </ScrollView>
      <View style={s.entrada}>
        <TextInput style={s.campo} value={texto} onChangeText={setTexto} placeholder="Sua dúvida..." />
        <Botao titulo={carregando ? '...' : 'Enviar'} variante="primario" onPress={enviar} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  pad: { padding: 16, gap: 10 },
  entrada: { flexDirection: 'row', gap: 8, padding: 16 },
  campo: { flex: 1, borderWidth: 1, borderColor: '#E3E6EB', borderRadius: 10, paddingHorizontal: 12 },
});