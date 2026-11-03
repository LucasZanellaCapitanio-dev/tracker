import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, PermissionsAndroid, Platform, Vibration } from 'react-native';

// Quanto tempo cada busca dura antes de parar sozinha (economiza bateria). Só usado no iOS.
const DURACAO_BUSCA_MS = 15000;

// ===== AJUSTE DA VIBRAÇÃO DO BOTÃO TOCAR =====
const RSSI_FORTE = -45;        // sinal a partir daqui (dBm) = vibra no ritmo mais rápido
const RSSI_FRACO = -100;       // sinal neste valor (dBm) ou pior = vibra no ritmo mais lento
const INTERVALO_RAPIDO_MS = 250;  // sinal forte: uma vibração a cada 1/4 de segundo
const INTERVALO_LENTO_MS = 2000;  // sinal fraco: uma vibração a cada 2 segundos
const PULSO_MS = 100;          // duração de cada vibração (no iOS o sistema usa duração fixa)
const SINAL_VALIDO_MS = 3000;  // sem nenhuma leitura por esse tempo = "sem sinal" (não vibra)
const TEMPO_MAXIMO_MS = 120000; // o toque para sozinho depois de 2 minutos (economiza bateria)
// =============================================

// Modo demonstração: usado quando o módulo nativo não existe (Expo Snack / Expo Go).
// Simula a busca com estes dispositivos de exemplo.
const DISPOSITIVOS_DEMO = [
  { id: 'demo-1', nome: 'Tag Chaves' },
  { id: 'demo-2', nome: 'Tag Mochila' },
  { id: 'demo-3', nome: 'Fone Bluetooth' },
  { id: 'demo-4', nome: 'Caixa de Som' },
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
  if (Platform.OS !== 'android') return true; // no iOS o sistema pergunta sozinho
  const P = PermissionsAndroid.PERMISSIONS;
  // Android 12+: SCAN + CONNECT (CONNECT também é necessário para ler a lista de pareados).
  // A localização continua na lista porque o Android só entrega os resultados da busca sem ela
  // quando o manifesto declara "neverForLocation".
  const lista = Platform.Version >= 31 ? [P.BLUETOOTH_SCAN, P.BLUETOOTH_CONNECT, P.ACCESS_FINE_LOCATION] : [P.ACCESS_FINE_LOCATION];
  const r = await PermissionsAndroid.requestMultiple(lista);
  return lista.every((p) => r[p] === PermissionsAndroid.RESULTS.GRANTED);
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

// Detecta se o Bluetooth está ligado e, estando, lista os aparelhos pareados.
export function useDispositivosBluetooth() {
  const [estado, setEstado] = useState('verificando');
  const [procurando, setProcurando] = useState(false);
  const [dispositivos, setDispositivos] = useState([]);
  const [demo, setDemo] = useState(false);
  const demoRef = useRef(false);
  const timersDemo = useRef([]);
  const ble = useRef(null);
  const mapa = useRef(new Map());
  const timer = useRef(null);

  const parar = useCallback(() => {
    clearTimeout(timer.current);
    timersDemo.current.forEach(clearTimeout);
    timersDemo.current = [];
    try { ble.current && ble.current.stopDeviceScan(); } catch (e) { /* o scan pode já estar parado; pode ignorar */ }
    setProcurando(false);
  }, []);

  const procurar = useCallback(async () => {
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

    // Android: mostra os aparelhos que já estão pareados com o celular.
    if (Platform.OS === 'android') {
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

    // iOS: o sistema não revela os aparelhos pareados, então continua a busca por anúncios.
    m.stopDeviceScan();
    clearTimeout(timer.current);
    mapa.current.clear();
    setDispositivos([]);
    setProcurando(true);
    m.startDeviceScan(null, { allowDuplicates: false }, (erro, d) => {
      if (erro) { parar(); return; }
      const nome = d && (d.name || d.localName);
      if (!nome || mapa.current.has(d.id)) return; // ignora anônimos e repetidos
      mapa.current.set(d.id, { id: d.id, nome });
      // Mantém a ordem de chegada: a lista não "pula" enquanto a pessoa navega com leitor de tela.
      setDispositivos([...mapa.current.values()]);
    });
    timer.current = setTimeout(parar, DURACAO_BUSCA_MS);
  }, [parar]);

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

  return { estado, procurando, dispositivos, demo, procurar, reverificar, ligar };
}

// Converte a força do sinal (RSSI, em dBm) no tempo entre vibrações:
// sinal forte -> INTERVALO_RAPIDO_MS; sinal fraco -> INTERVALO_LENTO_MS (proporcional entre os dois).
export function intervaloPorSinal(rssi) {
  const t = Math.min(1, Math.max(0, (RSSI_FORTE - rssi) / (RSSI_FORTE - RSSI_FRACO)));
  return Math.round(INTERVALO_RAPIDO_MS + t * (INTERVALO_LENTO_MS - INTERVALO_RAPIDO_MS));
}

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
    clearTimeout(s.limite);
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

    const s = { ble, deviceId: tag.deviceId, ativo: true, amostras: [], ultima: 0, timer: null, limite: null, leitor: null };
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
      Vibration.vibrate(PULSO_MS);
      s.timer = setTimeout(ciclo, intervaloPorSinal(rssi));
    };
    ciclo();
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