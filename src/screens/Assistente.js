import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAudioRecorder, RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import { cores, raio, fonte } from '../theme';

// Gravação em voz mono e mais leve (melhor para reconhecer fala)
const GRAVACAO = { ...RecordingPresets.HIGH_QUALITY, sampleRate: 16000, numberOfChannels: 1, bitRate: 64000 };

// >>> TROQUE pelo endereço que o Render mostrou (sem barra no final) <<<
const API = 'https://tracker-servidor.onrender.com';
const SAUDACAO = 'Olá! Sou o assistente do Tracker. Como posso ajudar?';

// ---------- NAVEGAÇÃO POR PEDIDO (texto ou voz) ----------
// ids iguais aos de tela do App.js
const NOMES_TELAS = { config: 'Configurações', inicio: 'Início', como: 'Como usar', adicionar: 'Adicionar tag' };

const DESTINOS = [
  { id: 'config', re: /\b(configurac\w*|ajustes?|opcoes)\b/ },
  { id: 'como', re: /\b(como usar|tutorial|instrucoes|tela de ajuda)\b/ },
  { id: 'adicionar', re: /\b(adicion\w*|nova|novo|cadastr\w*)\s+(uma\s+|um\s+)?(tag|aparelho|dispositivo)\b/ },
  { id: 'inicio', re: /\b(inicio|tela inicial|principal|home|voltar)\b/ },
];
const VERBO_IR = /\b(ir|va|vai|vamos|abr\w*|ver|mostr\w*|naveg\w*|lev\w*|troc\w*|mud\w*|quero|acess\w*|entr\w*)\b/;

const normalizar = (txt) => (txt || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();

// Devolve o id da tela pedida ("quero ir para as configurações") ou null.
// Exige um verbo de ir/abrir, ou uma frase curta só com o nome da tela.
function destinoDe(txt) {
  const n = normalizar(txt);
  if (!n) return null;
  if (/^(como|o que|qual|quais|por que|onde|quando)\b/.test(n)) return null; // pergunta: deixa a IA responder
  const achado = DESTINOS.find((d) => d.re.test(n));
  if (!achado) return null;
  const curta = n.split(' ').length <= 3;
  return VERBO_IR.test(n) || curta ? achado.id : null;
}

// A IA (servidor) também pode pedir navegação escrevendo [IR:config], [IR:inicio], [IR:como] ou [IR:adicionar].
function separarComando(resposta) {
  const m = /\[IR:(\w+)\]/.exec(resposta || '');
  const limpo = (resposta || '').replace(/\[IR:\w+\]/g, '').trim();
  return { limpo, destino: m && NOMES_TELAS[m[1]] ? m[1] : null };
}

// Mensagens de aviso/erro não contam como "última resposta" para repetir.
const ehAviso = (t) => /^(Erro|Sem permissão|Gravação muito curta|Falha|Não consegui|Seu celular não tem voz|O áudio ficou)/.test(t);

// "repete", "repita", "de novo", "não entendi"... (só em frases curtas, para não confundir com perguntas)
function pedeRepeticao(txt) {
  const n = (txt || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z\s]/g, ' ').trim();
  const palavras = n.split(/\s+/).filter(Boolean);
  return palavras.length > 0 && palavras.length <= 6 && /\b(repet\w*|repita\w*|de novo|outra vez|nao entendi|nao ouvi)\b/.test(n);
}

function ultimaResposta(lista) {
  for (let i = lista.length - 1; i >= 0; i--) {
    if (lista[i].role === 'assistant' && !ehAviso(lista[i].content)) return lista[i].content;
  }
  return SAUDACAO;
}

