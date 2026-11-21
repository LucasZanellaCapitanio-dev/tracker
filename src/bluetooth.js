import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, PermissionsAndroid, Platform, Vibration } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { obterPreferencias } from './preferencias';

// Quanto tempo cada busca por aparelhos próximos dura antes de parar sozinha (economiza bateria).
const DURACAO_BUSCA_MS = 15000;

// ===== AJUSTE DA VIBRAÇÃO DO BOTÃO TOCAR =====
const RSSI_FORTE = -45;        // sinal a partir daqui (dBm) = vibra no ritmo mais rápido
const RSSI_FRACO = -100;       // sinal neste valor (dBm) ou pior = vibra no ritmo mais lento
const INTERVALO_RAPIDO_MS = 250;  // sinal forte: uma vibração a cada 1/4 de segundo
const INTERVALO_LENTO_MS = 2000;  // sinal fraco: uma vibração a cada 2 segundos
const PULSO_MS = 100;          // duração de cada vibração (no iOS o sistema usa duração fixa)
const SINAL_VALIDO_MS = 6000;  // sem nenhuma leitura por esse tempo = "sem sinal" (não vibra). Tags que anunciam devagar precisam de folga
const AVISO_SEM_SINAL_MS = 4000; // sem sinal depois desse tempo de toque: o status deixa de ser "Procurando sinal"
const ALERTA_SEM_SINAL_MS = 10000; // nunca achou a tag em 10 s: mostra um aviso (uma vez por toque)

// ===== AJUSTE DOS TEXTOS DE DISTÂNCIA E DA QUALIDADE DO SINAL (mexa só aqui) =====
// O app mede a força do sinal (RSSI, em dBm; quanto mais perto de 0, mais forte) e traduz em texto.
const LIMITE_MUITO_PERTO = -55; // a partir daqui (dBm) = "muito perto"
const LIMITE_PERTO = -70;       // a partir daqui = "perto"
const LIMITE_LONGE = -85;       // a partir daqui = "longe"; mais fraco que isso = "muito longe"
const RSSI_SINAL_FRACO = -92;   // mais fraco que isso, o status vira "Sinal fraco"
const LEITURAS_MINIMAS = 2;     // menos leituras que isso na janela abaixo = "Conexão ruim"
const JANELA_LEITURAS_MS = 5000;
const ATUALIZAR_STATUS_MS = 800; // de quanto em quanto tempo o texto da tela é reavaliado
// ==================================================================================
const TEMPO_MAXIMO_MS = 120000; // o toque para sozinho depois de 2 minutos (economiza bateria)
const INTERVALO_BEEP_MS = 2000; // os 3 beeps tocam de 2 em 2 segundos
const ESPERA_SINAL_MS = 500;    // sem sinal, tenta de novo a cada meio segundo (o beep sai assim que o sinal chega)
// =============================================

// Estados que a tela precisa tratar.
//  verificando | ligado | desligado | sem_permissao | indisponivel
let gerenciador = null;
function obterGerenciador() {
  if (!gerenciador) {
    // require sob demanda: sem o módulo nativo (Expo Go/Snack) o app não quebra, só avisa.
    const { BleManager } = require('react-native-ble-plx');
    gerenciador = new BleManager();
  }
  return gerenciador;
}


async function pedirPermissoes() {
  if (Platform.OS !== 'android') return true;

  const P = PermissionsAndroid.PERMISSIONS;
  const novo = Platform.Version >= 31;
  // Obrigatórias para procurar/conectar. No Android 12+ são as duas de Bluetooth; antes disso, a localização.
  const obrigatorias = novo ? [P.BLUETOOTH_SCAN, P.BLUETOOTH_CONNECT] : [P.ACCESS_FINE_LOCATION];
  // No Android 12+ a localização também é pedida: sem ela o sistema esconde alguns anúncios
  // (tags tipo beacon). Se a pessoa negar, a busca ainda funciona, só pode achar menos aparelhos.
  const lista = novo ? [...obrigatorias, P.ACCESS_FINE_LOCATION] : obrigatorias;

  const resultado = await PermissionsAndroid.requestMultiple(lista);

  return obrigatorias.every(
    (permissao) =>
      resultado[permissao] === PermissionsAndroid.RESULTS.GRANTED
  );
}


