import React from 'react';
import NovaTag from './NovaTag';

// Mesma tela de "Adicionar tag" (nome, ícone e botão), já preenchida com a tag escolhida.
// O título "EDITAR TAG" fica no cabeçalho (App.js).
export default function EditarTag({ tag, onSalvar }) {
  return (
    <NovaTag
      aparelho="aparelho 1"
      nomeInicial={tag.nome}
      icone={tag.icone}
      textoBotao="SALVAR"
      onConfirmar={onSalvar}
    />
  );
}
