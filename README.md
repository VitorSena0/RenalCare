# RenalCare – Protótipo de App de Autocuidado Renal

RenalCare é um protótipo de aplicativo **mobile** (React Native + Expo) para ajudar pacientes com Doença Renal Crônica (DRC) a:

- Registrar pressão arterial, peso e exames simples.
- Acompanhar metas semanais de autocuidado.
- Analisar refeições (simulação) a partir de foto/arquivo.
- Ver indicadores com tendência (mini gráficos).
- Gerar um **relatório impresso** para levar ao médico.

Este repositório contém apenas o front-end em React Native, pensado para rodar com Expo (inclusive na Web, em modo de desenvolvimento).

---

## Tecnologias

- **React Native** (via Expo)
- **TypeScript**
- **Expo** (SDK padrão do `create-expo-app`)
- **Expo Image Picker** (apenas em ambiente nativo; na Web usamos `input type="file"` como fallback)
- Sem bibliotecas externas de gráfico — usamos um “mini gráfico” de barras com `View`.

---

## Funcionalidades principais

### 1. Tela Início (Home)

- Card de medicamento com próxima dose (ex: “Losartana 50mg às 14:00”).
- Card “Analisar Refeição”:
  - No **mobile (Expo)**: abre a galeria via `expo-image-picker`.
  - No **Web**: abre um seletor de arquivo padrão do navegador.
  - Exibe um modal com a imagem selecionada e um **texto de análise simulada** (orientações gerais).
- Card “Desafio da Semana”:
  - Mostra pontuação semanal.
  - Barra de progresso (% de metas cumpridas).
  - Metas:
    - Registrar pressão 5x na semana.
    - Controlar sódio 4 dias.
    - Registrar peso 3x na semana.

### 2. Tela Registros (Histórico)

- Lista de tudo que o paciente cadastrou:
  - Pressão arterial.
  - Peso corporal.
  - Exames (ex: TFG).
- Filtros por tipo:
  - Todos, Pressão, Peso, Exames.
- Cada item mostra:
  - Ícone (PA, KG, EX).
  - Nome, data/hora, valor.
  - “Pílula” de status (Ok / Atenção / Alerta).

#### Botão “Gerar relatório para consulta”

- Gera um **relatório em texto** com:
  - Dados do paciente (nome, idade, estágio da DRC).
  - Indicadores atuais (TFG, pressão, peso).
  - Resumo de registros (quantos de cada tipo).
  - Últimas medidas de pressão, peso e exames.
  - Espaço para assinatura do paciente e data.
- Abre em um **modal de texto**.
- Se estiver no **Web**, dispara `window.print()` para que o paciente possa:
  - Imprimir direto, ou
  - Salvar como PDF e levar ao médico.

### 3. Tela Wearable

- Simula conexão com relógio inteligente:
  - Estado Online / Offline.
  - Botão “Procurar dispositivos” / “Desconectar”.
- Descreve benefícios da integração (simulada) e ressalta que é apenas protótipo.

### 4. Tela Perfil

- Mostra avatar com iniciais, nome, idade, estágio da DRC.
- Acessos a:
  - “Dados Pessoais”.
  - “Medicamentos em uso”.
- Texto explicativo reforçando que o app não substitui o médico.
- Botão “Sair da Conta” (simulado).

### 5. Registro de novos dados (FAB “+”)

- Botão flutuante “+” visível em todas as telas.
- Abre modal “Novo Registro” com 3 tipos:
  - Pressão (sistólica/diastólica).
  - Peso (kg).
  - Exame (nome + valor).
- Ao salvar:
  - Adiciona ao histórico.
  - Atualiza metas de gamificação (contadores de pressão/peso).

### 6. Indicadores com mini-visualização

- Card para cada indicador (TFG, PA, Peso).
- Mostra:
  - Nome, valor atual, unidade.
  - Mini-série histórica representada por barras verticais (“MiniSparkline”).
  - Pílula de status (Ok / Atenção / Alerta).
- Botão “?” abre modal com **perguntas sugeridas** para levar ao médico.

### 7. Notificações e lembretes (simulados)

- Ícone de sino (🔔) no header.
- Ao tocar:
  - Abre modal com um texto de lembretes semanais:
    - Quantas vezes já registrou pressão/peso.
    - Progresso do controle de sódio.
  - Pensado para o paciente lembrar o que precisa fazer.

---

## Estrutura principal do código

O aplicativo está concentrado em **um único arquivo**:

- `app/(tabs)/index.tsx`

Principais blocos:

- **Tipos e dados mockados** (`StatusType`, `HistoryType`, `Indicator`, `HistoryItem`, `AppStateData`, `initialData`).
- **Helpers visuais** (`statusLabel`, `statusColors`, etc.).
- **MiniSparkline**: componente que exibe “gráfico” de tendência com barras (`View`).
- **HomeScreen**, **RecordsScreen**, **WearableScreen**, **ProfileScreen**.
- Componente principal `TabIndex`:
  - Guarda o estado global (dados, tela atual, modal, etc.).
  - Renderiza header, conteúdo, FAB e bottom navigation.
  - Define handlers:
    - `handleOpenNewRecord`, `handleSaveNewRecord`.
    - `handleAskAI`, `handleGamificationInfo`.
    - `handleOpenReport` (gera relatório).
    - `handleAnalyzeMeal` (seletor de imagem nativo ou `input` no Web).
    - `openNotifications` (lembretes).

---

## Como rodar o projeto

### 1. Criar projeto Expo (se ainda não existir)

```bash
npx create-expo-app renalcare-mobile --template blank-typescript
cd renalcare-mobile
