import { useSyncExternalStore } from 'react';

// Preferências do app, compartilhadas entre as telas (Configurações, TOCAR etc.).
// Ficam em memória: sobrevivem à troca de telas, mas voltam ao padrão quando o app fecha.
// (Para guardar de verdade, dá para trocar por AsyncStorage mais tarde sem mexer nas telas.)
const padrao = {
  leitura: true,    // LEITURA POR VOZ
  resposta: false,  // RESPOSTA POR ÁUDIO
  vibracao: true,   // VIBRAÇÃO ao tocar a tag
  som: true,        // SOM do rastreador
};

let valores = { ...padrao };
const ouvintes = new Set();

export function obterPreferencias() {
  return valores;
}

export function definirPreferencia(chave, valor) {
  if (!(chave in padrao) || valores[chave] === valor) return;
  valores = { ...valores, [chave]: valor }; // objeto novo para o React perceber a mudança
  ouvintes.forEach((f) => f());
}

function assinar(f) {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
}

// Hook: a tela re-renderiza sozinha quando qualquer preferência muda.
export function usePreferencias() {
  return useSyncExternalStore(assinar, obterPreferencias, obterPreferencias);
}