function traduzirEstado(s) {
  if (s === 'PoweredOn') return 'ligado';
  if (s === 'PoweredOff') return 'desligado';
  if (s === 'Unauthorized') return 'sem_permissao';
  if (s === 'Unsupported') return 'indisponivel';
  return 'verificando'; // Unknown / Resetting
}

// Traduz o sinal (RSSI, dBm) em uma frase curta, boa para leitor de tela.
// Dá para identificar a tag certa aproximando-a do celular: a frase vai para "muito perto".
export function descreverProximidade(rssi) {
  if (rssi == null) return '';
  if (rssi >= LIMITE_MUITO_PERTO) return 'muito perto';
  if (rssi >= LIMITE_PERTO) return 'perto';
  if (rssi >= LIMITE_LONGE) return 'longe';
  return 'muito longe';
}

// Atualiza a lista na tela no máximo uma vez por intervalo (os anúncios chegam várias vezes por segundo).
const ATUALIZAR_LISTA_MS = 700;

// Detecta se o Bluetooth está ligado e, estando, lista os aparelhos Bluetooth LE que estão por PERTO agora
// (busca de anúncios). Não usa o histórico de aparelhos pareados do celular.
export function useDispositivosBluetooth() {
  const [estado, setEstado] = useState('verificando');
  const [procurando, setProcurando] = useState(false);
  const [dispositivos, setDispositivos] = useState([]);
  const [erroBusca, setErroBusca] = useState(false);
  const ble = useRef(null);
  const mapa = useRef(new Map());
  const timer = useRef(null);
  const atualizacao = useRef(null);

  const parar = useCallback(() => {
    clearTimeout(timer.current);
    clearTimeout(atualizacao.current);
    atualizacao.current = null;
    try { ble.current && ble.current.stopDeviceScan(); } catch (e) { /* o scan pode já estar parado; pode ignorar */ }
    setProcurando(false);
  }, []);

  // Copia o que a busca achou para a tela.
  const publicar = useCallback(() => {
    atualizacao.current = null;
    setDispositivos([...mapa.current.values()].map((d) => ({ ...d })));
  }, []);

  const procurar = useCallback(async () => {
    setErroBusca(false);
    const m = ble.current;
    if (!m) return;
    if (!(await pedirPermissoes())) { setEstado('sem_permissao'); return; }

    // Busca (Android e iOS) os anúncios Bluetooth LE ao redor, pareados ou não.
    // É assim que as tags de rastreamento são achadas: elas só "gritam" o próprio sinal.
    parar();
    mapa.current.clear();
    setDispositivos([]);
    setProcurando(true);
    m.startDeviceScan(null, { allowDuplicates: true, scanMode: 2 /* LowLatency */ }, (erro, d) => {
      if (erro) { parar(); setErroBusca(true); return; }
      if (!d) return;
      const nome = d.name || d.localName || null;
      const atual = mapa.current.get(d.id);
      if (!atual) {
        mapa.current.set(d.id, { id: d.id, nome, rssi: d.rssi });
      } else {
        if (!atual.nome && nome) atual.nome = nome;
        // Suaviza o sinal para a frase "perto/longe" não ficar mudando a cada anúncio.
        if (d.rssi != null) atual.rssi = atual.rssi == null ? d.rssi : Math.round(atual.rssi * 0.6 + d.rssi * 0.4);
      }
      // Mantém a ordem de chegada: a lista não "pula" enquanto a pessoa navega com leitor de tela.
      if (!atualizacao.current) atualizacao.current = setTimeout(publicar, ATUALIZAR_LISTA_MS);
    });
    timer.current = setTimeout(() => { parar(); publicar(); }, DURACAO_BUSCA_MS);
  }, [parar, publicar]);

  // Monta: pede permissão, lê o estado do Bluetooth e acompanha mudanças (ligar/desligar).
  useEffect(() => {
    let ativo = true;
    let sub = null;
    (async () => {
      try {
        ble.current = obterGerenciador();
      } catch (e) {
        // Sem módulo nativo (Expo Go/Snack): avisa na tela em vez de quebrar.
        if (ativo) setEstado('indisponivel');
        return;
      }
      await pedirPermissoes();
      if (!ativo) return;
      sub = ble.current.onStateChange((s) => {
        const novo = traduzirEstado(s);
        setEstado(novo);
        if (novo !== 'ligado') parar();
      }, true);
    })();
    return () => {
      ativo = false;
      sub && sub.remove();
      parar();
    };
  }, [parar]);

  // Bluetooth ligado -> começa a procurar automaticamente.
  useEffect(() => {
    if (estado === 'ligado') procurar();
  }, [estado, procurar]);

  // Depois de conceder permissão o estado não dispara evento; relê manualmente.
  const reverificar = useCallback(async () => {
    if (!ble.current) return;
    await pedirPermissoes();
    setEstado(traduzirEstado(await ble.current.state()));
  }, []);

  const ligar = useCallback(async () => {
    try {
      if (Platform.OS === 'android' && ble.current) await ble.current.enable(); // abre o pedido do sistema
      else await Linking.openSettings();
    } catch (e) {
      Linking.openSettings();
    }
  }, []);

  return { estado, procurando, dispositivos, erroBusca, procurar, reverificar, ligar };
}