function Balao({ role, children, onRepetir }) {
  const robo = role !== 'user';
  return (
    <View style={[s.balao, robo ? s.balaoRobo : s.balaoUsuario]}>
      <View style={s.balaoTopo}>
        <MaterialCommunityIcons name={robo ? 'robot-happy-outline' : 'account'} size={48} color={cores.texto} />
        {robo && onRepetir ? (
          <TouchableOpacity style={s.repetirBalao} onPress={onRepetir} accessibilityRole="button" accessibilityLabel="Repetir esta resposta em voz alta">
            <MaterialCommunityIcons name="volume-high" size={30} color={cores.texto} />
            <Text style={s.repetirBalaoTexto}>REPETIR</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={s.balaoTexto}>{children}</Text>
    </View>
  );
}

export default function Assistente({ onNavegar }) {
  const [msgs, setMsgs] = useState([]);
  const [texto, setTexto] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [voz, setVoz] = useState(true);
  const [gravando, setGravando] = useState(false);
  const inicio = useRef(0);
  const gravador = useAudioRecorder(GRAVACAO);
  const timerNav = useRef(null);
  const rolagem = useRef(null);

  // se a pessoa sair da tela sozinha antes da navegação automática, cancela
  useEffect(() => () => clearTimeout(timerNav.current), []);

  // Vai para outra tela depois de mostrar (e falar) a frase, para dar tempo de ler/ouvir
  function irPara(id) {
    clearTimeout(timerNav.current);
    timerNav.current = setTimeout(() => onNavegar && onNavegar(id), 2200);
  }

  function navegar(id) {
    const frase = `Navegando para a tela ${NOMES_TELAS[id]}.`;
    setMsgs((m) => [...m, { role: 'assistant', content: frase }]);
    if (voz) falarTexto(frase);
    irPara(id);
  }

  // o próprio celular fala a resposta (grátis, sem servidor)
  function avisar(texto) {
    setMsgs((m) => [...m, { role: 'assistant', content: texto }]);
  }

  async function falarTexto(texto) {
    try {
      Speech.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      const opcoes = { language: 'pt-BR', rate: 0.95, onError: () => avisar('Não consegui falar a resposta em voz alta.') };
      try {
        const vozes = await Speech.getAvailableVoicesAsync();
        const pt = vozes.find((v) => (v.language || '').toLowerCase().replace('_', '-') === 'pt-br')
          || vozes.find((v) => (v.language || '').toLowerCase().startsWith('pt'));
        if (pt) opcoes.voice = pt.identifier;
        else if (vozes.length > 0) avisar('Seu celular não tem voz em português. Instale em Configurações, Idioma, Saída de texto para fala.');
      } catch { /* sem lista de vozes: tenta falar mesmo assim */ }
      Speech.speak(texto, opcoes);
    } catch (e) {
      avisar(`Erro na voz: ${e?.message ?? e}`);
    }
  }

  // Liga/desliga a voz da IA. Desligando, para de falar na hora.
  function alternarVoz() {
    if (voz) Speech.stop();
    setVoz(!voz);
  }

  async function enviar() {
    if (!texto.trim() || carregando) return;
    const novas = [...msgs, { role: 'user', content: texto }];
    setMsgs(novas);
    setTexto('');
    if (pedeRepeticao(texto)) {
      falarTexto(ultimaResposta(msgs)); // repete exatamente o que foi dito, sem perguntar de novo à IA
      return;
    }
    const destinoLocal = destinoDe(texto);
    if (destinoLocal) {
      navegar(destinoLocal);
      return;
    }
    setCarregando(true);
    try {
      const r = await fetch(`${API}/ajuda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagens: novas }),
      });
      const { texto: resposta, erro } = await r.json();
      const { limpo, destino } = separarComando(resposta);
      setMsgs([...novas, { role: 'assistant', content: (resposta ? limpo : null) ?? erro ?? 'Sem resposta.' }]);
      if (voz && limpo) falarTexto(limpo);
      if (destino) irPara(destino);
    } catch {
      setMsgs([...novas, { role: 'assistant', content: 'Não consegui responder agora.' }]);
    } finally {
      setCarregando(false);
    }
  }

  // Envia o áudio com XMLHttpRequest. O fetch do Expo não aceita arquivo no FormData
  // ("Unsupported FormDataPart implementation"), mas o XMLHttpRequest aceita.
  function enviarAudio(uri, historico) {
    return new Promise((resolve, reject) => {
      const f = new FormData();
      f.append('audio', { uri, name: 'voz.m4a', type: 'audio/m4a' });
      f.append('historico', JSON.stringify(historico));
      const xhr = new XMLHttpRequest();
      xhr.timeout = 90000; // o servidor gratuito pode demorar a acordar
      xhr.onload = () => {
        try { resolve(JSON.parse(xhr.responseText)); } catch (e) { reject(new Error('resposta inválida do servidor')); }
      };
      xhr.onerror = () => reject(new Error('sem conexão com o servidor'));
      xhr.ontimeout = () => reject(new Error('o servidor demorou demais'));
      xhr.open('POST', `${API}/voz`);
      xhr.send(f);
    });
  }

  // 1º toque: começa a gravar. 2º toque: para, envia e toca a resposta.
  async function falar() {
    if (carregando) return;
    if (!gravando) {
      try {
        Speech.stop(); // a voz do app não pode ser gravada junto
        const { granted } = await requestRecordingPermissionsAsync();
        if (!granted) {
          setMsgs([...msgs, { role: 'assistant', content: 'Sem permissão do microfone. Ative nas configurações do celular, em Expo Go.' }]);
          return;
        }
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await gravador.prepareToRecordAsync();
        gravador.record();
        inicio.current = Date.now();
        setGravando(true);
      } catch (e) {
        setMsgs([...msgs, { role: 'assistant', content: `Erro ao gravar: ${e?.message ?? e}` }]);
      }
      return;
    }
    setGravando(false);
    if (Date.now() - inicio.current < 1000) {
      await gravador.stop();
      setMsgs([...msgs, { role: 'assistant', content: 'Gravação muito curta. Fale por pelo menos 2 segundos.' }]);
      return;
    }
    setCarregando(true);
    try {
      await gravador.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      if (!gravador.uri) throw new Error('sem arquivo');
      const d = await enviarAudio(gravador.uri, msgs);
      if (!d.texto) {
        setMsgs([...msgs, { role: 'assistant', content: d.erro ?? 'Sem resposta.' }]);
        return;
      }
      if (pedeRepeticao(d.pergunta)) {
        setMsgs([...msgs, { role: 'user', content: d.pergunta }]);
        falarTexto(ultimaResposta(msgs));
        return;
      }
      const destinoLocal = destinoDe(d.pergunta);
      if (destinoLocal) {
        setMsgs([...msgs, { role: 'user', content: d.pergunta }]);
        navegar(destinoLocal);
        return;
      }
      const { limpo, destino } = separarComando(d.texto);
      setMsgs([...msgs, ...(d.pergunta ? [{ role: 'user', content: d.pergunta }] : []), { role: 'assistant', content: limpo || d.texto }]);
      if (destino) irPara(destino);
      if (voz) falarTexto(limpo || d.texto);
    } catch (e) {
      setMsgs([...msgs, { role: 'assistant', content: `Erro ao enviar o áudio: ${e?.message ?? e}` }]);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableOpacity
        style={[s.voz, !voz && s.vozOff]}
        onPress={alternarVoz}
        accessibilityRole="switch"
        accessibilityLabel={voz ? 'Voz ligada. Toque para desligar' : 'Voz desligada. Toque para ligar'}
        accessibilityState={{ checked: voz }}
      >
        {/* bolinha à direita = voz ligada | à esquerda = voz desligada */}
        {!voz && <View style={s.vozBolinha} />}
        <Text style={s.vozTexto}>VOZ</Text>
        {voz && <View style={s.vozBolinha} />}
      </TouchableOpacity>


      <ScrollView ref={rolagem} contentContainerStyle={s.pad} onContentSizeChange={() => rolagem.current?.scrollToEnd({ animated: true })}>
        <Balao role="assistant" onRepetir={() => falarTexto(SAUDACAO)}>{SAUDACAO}</Balao>
        {msgs.map((m, i) => (
          <Balao key={i} role={m.role} onRepetir={m.role === 'assistant' && !ehAviso(m.content) ? () => falarTexto(m.content) : undefined}>{m.content}</Balao>
        ))}
        {gravando ? <Balao role="assistant">Estou ouvindo... toque no microfone para enviar.</Balao> : null}
        {carregando ? <Balao role="assistant">Pensando...</Balao> : null}
      </ScrollView>

      <View style={s.entradaBorda}>
        <View style={s.entrada}>
          <MaterialCommunityIcons name="magnify" size={44} color={cores.texto} />
          <TextInput
            style={s.campo}
            value={texto}
            onChangeText={setTexto}
            placeholder="Sua dúvida..."
            placeholderTextColor={cores.escuro}
            accessibilityLabel="Escreva sua dúvida"
            onSubmitEditing={enviar}
          />
          {texto.trim() ? (
            <TouchableOpacity style={s.enviar} onPress={enviar} accessibilityRole="button" accessibilityLabel="Enviar mensagem">
              <MaterialCommunityIcons name="send" size={38} color={cores.texto} />
            </TouchableOpacity>
          ) : null}
          {/* Microfone sempre fixo no canto direito da barra */}
          <TouchableOpacity style={[s.mic, gravando && s.micGravando]} onPress={falar} accessibilityRole="button" accessibilityLabel={gravando ? 'Gravando. Toque para enviar' : 'Falar com o assistente'}>
            <MaterialCommunityIcons name={gravando ? 'stop' : 'microphone'} size={48} color={cores.branco} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.amarelo },
  balaoTopo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  repetirBalao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: raio.pill,
    backgroundColor: cores.amarelo,
  },
  repetirBalaoTexto: { fontSize: 20, fontWeight: '800', color: cores.texto },
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
  balao: { maxWidth: '88%', borderRadius: raio.cartao, padding: 18, gap: 6, backgroundColor: cores.branco },
  balaoRobo: { alignSelf: 'flex-start' },
  balaoUsuario: { alignSelf: 'flex-end' },
  balaoTexto: { fontSize: 28, fontWeight: '800', color: cores.texto },
  entradaBorda: {
    margin: 12,
  },
  entrada: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 14,
    paddingRight: 6,
    height: 96,
    borderRadius: raio.pill,
    backgroundColor: cores.branco,
  },
  campo: { flex: 1, minWidth: 0, fontSize: 28, fontWeight: '700', color: cores.texto },
  enviar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: cores.amarelo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micGravando: { backgroundColor: '#E53935' },
  mic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: cores.texto,
    alignItems: 'center',
    justifyContent: 'center',
  },
});