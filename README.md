# TRACKER – Rastreador Wireframe

Protótipo de um aplicativo mobile para **localizar objetos pessoais** (mala, chaves, mochila etc.) por meio de **tags rastreadoras Bluetooth**.

O app foi pensado com **foco em acessibilidade** para pessoas com deficiência visual: botões grandes, textos em tamanho elevado, cores de alto contraste e um **assistente por voz** acessível direto da tela inicial.

>  **Atenção:** as tags exibidas são dados de exemplo. No Expo Go o Bluetooth real não está disponível, então o app roda em **modo demonstração**. O assistente de IA, porém, é real e usa um servidor próprio (veja [Servidor do assistente](#-servidor-do-assistente)).


##### Glossário!!!!

| Termo | Significado |
|-------|-------------|
| **Tag rastreadora** | Aparelho pequeno com Bluetooth, preso ou guardado em um objeto para ajudar a achá-lo |
| **Bluetooth (BLE)** | Tecnologia sem fio de curto alcance e baixo consumo de bateria, usada para falar com a tag |
| **Pareamento** | Ligação entre o celular e a tag, feita ao adicionar a tag |
| **TOCAR** | Botão que faz a tag emitir som |
| **Assistente** | Chat por voz e texto que responde dúvidas e leva você a outras telas |
| **Expo Go** | Aplicativo para testar o projeto no celular sem instalar um build próprio |
| **Development build** | Versão do app instalada no celular, com módulos nativos como o Bluetooth |
| **Modo demonstração** | Funcionamento com dados de exemplo, usado quando o Bluetooth real não está disponível |
| **Servidor do assistente** | Programa separado que recebe a pergunta, consulta a IA e devolve a resposta |
| **TalkBack / VoiceOver** | Leitores de tela do Android e do iPhone |

---

## Funcionalidades

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

## Telas

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

## Tecnologias

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

## Estrutura do projeto

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

## Servidor do assistente

O app **não guarda nenhuma chave de IA**. Ele conversa com um servidor separado (repositório `tracker-servidor`, hospedado no Render), que usa a API da Groq para transcrever a voz e gerar a resposta em texto. A resposta é falada pelo próprio celular.

```text
Voz → servidor (Groq) → texto da resposta → celular fala em voz alta
```

- O endereço do servidor fica na constante `API`, em `src/screens/Assistente.js`.
- O servidor gratuito "dorme" depois de alguns minutos parado, então a **primeira pergunta pode demorar cerca de 1 minuto**. Para acordá-lo, abra o endereço dele no navegador antes de usar.

---

## Como executar

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

>  **Dicas**
>
> - Se o celular não encontrar o computador, use `npx expo start --tunnel`.
> - O módulo `react-native-ble-plx` exige um *development build* e não funciona no Expo Go. Por isso o app usa o **modo demonstração** do Bluetooth.

---

## Fluxo de navegação

A navegação é controlada por **estado** no `App.js`, sem biblioteca de rotas.

- A **barra inferior** dá acesso a: Configurações, Início e Como usar.
- As demais telas (Assistente, Adicionar tag, Nova tag e Editar tag) exibem uma **seta de voltar** no cabeçalho.
- O fluxo de adicionar tag segue o caminho: `Início → Adicionar tag → Nova tag → Início`.
- Nas telas de adicionar e editar, o ícone da casa permanece destacado, pois fazem parte do fluxo do Início.
- O **assistente** também pode levar a pessoa a Configurações, Início, Como usar e Adicionar tag por pedido de voz ou texto.

---

## Acessibilidade

- Botões grandes e com área de toque ampliada.
- Textos grandes e em negrito.
- Cores de alto contraste (amarelo, preto, vermelho e azul).
- Rótulos de acessibilidade (`accessibilityLabel`) nos botões, por exemplo "Tocar a tag chaves".
- Assistente por voz de fácil acesso, com resposta falada e opção de repetir.

---

## Ajustes rápidos

| O que ajustar | Onde |
|---------------|------|
| Tamanho do botão TOCAR e do olho | Constantes no topo de `src/screens/TelaInicio.js` |
| Altura da barra de navegação | `EXTRA_EMBAIXO` em `src/components/Navegacao.js` |
| Endereço do servidor da IA | `API` em `src/screens/Assistente.js` |

---

## Limitações atuais

- As tags (`MALA VIAGEM`, `CHAVES`, `MOCHILA`) são **dados de exemplo** fixos no código.
- Distância, bateria e status de conexão ainda são textos ilustrativos.
- Ações de tocar, remover e salvar ainda não têm efeito real.
- O Bluetooth real só funciona em build próprio; no Expo Go usa-se o modo demonstração.
- O servidor do assistente é gratuito e pode demorar na primeira pergunta.

---

## Próximos passos

- [x] Reconhecimento de voz e resposta falada do assistente (via servidor).
- [ ] Integrar o Bluetooth (`react-native-ble-plx`) para buscar e conectar às tags.
- [ ] Exibir distância e bateria reais.
- [ ] Implementar o som do botão **TOCAR**.
- [ ] Persistir as tags cadastradas (armazenamento local).
- [ ] Tratar o estado sem tags ("Nenhum equipamento" e botão "Procurar rastreador").

---

## Histórico de desenvolvimento

O projeto foi construído ao longo de cinco períodos:

| Período | O que foi feito |
|---------|-----------------|
| **1º** | Definição do tema e inicialização do wireframe. |
| **2º** | Uso de comando de terminal para garantir que todos usem as mesmas versões do Expo; inserção da primeira versão da IA no app; retrocesso do app. |
| **3º** | Ajustes do layout e do wireframe; acessibilidade na parte estética; início de algumas funções, principalmente a parte do Bluetooth; criação do README. |
| **4º** | Configurações do assistente ajustadas; correção da IA e melhoria das suas funções. |
| **5º** | Mais atualizações do app, como ajuste no Bluetooth; novas funcionalidades no app em geral; correção de erros gerais. |

---

## Status do projeto

🚧 **Protótipo acadêmico em desenvolvimento** (versão `1.0.0`).

| Item | Situação |
|------|----------|
| Interface e navegação | ✅ Funcionando |
| Assistente por texto e voz | ✅ Funcionando (precisa de internet) |
| Cadastro de tags na sessão atual | ✅ Funcionando |
| Bluetooth real | 🔧 Em desenvolvimento (só em build próprio) |
| Som do botão TOCAR | 🔧 Em desenvolvimento |
| Salvar tags no celular | ⏳ Planejado |

> Por ser um protótipo, **não use o aplicativo como único meio** de localizar objetos importantes.

## Guia rápido para o usuário

1. **Abra o aplicativo.** Você chega à tela **TRACKER**, onde ficam as suas tags.
2. **Passe de uma tag para outra** deslizando o carrossel. O contador (por exemplo, "1 de 3") mostra qual tag está na tela.
3. **Para achar um objeto**, escolha a tag dele e aperte **TOCAR**. Siga o som e acompanhe a distância.
4. **Para ver tudo sobre a tag**, aperte o botão com o **ícone de olho**: nome, distância, bateria e conexão, sem abreviações.
5. **Para cadastrar um objeto novo**, aperte adicionar, escolha o aparelho, dê um nome e escolha um ícone.
6. **Ficou com dúvida?** Abra o **Assistente** e fale ou escreva. Ele responde em voz alta, repete quando você pedir e leva você a outras telas.
7. **Quer rever as instruções?** Use **COMO USAR** na barra de baixo.

## Dicas para usar com leitor de tela

Os botões do aplicativo têm rótulos de acessibilidade (por exemplo, "Tocar a tag chaves"), então funcionam com o leitor de tela do celular.

- **Android:** ative o **TalkBack** em *Configurações > Acessibilidade*.
- **iPhone:** ative o **VoiceOver** em *Ajustes > Acessibilidade*.
- Com o leitor ligado, **toque uma vez** para ouvir o botão e **toque duas vezes** para ativá-lo.
- O assistente fala as próprias respostas. Se o leitor de tela e a voz do assistente falarem ao mesmo tempo, desligue a voz do assistente no botão **VOZ**.
- Para letras ainda maiores, ajuste o tamanho da fonte nas configurações de acessibilidade do celular.

## Permissões do aplicativo

Declaradas no `app.json`.

| Permissão | Plataforma | Para que serve |
|-----------|------------|----------------|
| Microfone | Android e iOS | Gravar a sua voz para conversar com o assistente |
| `BLUETOOTH`, `BLUETOOTH_ADMIN`, `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT` | Android | Encontrar, conectar e tocar as tags |
| `ACCESS_FINE_LOCATION` | Android | Exigida pelo Android para a varredura Bluetooth; o app não usa a sua localização para outro fim |
| `VIBRATE` | Android | Respostas por vibração |
| Bluetooth sempre ativo (`bluetoothAlwaysPermission`) | iOS | Encontrar e tocar os seus rastreadores |

Se você negar uma permissão sem querer, ative-a de novo nas configurações do celular, na página do aplicativo.

## Privacidade e dados

- O aplicativo **não guarda nenhuma chave de IA**; ela fica somente no servidor.
- No **assistente**, a sua voz ou texto é enviado ao servidor do projeto (`tracker-servidor`), que usa a API da Groq para transcrever e responder. Evite falar dados pessoais sensíveis.
- O **Bluetooth** é usado só para falar com as tags e funciona sem internet.
- As **tags cadastradas ainda não são salvas** no celular: ao fechar o app, a lista volta aos dados de exemplo.
- O aplicativo **não exige login nem cadastro**.
- A localização é pedida apenas porque o Android exige essa permissão para procurar aparelhos Bluetooth.

## Compatibilidade

| Item | Situação |
|------|----------|
| Android com Expo Go | Funciona em modo demonstração |
| Android com build próprio | Bluetooth real (em teste) |
| iOS com Expo Go | Funciona em modo demonstração |
| iOS com build próprio | Exige conta de desenvolvedor da Apple |
| Emuladores | Interface e assistente funcionam; o Bluetooth real normalmente não |
| Leitores de tela (TalkBack e VoiceOver) | Suportados por meio dos rótulos de acessibilidade |
| Orientação | Somente retrato |
| Tags | Aparelhos com Bluetooth de baixo consumo (BLE) |

---


###### SOBRE O APLICATIVO!!!!

## O que é o Tracker?

O Tracker é um aplicativo de celular que ajuda você a encontrar seus objetos pessoais, como mala, chaves e mochila. Ele funciona junto com tags rastreadoras Bluetooth, pequenos aparelhos que ficam presos aos seus objetos. É um protótipo feito como atividade acadêmica.

## Para que serve este aplicativo?

Serve para localizar objetos perdidos. Você cadastra uma tag para cada objeto e, quando precisar achá-lo, usa o aplicativo para fazer a tag tocar e para ver informações sobre ela.

## O que eu consigo fazer aqui?

Ver suas tags em um carrossel, com nome, ícone, distância, bateria e status de conexão.
Usar o botão TOCAR para a tag emitir som.
Ver os detalhes completos de uma tag pelo botão com ícone de olho.
Adicionar, editar e remover tags.
Conversar com o assistente por voz ou texto, ouvir as respostas e pedir para ele levar você a outras telas.
Consultar a tela "Como usar" e a tela de "Configurações".

## O aplicativo funciona para pessoas cegas ou com baixa visão?

Sim, ele foi pensado para isso. Tem botões grandes, textos grandes e em negrito, cores de alto contraste (amarelo, preto, vermelho e azul), rótulos de acessibilidade nos botões, como "Tocar a tag chaves", e um assistente que entende voz e responde falando.

## Preciso de internet para usar?

Depende do que você quer fazer. O assistente precisa de internet, porque ele conversa com um servidor que transcreve a sua voz e gera a resposta. O Bluetooth, usado para falar com as tags, não depende de internet.

## O aplicativo é gratuito?

Este é um projeto acadêmico e não há cobrança prevista no código. O servidor do assistente usa uma hospedagem gratuita, e por isso a primeira pergunta pode demorar.

---

###### SOBRE AS TAGS!!!!

## O que é uma tag rastreadora?

É um aparelho pequeno com Bluetooth que você prende ou guarda dentro de um objeto, como chaves, mala ou mochila. O aplicativo se comunica com ela para mostrar a que distância está e para fazê-la tocar.

## Como eu uso a tag?

Prenda a tag ao objeto.
Cadastre a tag no aplicativo (tela Adicionar tag).
Quando precisar do objeto, abra a tela inicial, escolha a tag dele e toque em TOCAR.

## Como faço para encontrar minhas chaves?

Abra a tela inicial e passe pelas tags até chegar à tag das chaves. Aperte o botão TOCAR e siga o som. A distância mostrada na tag também ajuda a saber se você está chegando perto. Se preferir, peça ao assistente para levar você à tela inicial.

## O que o botão TOCAR faz?

Ele serve para fazer a tag emitir som, para que você a encontre pelo barulho. Nesta versão de demonstração o som ainda não está completo. O aplicativo já guarda o aparelho pareado de cada tag e usa isso para medir o sinal.

## O que significa o botão com o ícone de olho?

Ele abre uma janela com as informações completas da tag, sem abreviações: nome, distância, bateria e status de conexão.

## Como eu sei se a tag está conectada?

O status de conexão aparece no cartão da tag, na tela inicial, e também na janela de detalhes (botão do olho).

## O que significa a distância que aparece na tag?

É a distância aproximada entre o seu celular e a tag. Ela serve de guia: quanto menor o número, mais perto você está do objeto. Nesta versão de demonstração, o valor ainda é ilustrativo.

## Como eu vejo a bateria da minha tag?

A bateria aparece no cartão da tag e na janela de detalhes (botão do olho). Nesta versão, o valor é um texto ilustrativo.

## Como passo para a próxima tag?

Deslize o carrossel para o lado. As bolinhas e o contador (por exemplo, "1 de 3") mostram qual tag está na tela e quantas existem.

## Quantas tags eu posso cadastrar?

O aplicativo não define um limite fixo. Você pode adicionar uma tag para cada objeto. Nesta versão, as tags cadastradas não ficam salvas ao fechar o aplicativo.

---

##### BLUETOOTH!!!!

### Adicionar, editar e remover!

## Como adiciono uma nova tag?

Na tela inicial, toque em adicionar (ou peça ao assistente: "quero adicionar uma nova tag").
Na tela Adicionar tag, escolha o aparelho encontrado.
Na tela Nova tag, defina o nome e o ícone e confirme.
Você volta para a tela inicial, e a nova tag aparece no carrossel.

## Como coloco a tag na minha mochila?

Fisicamente, guarde a tag dentro da mochila ou prenda-a em um bolso ou zíper. No aplicativo, adicione a tag e dê a ela o nome "mochila", escolhendo um ícone que combine. Assim você a reconhece no carrossel.

## Como mudo o nome de uma tag?

Na tela inicial, escolha a tag e use a opção de editar. Na tela Editar tag, altere o nome e salve.

## Como troco o ícone da tag?

É no mesmo lugar: na tela Editar tag, escolha outro ícone e salve.

## Como removo uma tag?

Na tela inicial, escolha a tag e use a opção de remover. O aplicativo mostra uma tela de confirmação, para evitar exclusões acidentais.

## Eu removi uma tag sem querer. E agora?

Adicione a tag novamente pelo fluxo de Adicionar tag, com o mesmo nome e ícone. A tag física não é afetada e continua funcionando.

## Posso usar a mesma tag em outro objeto?

Sim. Mude o nome e o ícone da tag para o novo objeto (ou remova e cadastre de novo) e passe a tag física para o novo objeto.

### Bluetooth e bateria!

## Por que o Bluetooth é necessário?

É por Bluetooth que o celular encontra as tags, mede o sinal (a distância aproximada) e manda a tag tocar. Sem ele, o aplicativo não consegue falar com as tags. O app pede permissão de Bluetooth na primeira vez que você o usa.

## Por que a tag não aparece na busca?

Confira se o Bluetooth do celular está ligado e se o aplicativo tem permissão de Bluetooth (no Android, também a de localização).
Aproxime a tag do celular.
Verifique se a bateria da tag não acabou.
Lembre que no Expo Go o Bluetooth real não funciona: o aplicativo roda em modo demonstração, com tags de exemplo.

## A tag perdeu a conexão. O que eu faço?

Aproxime-se da tag, confira se o Bluetooth está ligado e abra a janela de detalhes (ícone de olho) para ver o status. Se continuar sem conexão, verifique a bateria da tag.

## Qual é o alcance da tag?

Depende do modelo da tag e do ambiente. Paredes e objetos grandes reduzem o alcance, e espaços abertos aumentam. O aplicativo mostra a distância aproximada, e você deve se aproximar da tag para o sinal melhorar.

## Quando devo trocar a bateria da tag?

Quando a bateria mostrada no aplicativo estiver baixa, ou quando a tag começar a perder conexão com frequência estando perto. Siga as instruções do fabricante da tag para a troca.

### Como testar o Bluetooth real!

O Expo Go não carrega módulos nativos como o `react-native-ble-plx`. Para testar com tags de verdade, use um *development build*.

### Pré-requisitos

- Celular **Android** com depuração USB ativada.
- Android Studio instalado (SDK e `adb`).
- Uma tag Bluetooth de teste.

### Passo a passo

1. Instale o cliente de desenvolvimento:

   ```bash
   npx expo install expo-dev-client
   ```

2. Gere e instale o app no celular conectado por USB:

   ```bash
   npx expo run:android
   ```

3. Quando o app abrir, conceda as permissões de **Bluetooth** e **localização**.
4. Nas próximas vezes, basta rodar:

   ```bash
   npx expo start --dev-client
   ```

> Alternativa sem Android Studio: o **EAS Build** (`eas build --profile development --platform android`).

---

##### VOZ E ACESSIBILIDADE!!!!

## Como eu ligo ou desligo a voz do assistente?

Na tela do Assistente, use o botão VOZ. Ele liga e desliga a resposta falada. As respostas continuam aparecendo em texto.

## Como eu faço o assistente repetir a resposta?

Aperte o botão REPETIR ou diga (ou escreva) "repete".

## Como eu falo com o assistente?

Abra o Assistente pela tela inicial. Você pode digitar ou gravar sua voz com o botão do microfone. O assistente responde em texto e fala a resposta em voz alta. Na primeira vez, o aplicativo pede permissão para usar o microfone.

## Por que o assistente não está me ouvindo?

Confira se você permitiu o uso do microfone nas configurações do celular.
Fale perto do aparelho e em um lugar silencioso.
Verifique se há internet, pois a voz é transcrita em um servidor.
Se não funcionar, escreva a mensagem em texto.

## Como aumento o tamanho das letras?

O aplicativo já usa letras grandes e em negrito. Para aumentar ainda mais, ajuste o tamanho da fonte nas configurações de acessibilidade do celular.

## O aplicativo lê a tela em voz alta?

O aplicativo não tem um leitor de tela próprio, mas os botões têm rótulos de acessibilidade (por exemplo, "Tocar a tag chaves"). Por isso funciona com os leitores do celular, o TalkBack no Android e o VoiceOver no iPhone. O assistente também fala as próprias respostas em voz alta.

### Navegar pelo app (pedidos)!

## Quero ir para as configurações.

O assistente leva você para a tela de Configurações.

## Abrir a tela inicial.

O assistente leva você para a tela inicial (Tracker), com o carrossel de tags.

## Me leve para "Como usar".

O assistente abre a tela Como usar, com a descrição e as instruções do aplicativo.

## Quero adicionar uma nova tag.

O assistente abre a tela Adicionar tag, onde você escolhe o aparelho e depois configura a tag.

## Voltar.

Use a seta de voltar no canto do cabeçalho, que aparece nas telas Assistente, Adicionar tag, Nova tag e Editar tag. Você também pode pedir ao assistente para ir à tela inicial.

## Quero que toque a tag do (OBJETO X).

O assistente leva você até a tela inicial. Lá, escolha a tag do objeto pedido (por exemplo, chaves) e aperte o botão TOCAR.

---

##### REPETIR RESPOSTA E PROBLEMAS COMUNS!!!!

### Repetir a resposta!

# Repete.

O assistente repete a última resposta. O botão REPETIR faz o mesmo.

# Pode repetir, por favor?

Claro. O assistente repete a última resposta, em texto e em voz alta (se o botão VOZ estiver ligado).

# Não entendi.

Sem problema. O assistente repete a última resposta, e você pode pedir também uma explicação mais simples ou mais curta.

# De novo.

O assistente repete a última resposta. Se quiser, peça "mais devagar" ou "com outras palavras".

### Problemas comuns! 

## O assistente demora para responder. Por quê?

O servidor do assistente é gratuito e "dorme" depois de alguns minutos sem uso. Por isso, a primeira pergunta pode demorar cerca de 1 minuto. Depois que ele acorda, as respostas ficam mais rápidas. Para acordá-lo antes, abra o endereço do servidor no navegador.

## Deu erro ao gravar minha voz.

Permita o uso do microfone para o aplicativo nas configurações do celular.
Feche outros aplicativos que estejam usando o microfone.
Tente gravar de novo.
Se continuar o erro, digite a mensagem.

## Não ouço a resposta do assistente.

Confira se o botão VOZ está ligado.
Aumente o volume do celular e tire o modo silencioso.
Se não funcionar, leia a resposta em texto na tela ou use o botão REPETIR.

## A tag não toca. O que eu faço?

Confira se o Bluetooth do celular está ligado e se o aplicativo tem permissão.
Aproxime-se da tag e veja se ela está conectada (ícone de olho).
Verifique a bateria da tag.
Lembre que o som do botão TOCAR ainda está em desenvolvimento, e que o Bluetooth real só funciona em build próprio, não no Expo Go.

## O aplicativo travou. O que eu faço?

Feche o aplicativo e abra de novo. Se estiver testando com o Expo Go, reinicie com npx expo start -c. As tags cadastradas ainda não são salvas, então depois de reiniciar o app volta às tags de exemplo.

---
---
---

## Autoria

Projeto desenvolvido como atividade acadêmica.

- **Autor(a):** Bernardo José de Mello Azevedo, Lucas Zanella Capitanio, Amanda Gabrieli Ferrão, Lorenzo Scandolara dos Santos, Luane Rafaela Mirando de Souza, Juan Luca da Rosa Schacker, Nicolas André Levinski Rios, Marcos Virgilio da Costa, Lara Popov, Paulo José Furtado, Jackson Dantas.

- **Instituição:** Instituto Federal de Santa Catarina, Campus Chapecó.

- **Ano/Semestre:** Sétimo Semestre do Curso Técnico em Desenvolvimento de Sistemas Integrado com o Ensino Médio.

- **Disciplina/Curso:** Tópicos especias, programação e Oficina de integração.