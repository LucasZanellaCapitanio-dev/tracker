import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, PermissionsAndroid, Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';

// Quanto tempo cada busca dura antes de parar sozinha (economiza bateria).
const DURACAO_BUSCA_MS = 15000;

// Estados que a tela precisa tratar.
//  verificando | ligado | desligado | sem_permissao | indisponivel
let gerenciador = null;
function obterGerenciador() {
  if (!gerenciador) gerenciador = new BleManager();
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
  const ble = useRef(null);
  const mapa = useRef(new Map());
  const timer = useRef(null);

  const parar = useCallback(() => {
    clearTimeout(timer.current);
    try { ble.current && ble.current.stopDeviceScan(); } catch (e) {}
    setProcurando(false);
  }, []);

  const procurar = useCallback(async () => {
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

  return { estado, procurando, dispositivos, procurar, reverificar, ligar };
}