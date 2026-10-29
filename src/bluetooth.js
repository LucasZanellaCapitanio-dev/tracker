import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, PermissionsAndroid, Platform } from 'react-native';

// Quanto tempo cada busca dura antes de parar sozinha (economiza bateria).
const DURACAO_BUSCA_MS = 15000;

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
  const lista = Platform.Version >= 31 ? [P.BLUETOOTH_SCAN, P.BLUETOOTH_CONNECT] : [P.ACCESS_FINE_LOCATION];
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

// Detecta se o Bluetooth está ligado e, estando, procura dispositivos próximos.
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