// Converte a força do sinal (RSSI, em dBm) no tempo entre vibrações:
// sinal forte -> INTERVALO_RAPIDO_MS; sinal fraco -> INTERVALO_LENTO_MS (proporcional entre os dois).
export function intervaloPorSinal(rssi) {
  const t = Math.min(1, Math.max(0, (RSSI_FORTE - rssi) / (RSSI_FORTE - RSSI_FRACO)));
  return Math.round(INTERVALO_RAPIDO_MS + t * (INTERVALO_LENTO_MS - INTERVALO_RAPIDO_MS));
}

// ===== SOM DO BOTÃO TOCAR =====
// 8 arquivos, cada um com 3 beeps numa frequência diferente (500 Hz até 2500 Hz).
// Quanto mais perto da tag (sinal mais forte), mais agudo (maior a frequência) é o beep.
// Para mudar as notas, gere outros arquivos com os mesmos nomes na pasta assets/beeps.
const SONS_BEEP = [
  require('../assets/beeps/beep-1.wav'), // 500 Hz  (longe)
  require('../assets/beeps/beep-2.wav'), // 629 Hz
  require('../assets/beeps/beep-3.wav'), // 792 Hz
  require('../assets/beeps/beep-4.wav'), // 996 Hz
  require('../assets/beeps/beep-5.wav'), // 1254 Hz
  require('../assets/beeps/beep-6.wav'), // 1578 Hz
  require('../assets/beeps/beep-7.wav'), // 1986 Hz
  require('../assets/beeps/beep-8.wav'), // 2500 Hz (colado na tag)
];

// Sinal (RSSI) -> número do arquivo de 0 (longe, grave) a 7 (perto, agudo).
export function nivelBeepPorSinal(rssi) {
  const t = Math.min(1, Math.max(0, (rssi - RSSI_FRACO) / (RSSI_FORTE - RSSI_FRACO)));
  return Math.round(t * (SONS_BEEP.length - 1));
}

// Um player por frequência, criado só quando é usado e liberado quando o toque para.
const players = new Map();

