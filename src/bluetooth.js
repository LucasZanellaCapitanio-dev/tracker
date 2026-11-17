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
const SINAL_VALIDO_MS = 3000;  // sem nenhuma leitura por esse tempo = "sem sinal" (não vibra)
const TEMPO_MAXIMO_MS = 120000; // o toque para sozinho depois de 2 minutos (economiza bateria)
const INTERVALO_BEEP_MS = 2000; // os 3 beeps tocam de 2 em 2 segundos
const ESPERA_SINAL_MS = 500;    // sem sinal, tenta de novo a cada meio segundo (o beep sai assim que o sinal chega)
// =============================================

// Modo demonstração: usado quando o módulo nativo não existe (Expo Snack / Expo Go).
// Simula a busca com estes dispositivos de exemplo.
const DISPOSITIVOS_DEMO = [
  { id: 'demo-1', nome: 'Tag Chaves', rssi: -48 },
  { id: 'demo-2', nome: 'Tag Mochila', rssi: -67 },
  { id: 'demo-3', nome: 'Fone Bluetooth', rssi: -78 },
  { id: 'demo-4', nome: null, rssi: -90 },
];

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

// Lê os aparelhos JÁ PAREADOS com o celular (Android). O react-native-ble-plx não tem essa
// função, por isso usamos o react-native-ble-manager só para isso.
let bleManagerIniciado = false;
async function listarPareados() {
  const mod = require('react-native-ble-manager');
  const BleManager = mod.default || mod;
  if (!bleManagerIniciado) {
    await BleManager.start({ showAlert: false });
    bleManagerIniciado = true;
  }
  const lista = (await BleManager.getBondedPeripherals()) || [];
  return lista.map((p) => ({
    id: p.id,
    nome: p.name || (p.advertising && p.advertising.localName) || 'Aparelho sem nome',
  }));
}

// Modos da tela "Adicionar tag":
//  pareados  = aparelhos já pareados com o celular (só Android);
//  proximos  = qualquer aparelho Bluetooth LE por perto, pareado ou não (é o que acha as tags).
// No iOS o sistema não revela os pareados, então só existe "proximos".
const MODO_INICIAL = Platform.OS === 'android' ? 'pareados' : 'proximos';

// Traduz o sinal (RSSI, dBm) em uma frase curta, boa para leitor de tela.
// Dá para identificar a tag certa aproximando-a do celular: a frase vai para "muito perto".
export function descreverProximidade(rssi) {
  if (rssi == null) return '';
  if (rssi >= -55) return 'muito perto';
  if (rssi >= -70) return 'perto';
  if (rssi >= -85) return 'longe';
  return 'muito longe';
}

// Atualiza a lista na tela no máximo uma vez por intervalo (os anúncios chegam várias vezes por segundo).
const ATUALIZAR_LISTA_MS = 700;

// Detecta se o Bluetooth está ligado e, estando, lista os aparelhos pareados ou próximos.
export function useDispositivosBluetooth() {
  const [estado, setEstado] = useState('verificando');
  const [procurando, setProcurando] = useState(false);
  const [dispositivos, setDispositivos] = useState([]);
  const [modo, setModo] = useState(MODO_INICIAL);
  const [erroBusca, setErroBusca] = useState(false);
  const [demo, setDemo] = useState(false);
  const modoRef = useRef(MODO_INICIAL);
  const demoRef = useRef(false);
  const timersDemo = useRef([]);
  const ble = useRef(null);
  const mapa = useRef(new Map());
  const timer = useRef(null);
  const atualizacao = useRef(null);

  const parar = useCallback(() => {
    clearTimeout(timer.current);
    clearTimeout(atualizacao.current);
    atualizacao.current = null;
    timersDemo.current.forEach(clearTimeout);
    timersDemo.current = [];
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
    if (demoRef.current) {
      parar();
      setDispositivos([]);
      setProcurando(true);
      DISPOSITIVOS_DEMO.forEach((d, i) => {
        timersDemo.current.push(setTimeout(() => setDispositivos((l) => [...l, d]), 800 * (i + 1)));
      });
      timersDemo.current.push(setTimeout(parar, 800 * (DISPOSITIVOS_DEMO.length + 1)));
      return;
    }
    const m = ble.current;
    if (!m) return;
    if (!(await pedirPermissoes())) { setEstado('sem_permissao'); return; }

    // Android, modo "pareados": mostra os aparelhos que já estão pareados com o celular.
    if (Platform.OS === 'android' && modoRef.current === 'pareados') {
      parar();
      setDispositivos([]);
      setProcurando(true);
      try {
        setDispositivos(await listarPareados());
      } catch (e) {
        setEstado('indisponivel'); // módulo nativo ausente: falta instalar e refazer o build
      } finally {
        setProcurando(false);
      }
      return;
    }

    // Modo "próximos" (Android e iOS): busca os anúncios Bluetooth LE ao redor, pareados ou não.
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

  // Troca entre "pareados" e "próximos" e já refaz a busca.
  const mudarModo = useCallback((novo) => {
    if (novo === modoRef.current) return;
    modoRef.current = novo;
    setModo(novo);
    procurar();
  }, [procurar]);

  // Monta: pede permissão, lê o estado do Bluetooth e acompanha mudanças (ligar/desligar).
  useEffect(() => {
    let ativo = true;
    let sub = null;
    (async () => {
      try {
        ble.current = obterGerenciador();
      } catch (e) {
        // Sem módulo nativo: entra no modo demonstração em vez de quebrar.
        if (ativo) {
          demoRef.current = true;
          setDemo(true);
          setEstado('ligado');
        }
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

  return { estado, procurando, dispositivos, demo, modo, mudarModo, erroBusca, procurar, reverificar, ligar };
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
export function useToque() {
  const [tocandoId, setTocandoId] = useState(null);
  const sessao = useRef(null);

  const parar = useCallback(() => {
    const s = sessao.current;
    sessao.current = null;
    Vibration.cancel();
    setTocandoId(null);
    if (!s) return;
    s.ativo = false;
    clearTimeout(s.timer);
    clearTimeout(s.timerSom);
    clearTimeout(s.limite);
    liberarBeeps();
    clearInterval(s.leitor);
    try { s.ble.stopDeviceScan(); } catch (e) { /* já parado */ }
    s.ble.cancelDeviceConnection(s.deviceId).catch(() => { /* não estava conectado */ });
  }, []);

  const iniciar = useCallback(async (tag) => {
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

    const s = { ble, deviceId: tag.deviceId, ativo: true, amostras: [], ultima: 0, timer: null, timerSom: null, limite: null, leitor: null };
    sessao.current = s;
    setTocandoId(tag.id);

    // Guarda as últimas 3 leituras para o ritmo não oscilar a cada anúncio.
    const registrar = (rssi) => {
      s.amostras.push(rssi);
      if (s.amostras.length > 3) s.amostras.shift();
      s.ultima = Date.now();
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
  }, [parar]);

  const alternar = useCallback((tag) => {
    if (!tag.deviceId) {
      Alert.alert('Tocar', 'Esta tag é só um exemplo e não está ligada a nenhum aparelho. Adicione uma tag com o botão +.');
      return;
    }
    if (sessao.current && sessao.current.deviceId === tag.deviceId) parar();
    else iniciar(tag);
  }, [iniciar, parar]);

  // Ao sair da tela, para tudo (vibração, busca e conexão).
  useEffect(() => parar, [parar]);

  return { tocandoId, alternar, parar };
}