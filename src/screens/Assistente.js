import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cores, raio, fonte } from '../theme';

const API = 'http://SEU_IP:3000'; // em produção, uma URL https
const SAUDACAO = 'Olá! Sou o assistente do Tracker. Como posso ajudar?';

function Balao({ role, children }) {
  const robo = role !== 'user';
  return (
    <View style={[s.balao, robo ? s.balaoRobo : s.balaoUsuario]}>
      <MaterialCommunityIcons name={robo ? 'robot-happy-outline' : 'account'} size={36} color={cores.texto} />
      <Text style={s.balaoTexto}>{children}</Text>
    </View>
  );
}

export default function Assistente() {
  const [msgs, setMsgs] = useState([]);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [voz, setVoz] = useState(true);

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

  function falar() {
    // TODO: ligar aqui a IA por voz (parte de vocês).
  }

  return (
    <KeyboardAvoidingView style={s.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity
        style={[s.voz, !voz && s.vozOff]}
        onPress={() => setVoz(!voz)}
        accessibilityRole="switch"
        accessibilityLabel="Voz"
        accessibilityState={{ checked: voz }}
      >
        <Text style={s.vozTexto}>VOZ</Text>
        <View style={s.vozBolinha} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={s.pad}>
        <Balao role="assistant">{SAUDACAO}</Balao>
        {msgs.map((m, i) => (
          <Balao key={i} role={m.role}>{m.content}</Balao>
        ))}
      </ScrollView>

      <View style={s.entradaBorda}>
        <View style={s.entrada}>
          <MaterialCommunityIcons name="magnify" size={36} color={cores.texto} />
          <TextInput
            style={s.campo}
            value={texto}
            onChangeText={setTexto}
            placeholder="Sua dúvida..."
            placeholderTextColor={cores.escuro}
            accessibilityLabel="Escreva sua dúvida"
            onSubmitEditing={enviar}
          />
          <TouchableOpacity
            style={s.mic}
            onPress={texto.trim() ? enviar : falar}
            accessibilityRole="button"
            accessibilityLabel={texto.trim() ? 'Enviar' : 'Falar com o assistente'}
          >
            <MaterialCommunityIcons name={texto.trim() ? 'send' : 'microphone'} size={32} color={cores.branco} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  voz: {
    alignSelf: 'center',
    width: 240,
    height: 56,
    marginTop: 12,
    borderRadius: raio.pill,
    backgroundColor: cores.azul,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  vozOff: { backgroundColor: cores.cinza },
  vozTexto: { flex: 1, textAlign: 'center', fontSize: fonte.titulo - 4, fontWeight: '800', color: cores.texto },
  vozBolinha: { width: 40, height: 40, borderRadius: 20, backgroundColor: cores.texto },
  pad: { padding: 16, gap: 14 },
  balao: { maxWidth: '82%', borderRadius: raio.cartao, padding: 14, gap: 4 },
  balaoRobo: { alignSelf: 'flex-start', backgroundColor: cores.amarelo },
  balaoUsuario: { alignSelf: 'flex-end', backgroundColor: cores.azul },
  balaoTexto: { fontSize: fonte.rotulo, fontWeight: '800', color: cores.texto },
  entradaBorda: {
    margin: 12,
    padding: 6,
    borderRadius: raio.pill,
    backgroundColor: cores.amarelo,
  },
  entrada: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 14,
    paddingRight: 6,
    height: 68,
    borderRadius: raio.pill,
    backgroundColor: cores.cinzaAzulado,
  },
  campo: { flex: 1, fontSize: fonte.rotulo, fontWeight: '700', color: cores.texto },
  mic: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: cores.texto,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
