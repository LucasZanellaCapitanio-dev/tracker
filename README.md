# 📍 TRACKER – Rastreador Wireframe

Protótipo de um aplicativo mobile para **localizar objetos pessoais** (mala, chaves, mochila etc.) por meio de **tags rastreadoras Bluetooth**.

O app foi pensado com **foco em acessibilidade** para pessoas com deficiência visual: botões grandes, textos em tamanho elevado, cores de alto contraste e um **assistente por voz** acessível direto da tela inicial.

> ⚠️ **Atenção:** as tags exibidas são dados de exemplo. No Expo Go o Bluetooth real não está disponível, então o app roda em **modo demonstração**. O assistente de IA, porém, é real e usa um servidor próprio (veja [Servidor do assistente](#-servidor-do-assistente)).

---

## ✨ Funcionalidades

- **Tela inicial (Tracker):** carrossel horizontal com as tags cadastradas, mostrando nome, ícone, distância, bateria e status de conexão.
- **Botão TOCAR:** destinado a fazer a tag emitir som para ser encontrada.
- **Detalhes da tag:** botão com ícone de olho que mostra as informações completas, sem abreviações.
- **Adicionar tag:** fluxo em duas etapas (escolher o aparelho e, em seguida, configurar a nova tag).
- **Editar tag:** alteração do nome e do ícone de uma tag já cadastrada.
- **Remover tag:** com tela de confirmação para evitar exclusões acidentais.
- **Assistente por voz:**
  - entende **texto e voz**;
  - responde em texto e **em voz alta** (o botão **VOZ** liga e desliga o áudio);
  - **repete** a última resposta (botão **REPETIR** ou dizendo "repete");
  - **navega entre telas** por pedido, como "quero ir para as configurações".
- **Como usar:** tela com a descrição e as instruções de uso do aplicativo.
- **Configurações:** tela de ajustes do aplicativo.
- **Indicador de páginas:** bolinhas e contador ("1 de 3") para indicar qual tag está sendo exibida.

---

## 📱 Telas

| Tela | Título no app | Descrição |
|------|---------------|-----------|
| Início | TRACKER | Lista de tags, ações de editar, remover e adicionar |
| Como usar | COMO USAR | Instruções de uso |
| Configurações | CONFIGURAÇÕES | Ajustes do app |
| Assistente | ASSISTENTE | Conversa por texto e voz |
| Adicionar tag | ADICIONAR TAG | Escolha do aparelho |
| Nova tag | ADICIONAR TAG | Confirmação e configuração da nova tag |
| Editar tag | EDITAR TAG | Edição de nome e ícone |

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| [React Native](https://reactnative.dev/) | `0.88.0` | Base do aplicativo |
| [React](https://react.dev/) | `19.3.0` | Interface |
| [Expo](https://expo.dev/) | SDK `58` | Execução e ferramentas |
| [@expo/vector-icons](https://docs.expo.dev/guides/icons/) | `^15.0.2` | Ícones (MaterialCommunityIcons) |
| [expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/) | `~58.0.10` | Gravação da voz |
| [expo-speech](https://docs.expo.dev/versions/latest/sdk/speech/) | `~58.0.3` | Voz da resposta do assistente |
| [react-native-safe-area-context](https://github.com/AppAndFlow/react-native-safe-area-context) | `~5.10.1` | Respeitar os botões do celular |
| [react-native-ble-plx](https://github.com/dotintent/react-native-ble-plx) | `^3.5.1` | Bluetooth (só em build próprio) |

---

## 📂 Estrutura do projeto

```text
.
├── App.js                  # Componente raiz: controla a navegação entre telas
├── app.json                # Configurações do Expo (permissão do microfone)
├── package.json            # Dependências e scripts
└── src/
    ├── components/
    │   ├── Navegacao.js    # Cabeçalho e BarraNav (barra inferior)
    │   ├── Cartao.js       # Cartão base reutilizável
    │   └── Botao.js        # Botão reutilizável com variantes
    ├── screens/
    │   ├── TelaInicio.js   # Tela inicial: carrossel de tags, TOCAR e detalhes
    │   ├── DetalhesTag.js  # Janela com as informações completas da tag
    │   ├── Configuracoes.js
    │   ├── Descricao.js
    │   ├── Assistente.js   # Chat por texto e voz (fala, repete e navega)
    │   ├── AdicionarTag.js
    │   ├── NovaTag.js
    │   ├── EditarTag.js
    │   └── ConfirmarRemocao.js
    ├── bluetooth.js        # Varredura BLE (modo demonstração no Expo Go)
    └── theme.js            # Cores, raios de borda e fontes
```

---

## 🤖 Servidor do assistente

O app **não guarda nenhuma chave de IA**. Ele conversa com um servidor separado (repositório `tracker-servidor`, hospedado no Render), que usa a API da Groq para transcrever a voz e gerar a resposta em texto. A resposta é falada pelo próprio celular.

```text
Voz → servidor (Groq) → texto da resposta → celular fala em voz alta
```

- O endereço do servidor fica na constante `API`, em `src/screens/Assistente.js`.
- O servidor gratuito "dorme" depois de alguns minutos parado, então a **primeira pergunta pode demorar cerca de 1 minuto**. Para acordá-lo, abra o endereço dele no navegador antes de usar.

---

## 🚀 Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) **22.13 ou mais novo** e npm instalados.
- Aplicativo **Expo Go** no celular, na mesma versão do SDK do projeto (SDK 58), **ou** um emulador Android/iOS.

### Passo a passo

1. Clone o repositório:

   ```bash
   git clone <url-do-repositorio>
   cd tracker
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o projeto (o `-c` limpa o cache):

   ```bash
   npx expo start -c
   ```

4. Abra o app:
   - **No celular:** escaneie o QR Code exibido no terminal com o Expo Go.
   - **No emulador:** pressione `a` (Android) ou `i` (iOS) no terminal.

> 💡 **Dicas**
>
> - Se o celular não encontrar o computador, use `npx expo start --tunnel`.
> - O módulo `react-native-ble-plx` exige um *development build* e não funciona no Expo Go. Por isso o app usa o **modo demonstração** do Bluetooth.

---

## 🧭 Fluxo de navegação

A navegação é controlada por **estado** no `App.js`, sem biblioteca de rotas.

- A **barra inferior** dá acesso a: Configurações, Início e Como usar.
- As demais telas (Assistente, Adicionar tag, Nova tag e Editar tag) exibem uma **seta de voltar** no cabeçalho.
- O fluxo de adicionar tag segue o caminho: `Início → Adicionar tag → Nova tag → Início`.
- Nas telas de adicionar e editar, o ícone da casa permanece destacado, pois fazem parte do fluxo do Início.
- O **assistente** também pode levar a pessoa a Configurações, Início, Como usar e Adicionar tag por pedido de voz ou texto.

---

## ♿ Acessibilidade

- Botões grandes e com área de toque ampliada.
- Textos grandes e em negrito.
- Cores de alto contraste (amarelo, preto, vermelho e azul).
- Rótulos de acessibilidade (`accessibilityLabel`) nos botões, por exemplo "Tocar a tag chaves".
- Assistente por voz de fácil acesso, com resposta falada e opção de repetir.

---

## 🔧 Ajustes rápidos

| O que ajustar | Onde |
|---------------|------|
| Tamanho do botão TOCAR e do olho | Constantes no topo de `src/screens/TelaInicio.js` |
| Altura da barra de navegação | `EXTRA_EMBAIXO` em `src/components/Navegacao.js` |
| Endereço do servidor da IA | `API` em `src/screens/Assistente.js` |

---

## ⚠️ Limitações atuais

- As tags (`MALA VIAGEM`, `CHAVES`, `MOCHILA`) são **dados de exemplo** fixos no código.
- Distância, bateria e status de conexão ainda são textos ilustrativos.
- Ações de tocar, remover e salvar ainda não têm efeito real.
- O Bluetooth real só funciona em build próprio; no Expo Go usa-se o modo demonstração.
- O servidor do assistente é gratuito e pode demorar na primeira pergunta.

---

## 🔮 Próximos passos

- [x] Reconhecimento de voz e resposta falada do assistente (via servidor).
- [ ] Integrar o Bluetooth (`react-native-ble-plx`) para buscar e conectar às tags.
- [ ] Exibir distância e bateria reais.
- [ ] Implementar o som do botão **TOCAR**.
- [ ] Persistir as tags cadastradas (armazenamento local).
- [ ] Tratar o estado sem tags ("Nenhum equipamento" e botão "Procurar rastreador").

---

## 👤 Autoria

Projeto desenvolvido como atividade acadêmica.

- **Autor(a):** _seu nome aqui_
- **Disciplina/Curso:** _preencha aqui_