async function tocarBeep(nivel) {
  try {
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
    let p = players.get(nivel);
    if (!p) {
      p = createAudioPlayer(SONS_BEEP[nivel]);
      players.set(nivel, p);
    }
    p.volume = 1.0;
    await p.seekTo(0); // o expo-audio não volta ao início sozinho
    p.play();
  } catch (e) { /* falha de áudio não pode derrubar o toque; a vibração continua */ }
}

function liberarBeeps() {
  players.forEach((p) => { try { p.remove(); } catch (e) { /* já liberado */ } });
  players.clear();
}
// ===============================

const mesmoId = (a, b) => String(a).toUpperCase() === String(b).toUpperCase();

// Botão TOCAR: faz o celular vibrar no ritmo da força do sinal do aparelho pareado.
// Sem sinal = não vibra. A leitura do sinal vem de duas fontes ao mesmo tempo:
//  1) os anúncios Bluetooth que o aparelho emite (busca contínua);
//  2) a conexão com o aparelho, quando ele aceita (aparelhos já conectados não anunciam).
// ===== STATUS DO TOQUE =====
// tipo: parada | procurando | boa | fraca | instavel | sem_sinal | perdido
export const STATUS_PARADO = { tipo: 'parada', rssi: null, distancia: '' };

const TEXTOS_STATUS = {
  parada: 'Pronta para tocar',
  procurando: 'Procurando sinal…',
  boa: 'Conectado',
  fraca: 'Sinal fraco',
  instavel: 'Conexão ruim',
  sem_sinal: 'Sem sinal da tag',
  perdido: 'Sinal perdido',
};

export function textoStatus(status) {
  return TEXTOS_STATUS[(status && status.tipo) || 'parada'];
}

// true quando a conexão está com problema (a tela destaca o status).
export function statusRuim(status) {
  return !!status && ['fraca', 'instavel', 'sem_sinal', 'perdido'].includes(status.tipo);
}

// Texto da linha de distância do cartão: só a palavra ("Perto", "Longe"...) enquanto a tag toca.
// Parada, volta ao rótulo "Distância".
export function textoDistancia(status) {
  if (!status || status.tipo === 'parada') return 'Distância';
  if (status.distancia) return status.distancia.charAt(0).toUpperCase() + status.distancia.slice(1);
  if (status.tipo === 'procurando') return 'Medindo…';
  return 'Sem medida';
}

// Para o leitor de tela, a palavra sozinha perde o contexto: lê "Distância: perto".
export function rotuloDistancia(status) {
  if (status && status.tipo !== 'parada' && status.distancia) return `Distância: ${status.distancia}`;
  return textoDistancia(status);
}

// Avalia a qualidade do sinal agora, olhando as leituras recentes da sessão.
function avaliarSinal(s, agora) {
  const temSinal = s.amostras.length > 0 && agora - s.ultima <= SINAL_VALIDO_MS;
  if (!temSinal) {
    if (agora - s.inicio <= AVISO_SEM_SINAL_MS) return { tipo: 'procurando', rssi: null };
    return { tipo: s.jaTeveSinal ? 'perdido' : 'sem_sinal', rssi: null };
  }
  const rssi = s.amostras.reduce((a, b) => a + b, 0) / s.amostras.length;
  const recentes = s.tempos.filter((x) => agora - x <= JANELA_LEITURAS_MS).length;
  if (rssi < RSSI_SINAL_FRACO) return { tipo: 'fraca', rssi };
  if (recentes < LEITURAS_MINIMAS) return { tipo: 'instavel', rssi };
  return { tipo: 'boa', rssi };
}

