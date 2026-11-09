
import React from 'react';
import NovaTag from './NovaTag';

export default function EditarTag({ tag, onSalvar }) {
  return (
    <NovaTag
      key={tag.id}
      aparelho={tag.nome || 'Editar tag'}
      nomeInicial={tag.nome}
      icone={tag.icone}
      textoBotao="SALVAR ALTERAÇÕES"
      onConfirmar={(dados) => {
        if (!dados || !dados.nome.trim()) {
          return;
        }

        onSalvar(dados);
      }}
    />
  );
}
