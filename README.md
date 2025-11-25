# RenalCare (Protótipo)

Aplicativo React Native (Expo) para auxiliar autocuidado renal — protótipo com telas de indicadores, histórico, integração simulada com wearable e perfil do paciente. Este README descreve como preparar o ambiente e executar o projeto localmente.

> Observação: o código principal está em `App.tsx` (TypeScript React Native). O protótipo usa `expo-image-picker` dinamicamente para analisar fotos na plataforma móvel.

Índice
- Visão geral
- Requisitos
- Instalação
- Executando (desenvolvimento)
  - Expo Go (Android / iOS)
  - Web
- Dependências opcionais
- Como usar (mini tutorial)
- Relatório para consulta
- Problemas comuns / soluções
- Contribuindo

Visão geral
---------
O app é um protótipo para organização do autocuidado renal com:
- Tela inicial com indicadores e gamificação
- Registro de medidas (pressão, peso, exames)
- Histórico filtrável
- Tela de perfil com dados pessoais (nome, idade, estágio, altura e peso) editáveis
- Geração de relatório (texto pronto para impressão)
- Simulação de análise de refeição via seleção de imagem

Requisitos
---------
- Node.js (versão LTS recomendada, ex: >= 18)
- npm (>= 8) ou yarn
- Expo CLI (recomendado) — opcional, serve para rodar no Expo Go e web:
  - Instalar globalmente: `npm install -g expo-cli` ou usar npx (recomendado)
- Para rodar em emuladores:
  - Android: Android Studio + emulador
  - iOS (macOS): Xcode + simulador
- Celular com Expo Go (Android/iOS) para testar rapidamente em dispositivo real

Instalação
---------
1. Clone o repositório:
   ```bash
   git clone https://github.com/VitorSena0/RenalCare.git
   cd RenalCare
   ```

2. Instale dependências:
   - Usando npm:
     ```bash
     npm install
     ```
   - Ou usando yarn:
     ```bash
     yarn install
     ```

3. (Recomendado) Instale a dependência usada para seleção de imagens no celular:
   ```bash
   npx expo install expo-image-picker
   ```
   Observação: o projeto importa `expo-image-picker` dinamicamente apenas em plataformas móveis. Se você não instalar, a funcionalidade de analisar refeição poderá não funcionar em dispositivos nativos.

Executando (desenvolvimento)
---------------------------

Usando Expo (recomendado)
1. Inicie o Metro com Expo:
   ```bash
   npx expo start
   ```
   Isso abre a DevTools no navegador.

2. Testar no celular com Expo Go:
   - Escaneie o QR code com o app Expo Go para Android/iOS e rode o projeto no dispositivo.

3. Testar em emulador Android:
   - No DevTools clique em "Run on Android device/emulator" ou rode:
     ```bash
     npx expo run:android
     ```
   - Para iOS (macOS/Xcode):
     ```bash
     npx expo run:ios
     ```

Executando na Web
----------------
O projeto também pode rodar no navegador (React Native for Web):
```bash
npx expo start --web
```
Algumas funcionalidades dependentes de API nativa (ex.: seleção de imagem no mobile) têm comportamento diferente no navegador — no código há um fluxo específico para web que abre um seletor de arquivo.

Dependências opcionais
---------------------
- expo-image-picker: usado para selecionar imagens da galeria em mobile.
  - Instalar: `npx expo install expo-image-picker`
- Certifique-se de ter as permissões necessárias no dispositivo (aparecerão automaticamente quando a funcionalidade for usada).

Mini tutorial / como usar
-------------------------
- Navegação: barra inferior com abas Início, Registros, Wearable e Perfil.
- Início:
  - Ver indicadores (TFG, Pressão, Peso).
  - Botão + (FAB) para abrir o formulário de novo registro (Pressão, Peso, Exame).
  - Analisar Refeição: abre seletor de imagem (web/mobile).
  - Pergunta (ícone "?") ao lado do indicador: abre sugestões de perguntas para a consulta.
- Registros:
  - Visualize histórico e filtre por tipo (Pressão, Peso, Exames).
  - Botão "Gerar relatório para consulta" cria um texto formatado com dados do paciente e últimos registros.
- Wearable:
  - Simulação de conexão de relógio; botão para conectar/desconectar (simulado).
- Perfil:
  - Clique em "Dados Pessoais" para abrir o modal com informações do paciente.
  - Campos disponíveis: Nome, Idade, Estágio da DRC, Altura (cm) e Peso (kg).
  - Alterações no modal são salvas apenas na memória em estado da aplicação (não persistem após fechar o app a menos que você adicione armazenamento persistente).
- Relatório:
  - Ao gerar o relatório, altura e peso (autorrelato) aparecem no texto.
  - Em web, o app tenta acionar print após abrir o modal de relatório.

Observações técnicas
--------------------
- O código principal está em `App.tsx` (TypeScript / .tsx).
- Dados iniciais estão em memória (mock). Para persistência entre sessões, considere adicionar AsyncStorage ou integrar uma API/backend.
- O fluxo de seleção de imagem usa import dinâmico de `expo-image-picker` para evitar erros na web quando o pacote não existir.
- Se usar TypeScript, verifique se o projeto contém `tsconfig.json` e as definições necessárias. Se o repositório estiver faltando configuração TypeScript, você pode renomear `App.tsx` para `App.js` e ajustar tipos, ou inicializar um projeto Expo com TypeScript template:
  ```bash
  npx create-expo-app --template expo-template-blank-typescript
  ```

Problemas comuns e solução
--------------------------
- Erro ao importar `expo-image-picker`:
  - Rode `npx expo install expo-image-picker`.
  - Reinicie o servidor (`npx expo start -c`) para limpar cache.
- Permissão negada ao selecionar imagens:
  - Em dispositivos Android/iOS, permita acesso à galeria quando o app solicitar.
- Build quebrando por falta de dependência:
  - Verifique `package.json` e instale dependências faltantes com `npm install` ou `yarn`.
- Tela branca / cache:
  - Limpe cache: `npx expo start -c`.