export function useToque() {
  const [tocandoId, setTocandoId] = useState(null);
  const [status, setStatus] = useState(STATUS_PARADO);
  const sessao = useRef(null);
  const iniciando = useRef(false); // evita duas sessões se a pessoa tocar duas vezes rápido

  const parar = useCallback(() => {
    const s = sessao.current;
    sessao.current = null;
    Vibration.cancel();
    setTocandoId(null);
    setStatus(STATUS_PARADO);
    if (!s) return;
    s.ativo = false;
    clearTimeout(s.timer);
    clearTimeout(s.timerSom);
    clearTimeout(s.limite);
    liberarBeeps();
    clearInterval(s.leitor);
    clearInterval(s.tick);
    try { s.sub && s.sub.remove(); } catch (e) { /* já removido */ }
    try { s.ble.stopDeviceScan(); } catch (e) { /* já parado */ }
    s.ble.cancelDeviceConnection(s.deviceId).catch(() => { /* não estava conectado */ });
  }, []);

  const iniciar = useCallback(async (tag) => {
    if (iniciando.current) return;
    iniciando.current = true;
    try {
    parar();
    let ble;
    try {
      ble = obterGerenciador();
    } catch (e) {
      Alert.alert('Tocar', 'Bluetooth indisponível aqui. Use um build de desenvolvimento (não o Expo Go).');
      return;
    }
    if (!(await pedirPermissoes())) {
      Alert.alert('Tocar', 'Permita o acesso ao Bluetooth para encontrar o aparelho.');
      return;
    }
    if ((await ble.state()) !== 'PoweredOn') {
      Alert.alert('Tocar', 'O Bluetooth está desligado. Ligue para tocar a tag.');
      return;
    }

    const s = {
      ble, deviceId: tag.deviceId, inicio: Date.now(), ativo: true, amostras: [], tempos: [], ultima: 0, jaTeveSinal: false,
      nivelMostrado: '', nivelCandidato: '', contaNivel: 0, alertou: false,
      timer: null, timerSom: null, limite: null, leitor: null, tick: null, sub: null,
    };
    sessao.current = s;
    setTocandoId(tag.id);

    // Guarda as últimas 3 leituras para o ritmo não oscilar a cada anúncio.
    const registrar = (rssi) => {
      const agora = Date.now();
      s.amostras.push(rssi);
      if (s.amostras.length > 3) s.amostras.shift();
      s.ultima = agora;
      s.jaTeveSinal = true;
      s.tempos.push(agora);
      while (s.tempos.length && agora - s.tempos[0] > JANELA_LEITURAS_MS) s.tempos.shift();
    };

    // Fonte 1: anúncios do aparelho.
    ble.startDeviceScan(null, { allowDuplicates: true, scanMode: 2 /* LowLatency */ }, (erro, d) => {
      if (erro) {
        if (sessao.current === s) {
          parar();
          Alert.alert('Tocar', 'Não foi possível medir o sinal. Confira se o Bluetooth e a localização do celular estão ligados.');
        }
        return;
      }
      if (d && d.rssi != null && mesmoId(d.id, s.deviceId)) registrar(d.rssi);
    });

    // Fonte 2: conexão com o aparelho e leitura do sinal da conexão.
    ble.connectToDevice(s.deviceId, { timeout: 5000 })
      .then(() => {
        if (!s.ativo) { ble.cancelDeviceConnection(s.deviceId).catch(() => {}); return; }
        s.leitor = setInterval(async () => {
          try {
            const d = await ble.readRSSIForDevice(s.deviceId);
            if (s.ativo && d && d.rssi != null) registrar(d.rssi);
          } catch (e) { /* a conexão caiu: volta a depender dos anúncios */ }
        }, 400);
      })
      .catch(() => { /* não conectou: segue só com os anúncios */ });

    // Laço da vibração: a cada volta lê o sinal mais recente e decide se vibra e quando vibra de novo.
    const ciclo = () => {
      if (!s.ativo) return;
      if (Date.now() - s.ultima > SINAL_VALIDO_MS || s.amostras.length === 0) {
        s.amostras = [];
        s.timer = setTimeout(ciclo, 500); // sem sinal: não vibra, só continua escutando
        return;
      }
      const rssi = s.amostras.reduce((a, b) => a + b, 0) / s.amostras.length;
      // Respeita o ajuste "VIBRAÇÃO DO RASTREADOR" das Configurações (lido a cada pulso).
      if (obterPreferencias().vibracao) Vibration.vibrate(PULSO_MS);
      s.timer = setTimeout(ciclo, intervaloPorSinal(rssi));
    };
    ciclo();

    // Laço do som: a cada 2 s toca os 3 beeps, com a frequência calculada pelo sinal MAIS RECENTE.
    // Respeita o ajuste "SOM DO RASTREADOR" das Configurações. Sem sinal: fica em silêncio.
    const cicloSom = () => {
      if (!s.ativo) return;
      const temSinal = s.amostras.length > 0 && Date.now() - s.ultima <= SINAL_VALIDO_MS;
      if (!temSinal) {
        s.timerSom = setTimeout(cicloSom, ESPERA_SINAL_MS);
        return;
      }
      if (obterPreferencias().som) {
        const rssi = s.amostras.reduce((a, b) => a + b, 0) / s.amostras.length;
        tocarBeep(nivelBeepPorSinal(rssi));
      }
      s.timerSom = setTimeout(cicloSom, INTERVALO_BEEP_MS);
    };
    cicloSom();
    s.limite = setTimeout(parar, TEMPO_MAXIMO_MS);

    // Se o Bluetooth for desligado durante o toque, para e avisa.
    s.sub = ble.onStateChange((novo) => {
      if (novo !== 'PoweredOn' && sessao.current === s) {
        parar();
        Alert.alert('Tocar', 'O Bluetooth foi desligado. Ligue de novo para tocar a tag.');
      }
    }, false);

    // Reavalia a qualidade do sinal e o texto da distância de tempos em tempos.
    const reavaliar = () => {
      if (!s.ativo) return;
      const agora = Date.now();
      const av = avaliarSinal(s, agora);
      // O texto da distância só muda depois de 2 leituras seguidas iguais (evita piscar na fronteira).
      const nivel = av.rssi == null ? '' : descreverProximidade(av.rssi);
      if (nivel === s.nivelMostrado) {
        s.contaNivel = 0;
      } else {
        if (nivel === s.nivelCandidato) s.contaNivel += 1; else { s.nivelCandidato = nivel; s.contaNivel = 1; }
        if (nivel === '' || s.contaNivel >= 2) { s.nivelMostrado = nivel; s.contaNivel = 0; }
      }
      const rssiInt = av.rssi == null ? null : Math.round(av.rssi);
      setStatus((ant) => (ant.tipo === av.tipo && ant.distancia === s.nivelMostrado && ant.rssi === rssiInt
        ? ant
        : { tipo: av.tipo, rssi: rssiInt, distancia: s.nivelMostrado }));
      // Nunca achou a tag: um aviso (uma vez só). O toque continua tentando.
      if (av.tipo === 'sem_sinal' && !s.alertou && agora - s.inicio > ALERTA_SEM_SINAL_MS) {
        s.alertou = true;
        Alert.alert('Tocar', 'Não encontrei o sinal da tag. Aproxime-a do celular, confira se está ligada e não está conectada a outro celular.');
      }
    };
    reavaliar();
    s.tick = setInterval(reavaliar, ATUALIZAR_STATUS_MS);
    } finally {
      iniciando.current = false;
    }
  }, [parar]);

  const alternar = useCallback((tag) => {
    if (!tag.deviceId) {
      Alert.alert('Tocar', 'Esta tag não está ligada a nenhum aparelho. Remova e adicione de novo pelo botão +.');
      return;
    }
    if (sessao.current && sessao.current.deviceId === tag.deviceId) parar();
    else iniciar(tag);
  }, [iniciar, parar]);

  // Ao sair da tela, para tudo (vibração, busca e conexão).
  useEffect(() => parar, [parar]);

  return { tocandoId, status, alternar, parar };
}