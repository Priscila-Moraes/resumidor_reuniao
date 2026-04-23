# PRD — ReuniãoAI

**Versão:** 1.0  
**Última atualização:** 20 de abril de 2026  
**Autora:** Priscila Moraes  
**Status:** Em desenvolvimento ativo  
**Tipo de documento:** Product Requirements Document (PRD)

---

## Sumário

1. [Visão do Produto](#1-visão-do-produto)
2. [Usuários-Alvo e Personas](#2-usuários-alvo-e-personas)
3. [Objetivos e Métricas de Sucesso](#3-objetivos-e-métricas-de-sucesso)
4. [Funcionalidades Atuais — v1.0](#4-funcionalidades-atuais--v10)
5. [Roadmap](#5-roadmap)
6. [Backlog Priorizado](#6-backlog-priorizado)
7. [Requisitos Não-Funcionais](#7-requisitos-não-funcionais)
8. [Integrações Futuras](#8-integrações-futuras)
9. [Riscos e Mitigações](#9-riscos-e-mitigações)
10. [Glossário](#10-glossário)

---

## 1. Visão do Produto

### 1.1 O Problema

Reuniões são o principal canal de tomada de decisão em times, agências e empresas, mas geram dois problemas críticos que custam tempo e dinheiro:

1. **Perda de informação.** Sem documentação estruturada, decisões, compromissos e próximos passos se perdem na memória dos participantes ou em anotações inconsistentes.
2. **Desperdício de tempo pós-reunião.** Redigir atas, extrair tarefas e distribuir resumos consome em média 30 a 60 minutos por reunião — tempo que poderia ser investido em execução.

Equipes de vendas perdem follow-ups. Agências repetem discussões por falta de registro. Gestores ficam fora do contexto de reuniões que não participaram. O problema não é a reunião em si: é a ausência de memória institucional acessível.

### 1.2 A Solução

**ReuniãoAI** é um SaaS que transforma transcrições de reuniões em resumos estruturados e acionáveis, automaticamente.

O usuário conecta sua conta do Fireflies.ai uma única vez. A partir daí, toda reunião gravada é processada automaticamente: a transcrição é capturada via webhook, analisada pelo GPT-4o-mini e salva no Supabase com título, objetivo, resumo executivo, decisões-chave, itens de ação e tópicos discutidos — tudo disponível em um dashboard web acessível de qualquer dispositivo.

Não há planilha manual, não há copy-paste de transcrição, não há ata esquecida numa pasta de downloads.

### 1.3 Proposta de Valor

| Para quem | O problema | Nossa solução |
|-----------|-----------|---------------|
| Gestores de agência | Perdem contexto de reuniões com clientes | Resumo automático com objetivo, decisões e próximos passos |
| Equipes de vendas | Follow-ups imprecisos após calls | Itens de ação capturados com accountability |
| Comunidades e educators | Reuniões internas sem registro | Histórico pesquisável de todas as discussões |
| Freelancers e consultores | Atas manuais que consomem tempo | Documentação automática sem esforço adicional |

### 1.4 Missão

> Transformar cada reunião em memória produtiva — automaticamente, sem atrito, acessível de qualquer lugar.

### 1.5 Posicionamento de Mercado

ReuniãoAI não compete diretamente com o Fireflies.ai (que é a ferramenta de gravação e transcrição). Ele compete com a **camada de análise e gestão de conhecimento** pós-transcrição: Notion AI Meeting Notes, Otter.ai Summary, Read.ai e soluções nativas de ferramentas como Zoom AI Companion e Google Meet Notes.

O diferencial é a **integração nativa com o ecossistema de agências e times que usam N8N, Meta Ads, ClickUp e ferramentas latinas de automação** — um nicho mal atendido pelas grandes plataformas internacionais.

---

## 2. Usuários-Alvo e Personas

### Persona 1 — Ana, Gestora de Tráfego (Usuária Principal)

**Perfil demográfico**
- Idade: 28–38 anos
- Modelo de trabalho: agência solo ou micro-agência (1–3 pessoas)
- Ferramentas do dia a dia: Meta Ads, N8N, Supabase, WhatsApp, ClickUp
- Nível técnico: intermediário-avançado

**Contexto e dores**
Ana faz de 4 a 8 calls por semana com clientes para alinhamento de campanhas, apresentação de resultados e planejamento estratégico. Cada reunião termina com uma lista mental de tarefas que ela precisa transcrever manualmente para o ClickUp antes de esquecer. Quando o cliente questiona "o que foi combinado naquela reunião de março?", ela perde 20 minutos procurando nos chats do WhatsApp.

**O que ela precisa**
- Registro automático do que foi decidido em cada call
- Itens de ação que ela possa transformar em tarefas no ClickUp
- Histórico de reuniões por cliente, filtrável e pesquisável
- Funcionar no celular (ela frequentemente revisa reuniões no telefone)

**Como usa o ReuniãoAI**
Liga o Fireflies antes de cada call com cliente. Ao final, em menos de 5 minutos o resumo já está no dashboard. Ela revisa rapidamente, copia os itens de ação para o ClickUp e fecha a reunião com tudo documentado.

---

### Persona 2 — Rafael, Gestor Comercial de Equipe de Vendas

**Perfil demográfico**
- Idade: 30–45 anos
- Contexto: lidera time de 3–10 SDRs e closers em empresa de médio porte
- Ferramentas do dia a dia: CRM (HubSpot/RD Station), Google Meet, Slack, Notion
- Nível técnico: básico-intermediário

**Contexto e dores**
Rafael não participa de todas as calls de vendas da sua equipe. Precisa ser notificado do que aconteceu em cada conversa com lead ou cliente — o que foi prometido, qual objeção surgiu, qual foi o próximo passo combinado. Hoje depende do relato subjetivo dos vendedores, que varia muito em qualidade.

**O que ele precisa**
- Visão consolidada de todas as reuniões do time (multi-usuário)
- Resumo executivo rápido (30 segundos de leitura por reunião)
- Identificação de padrões: objeções recorrentes, tópicos mais discutidos
- Alertas quando uma reunião com um cliente-chave é concluída

**Como usaria o ReuniãoAI**
Cada vendedor conecta sua conta. Rafael acessa uma view de equipe com todas as reuniões. Filtra por vendedor, por período, por tipo de reunião. Recebe um digest semanal no Slack com os highlights das calls mais relevantes.

---

### Persona 3 — Marina, Criadora de Comunidade / Educadora Online

**Perfil demográfico**
- Idade: 25–40 anos
- Contexto: facilita calls de mentoria, grupos de estudo e reuniões de comunidade (Discord, Hotmart, Kiwify)
- Ferramentas do dia a dia: Zoom, Google Meet, Notion, WhatsApp
- Nível técnico: básico

**Contexto e dores**
Marina facilita de 6 a 15 calls por semana entre mentorias individuais, calls de grupo e reuniões internas da comunidade. Membros sempre pedem o resumo depois, mas Marina não tem tempo de escrever atas para cada sessão. Isso cria retrabalho e insatisfação dos membros que perderam a call.

**O que ela precisa**
- Geração automática de ata para distribuição aos membros
- Interface simples, sem configuração técnica complexa
- Possibilidade de exportar o resumo em PDF ou copiar como texto formatado
- Plano de preço acessível para uso individual intenso

**Como usaria o ReuniãoAI**
Conecta o Fireflies uma vez, habilita o bot em todas as calls. Após cada sessão, acessa o dashboard, copia o resumo formatado e cola no canal do Discord ou envia por e-mail para os membros. Economiza 45 minutos por dia que antes gastava escrevendo atas.

---

## 3. Objetivos e Métricas de Sucesso

### 3.1 OKRs — Q2 2026 (validação de produto e primeiros usuários)

**Objetivo 1 — Validar o produto com usuários reais fora do contexto da autora**

| Key Result | Meta | Prazo |
|------------|------|-------|
| KR1.1 — Usuários ativos processando reuniões | 10 usuários | 30/06/2026 |
| KR1.2 — Reuniões processadas no total | 100 reuniões | 30/06/2026 |
| KR1.3 — NPS médio entre primeiros usuários | ≥ 40 | 30/06/2026 |

**Objetivo 2 — Garantir estabilidade e confiabilidade técnica**

| Key Result | Meta | Prazo |
|------------|------|-------|
| KR2.1 — Uptime do backend | ≥ 99% | contínuo |
| KR2.2 — Taxa de erro no processamento webhook | < 2% | contínuo |
| KR2.3 — Tempo médio de processamento por reunião | < 90 segundos | 30/06/2026 |

**Objetivo 3 — Estruturar base para monetização**

| Key Result | Meta | Prazo |
|------------|------|-------|
| KR3.1 — Definir modelo de preços e tier gratuito | Decisão documentada | 31/05/2026 |
| KR3.2 — Primeiro usuário pagante fora do contexto da autora | 1 cliente | 30/06/2026 |

---

### 3.2 OKRs — Q3 2026 (crescimento e expansão)

**Objetivo 4 — Crescer base de usuários ativos**

| Key Result | Meta | Prazo |
|------------|------|-------|
| KR4.1 — MRR (Monthly Recurring Revenue) | R$ 500 | 30/09/2026 |
| KR4.2 — Usuários ativos mensais (MAU) | 30 | 30/09/2026 |
| KR4.3 — Taxa de retenção mês 2 | ≥ 60% | 30/09/2026 |

---

### 3.3 KPIs Operacionais (monitoramento contínuo)

| KPI | Descrição | Meta |
|-----|-----------|------|
| Taxa de processamento automático | % de reuniões do Fireflies processadas via webhook sem intervenção | > 95% |
| Tempo médio de processamento | Do webhook recebido ao resumo salvo no Supabase | < 90s |
| Taxa de erro de IA | % de análises que retornam JSON inválido ou incompleto | < 1% |
| DAU/MAU ratio | Frequência de uso | > 30% |
| Churn mensal | Usuários que cancelam ou param de usar | < 10% |
| Tempo até primeiro valor | Do cadastro até primeira reunião processada | < 10 minutos |

---

## 4. Funcionalidades Atuais — v1.0

### 4.1 Autenticação e Perfil

**Status:** Concluído

**Descrição:** Sistema completo de autenticação via Supabase Auth com login e cadastro por e-mail e senha. Ao criar conta, um perfil é automaticamente criado via trigger no banco de dados (`handle_new_user`). O perfil armazena e-mail, chave OpenAI e chave Fireflies do usuário.

**Detalhes técnicos:**
- Provider: Supabase Auth (e-mail/senha)
- Tabela: `public.profiles` com RLS ativo
- Trigger automático: `on_auth_user_created`
- Rotas protegidas: todas as páginas internas requerem sessão ativa
- Sessão persistida via Supabase client no browser

**Regras de negócio:**
- Cada usuário só acessa seus próprios dados (RLS no Supabase)
- Chaves de API (OpenAI e Fireflies) são armazenadas por usuário — não são globais
- Sem chave OpenAI configurada, o processamento manual não funciona

---

### 4.2 Dashboard — Lista de Reuniões

**Status:** Concluído

**Descrição:** Tela principal do produto. Exibe todas as reuniões do usuário em cards ordenados do mais recente para o mais antigo. Inclui busca por texto (título e resumo), filtro por tipo de reunião e preview do resumo executivo.

**Detalhes de UI:**
- Cards com: título da reunião, data/hora formatada, tag colorida de tipo, trecho do resumo
- Barra de busca com filtro em tempo real (client-side)
- Filtro por `tipo_reuniao` (Vendas, Equipe, Kickoff, etc.)
- Botão de deletar por card com modal de confirmação
- Estado vazio com orientação para o usuário quando não há reuniões
- Indicador de carregamento (loading state)

**Detalhes técnicos:**
- Query Supabase: `select('id, titulo, data, tipo_reuniao, resumo')` com RLS
- Ordenação: `order('data', { ascending: false })`
- Backend URL configurado via constante: `https://n8n-backend.v6mtnf.easypanel.host`

---

### 4.3 Processamento Automático via Webhook

**Status:** Concluído

**Descrição:** Fluxo principal de automação. Quando uma reunião termina no Fireflies.ai, ele dispara um webhook para o backend do ReuniãoAI. O backend busca a transcrição completa via API GraphQL do Fireflies, envia para o GPT-4o-mini e salva o resultado estruturado no Supabase.

**Fluxo detalhado:**
1. Fireflies conclui processamento da reunião
2. POST webhook → `https://n8n-backend.v6mtnf.easypanel.host/webhook/fireflies`
3. Backend extrai `transcriptId` do payload
4. Busca o perfil do usuário no Supabase pelo `userId` do webhook
5. Consulta Fireflies GraphQL API com a chave do usuário
6. Extrai transcrição linha a linha (speaker + texto)
7. Envia prompt para GPT-4o-mini com a chave OpenAI do usuário
8. Recebe JSON estruturado com análise da reunião
9. Salva `Meeting` completo no Supabase (`meetings` table)
10. Retorna `201 Created`

**Campos gerados pela IA:**
- `tipo_reuniao` — classificação do tipo (ex: Vendas, Kickoff, Alinhamento)
- `objetivo` — objetivo principal identificado
- `resumo` — parágrafo de resumo executivo
- `pontos_importantes` — array de decisões e itens de ação
- `topicos_discutidos` — array de tags para word cloud

**Parâmetros do modelo:**
- Modelo: `gpt-4o-mini`
- Temperature: `0.2` (respostas determinísticas)
- System prompt: instrução para retornar JSON estrito sem markdown blocks

---

### 4.4 Processamento Manual (On-Demand)

**Status:** Concluído

**Descrição:** Alternativa ao webhook automático. O usuário pode colar um `Transcript ID` do Fireflies diretamente no dashboard e acionar o processamento manualmente. Útil para reprocessar reuniões antigas ou quando o webhook não foi configurado.

**UX:**
- Botão "Processar Reunião" no dashboard abre um form inline
- Campo para colar o Transcript ID do Fireflies
- Feedback de loading durante processamento
- Toast de sucesso ou erro ao finalizar
- Lista atualiza automaticamente após processamento bem-sucedido

**Detalhes técnicos:**
- Endpoint: `POST /api/meetings/process`
- Autenticação: Bearer token da sessão Supabase
- Backend busca as chaves do usuário autenticado antes de processar

---

### 4.5 Detalhe da Reunião

**Status:** Concluído

**Descrição:** Página de visualização completa de uma reunião individual. Layout em duas colunas (análise + transcrição) em desktop, stack em mobile.

**Coluna esquerda — Análise:**
- Objetivo da reunião
- Resumo executivo completo
- Decisões-Chave: lista com ícones visuais diferenciados
- Itens de Ação: checkboxes interativos (estado local, sem persistência)
- Tópicos Discutidos: word cloud com tags coloridas

**Coluna direita — Transcrição:**
- Aba "Completa": transcrição linha a linha com identificação do speaker
- Aba "Destaques": versão filtrada com trechos mais relevantes
- Formatação clara com quebras por speaker

**Detalhes técnicos:**
- Rota: `/meeting/:id`
- Query: `select('*')` com filtro por `id` e RLS por `user_id`
- Dados `pontos_importantes` e `topicos_discutidos` armazenados como JSONB

---

### 4.6 Configurações

**Status:** Concluído

**Descrição:** Página para o usuário gerenciar suas integrações. Salva as chaves de API necessárias para o funcionamento do produto.

**Campos configuráveis:**
- **Chave OpenAI:** usada para análise das transcrições pelo GPT-4o-mini
- **Chave Fireflies:** usada para buscar transcrições via API GraphQL
- **URL do Webhook:** exibida para o usuário configurar no painel do Fireflies

**UX:**
- Campos mascarados por padrão (tipo password)
- Botão de salvar com feedback via toast
- Instruções inline de onde encontrar cada chave

**Detalhes técnicos:**
- Endpoint: `PATCH /api/settings` ou direto via Supabase client
- Dados salvos na tabela `profiles`: `openai_api_key`, `fireflies_api_key`
- RLS garante que cada usuário só edita seu próprio perfil

---

### 4.7 Exclusão de Reunião

**Status:** Concluído

**Descrição:** Usuário pode deletar qualquer reunião do dashboard. Ação irreversível protegida por modal de confirmação customizado (sem `window.confirm` nativo do browser).

**UX:**
- Ícone de lixeira em cada card do dashboard
- Modal de confirmação com mensagem explicativa
- Botão "Cancelar" e botão "Deletar" com cor destrutiva
- Toast de confirmação após deleção
- Lista atualiza automaticamente após a ação

---

### 4.8 Progressive Web App (PWA)

**Status:** Concluído

**Descrição:** O frontend é instalável como aplicativo nativo em Android e iOS via Service Worker e Web App Manifest. Funciona offline para visualização de dados já carregados (cache via service worker).

**Capacidades:**
- Installable no Android (prompt nativo do browser)
- Installable no iOS (via "Adicionar à Tela Inicial" no Safari)
- Ícone de app, splash screen, tema de cor configurados
- Cache de assets para funcionamento offline parcial

---

### 4.9 Interface Responsiva

**Status:** Concluído

**Descrição:** Layout totalmente responsivo. Em desktop, sidebar fixa com navegação. Em mobile (< 768px), sidebar vira um drawer deslizante acionado por ícone hamburger.

**Breakpoints:**
- Desktop: sidebar fixa, layout duas colunas no detalhe da reunião
- Tablet/Mobile: sidebar como drawer, layout single column

---

### 4.10 Sistema de Toasts

**Status:** Concluído

**Descrição:** Sistema de notificações não-bloqueantes que substitui os `alert()` e `confirm()` nativos do browser. Implementado via Context API do React (`ToastContext`).

**Tipos de toast:**
- Sucesso (verde)
- Erro (vermelho)
- Informação (azul)

**Comportamento:**
- Aparece no canto da tela
- Auto-dismiss após 4 segundos
- Não bloqueia interação com o restante da interface
- Empilhável (múltiplos toasts simultâneos)

---

## 5. Roadmap

### v1.1 — Polimento e Retenção (Q2 2026)

**Foco:** Melhorar a experiência dos primeiros usuários reais, corrigir pontos de atrito descobertos no uso, adicionar features de alta visibilidade e baixo esforço.

**Funcionalidades planejadas:**

| Feature | Descrição | Justificativa |
|---------|-----------|---------------|
| Exportar resumo | Botão para copiar resumo como texto formatado ou baixar PDF | Primeira solicitação esperada de usuários reais |
| Persistência de checkboxes | Itens de Ação marcados como concluídos salvos no Supabase | Estado perdido ao recarregar é frustrante |
| Reprocessar reunião | Botão para reenviar para análise da IA com novo prompt | Útil quando a análise gerada ficou ruim |
| Edição de título/tipo | Permite corrigir título e tipo gerado pela IA | IA pode classificar errado |
| Paginação no dashboard | Substituir scroll infinito por paginação para listas longas | Performance e UX para usuários com muitas reuniões |
| Campo de notas manuais | Área de texto livre por reunião para anotações do usuário | Complementar análise automática |

---

### v1.2 — Expansão e Produtividade (Q3 2026)

**Foco:** Integrar com as ferramentas do dia a dia dos usuários, tornar o produto indispensável na rotina de trabalho.

**Funcionalidades planejadas:**

| Feature | Descrição | Justificativa |
|---------|-----------|---------------|
| Envio de resumo por e-mail | Enviar resumo automaticamente para participantes ao finalizar reunião | Elimina o passo manual de distribuição |
| Integração ClickUp | Criar tarefas no ClickUp a partir dos Itens de Ação | Fluxo direto do resumo para execução |
| Integração Slack/WhatsApp | Notificação automática no Slack ou WhatsApp com resumo ao finalizar reunião | Visibilidade imediata para equipe |
| Busca global aprimorada | Busca full-text no conteúdo das transcrições (não só título) | Encontrar reunião por contexto, não só nome |
| Filtro por participante | Filtrar reuniões por nome de speaker identificado | Útil para gestores rastreando calls de equipe |
| Dashboard de analytics | Gráfico de reuniões por período, tipo mais frequente, tópicos recorrentes | Insights sobre padrões de reunião |

---

### v2.0 — Produto Multi-Usuário e SaaS (Q4 2026 / Q1 2027)

**Foco:** Transformar o produto de uso individual para times e agências. Implementar monetização estruturada.

**Funcionalidades planejadas:**

| Feature | Descrição | Justificativa |
|---------|-----------|---------------|
| Workspaces / Times | Organização de usuários em times com reuniões compartilhadas | Necessário para venda B2B |
| Permissões e papéis | Admin, membro, visualizador por workspace | Controle de acesso para times |
| Planos e billing | Integração com Stripe para cobrança de planos (Free/Pro/Team) | Monetização do produto |
| Suporte a múltiplos provedores de transcrição | Integração com Otter.ai, Google Meet Transcripts, Zoom | Reduzir dependência do Fireflies |
| Templates de análise | Prompts customizáveis por tipo de reunião (sales call, sprint, 1:1) | Análises mais precisas por contexto |
| API pública | Endpoints REST para desenvolvedores integrarem com outros sistemas | Ecossistema e extensibilidade |
| White-label | Opção de customização de marca para agências revenderem | Canal de revenda |

---

## 6. Backlog Priorizado

Legenda MoSCoW:
- **M** — Must Have (imprescindível)
- **S** — Should Have (importante, mas não crítico agora)
- **C** — Could Have (desejável se houver capacidade)
- **W** — Won't Have (descartado para esta versão)

Impacto: Alto / Médio / Baixo  
Esforço: Alto / Médio / Baixo

| # | Feature | Descrição | Impacto | Esforço | MoSCoW | Versão |
|---|---------|-----------|---------|---------|--------|--------|
| 1 | Exportar como PDF | Gerar PDF do resumo formatado para envio a clientes | Alto | Médio | M | v1.1 |
| 2 | Copiar resumo formatado | Botão "Copiar" que coloca o resumo em texto estruturado na área de transferência | Alto | Baixo | M | v1.1 |
| 3 | Persistência de checkboxes | Salvar estado dos Itens de Ação marcados no Supabase | Alto | Baixo | M | v1.1 |
| 4 | Reprocessar reunião | Botão para reenviar transcrição para análise da IA | Alto | Baixo | M | v1.1 |
| 5 | Edição de título e tipo | Editar inline título e tipo_reuniao após geração | Médio | Baixo | S | v1.1 |
| 6 | Notas manuais por reunião | Campo de texto livre para anotações adicionais | Médio | Baixo | S | v1.1 |
| 7 | Paginação no dashboard | Substituir lista completa por paginação (10–20 por página) | Médio | Baixo | S | v1.1 |
| 8 | Envio de e-mail pós-reunião | Enviar resumo automaticamente para e-mails dos participantes | Alto | Médio | M | v1.2 |
| 9 | Notificação Slack | Webhook Slack com highlights da reunião ao finalizar | Alto | Médio | S | v1.2 |
| 10 | Integração ClickUp | Criar tarefas no ClickUp a partir dos Itens de Ação identificados | Alto | Alto | S | v1.2 |
| 11 | Busca full-text nas transcrições | Pesquisar dentro do conteúdo das transcrições, não só nos títulos | Médio | Médio | S | v1.2 |
| 12 | Filtro por speaker | Filtrar reuniões por nome de participante identificado na transcrição | Médio | Médio | C | v1.2 |
| 13 | Dashboard de analytics | Gráficos: reuniões por semana, tipos frequentes, tópicos recorrentes | Médio | Alto | C | v1.2 |
| 14 | Templates de prompt por tipo | Prompts customizáveis para tipos de reunião (sales call, 1:1, sprint) | Alto | Médio | S | v2.0 |
| 15 | Workspaces / Times | Contas de time com reuniões compartilhadas e papéis | Alto | Alto | M | v2.0 |
| 16 | Billing com Stripe | Planos Free/Pro/Team com cobrança mensal | Alto | Alto | M | v2.0 |
| 17 | API pública REST | Endpoints para integração com sistemas externos | Médio | Alto | C | v2.0 |
| 18 | Suporte Otter.ai | Integração com segundo provedor de transcrição | Médio | Alto | C | v2.0 |
| 19 | Suporte Zoom Transcripts | Processar transcrições nativas do Zoom sem Fireflies | Médio | Alto | C | v2.0 |
| 20 | White-label | Customização de marca para agências revenderem | Médio | Alto | W | v2.0+ |
| 21 | App nativo iOS/Android | React Native ou Capacitor para stores | Baixo | Alto | W | v3.0 |
| 22 | Resumo por áudio direto | Upload de arquivo de áudio e processamento com Whisper | Alto | Alto | C | v2.0 |
| 23 | Google Calendar sync | Associar reuniões do dashboard a eventos do Google Calendar | Médio | Médio | C | v1.2 |
| 24 | Integração N8N nativa | Trigger N8N quando nova reunião é processada | Alto | Médio | S | v1.2 |
| 25 | Highlights automáticos | IA identifica os 3 trechos mais importantes da transcrição | Médio | Médio | S | v1.1 |

---

## 7. Requisitos Não-Funcionais

### 7.1 Performance

| Requisito | Meta | Notas |
|-----------|------|-------|
| Tempo de carregamento inicial (TTI) | < 3 segundos em conexão 4G | Vite com code splitting, assets otimizados |
| Tempo de processamento webhook-to-dashboard | < 90 segundos | Inclui chamada Fireflies + OpenAI + Supabase |
| Tempo de resposta de endpoint crítico | < 500ms (p95) | Endpoints `/api/meetings` e detalhes |
| Tamanho do bundle JS inicial | < 300kb gzipped | Lazy loading de rotas |
| Core Web Vitals — LCP | < 2.5 segundos | |
| Core Web Vitals — CLS | < 0.1 | |

### 7.2 Segurança

| Requisito | Implementação |
|-----------|--------------|
| Autenticação JWT | Supabase Auth — tokens com expiração de 1 hora, refresh automático |
| Isolamento de dados | Row Level Security (RLS) em todas as tabelas — cada usuário acessa apenas seus dados |
| Proteção de chaves de API | Chaves OpenAI e Fireflies armazenadas no Supabase, nunca expostas no frontend |
| Comunicação HTTPS | TLS obrigatório em todos os endpoints (EasyPanel + certificado Let's Encrypt) |
| Validação de webhook | Verificar assinatura/origem do webhook do Fireflies antes de processar |
| CORS restrito | Backend com whitelist de origens permitidas |
| Rate limiting | Limite de requisições por IP nos endpoints de processamento |
| Variáveis de ambiente | Segredos nunca em código-fonte — apenas via `.env` e variáveis do Docker/EasyPanel |
| Auditoria de acesso | Logs de todas as operações de processamento e deleção |

### 7.3 Confiabilidade e Disponibilidade

| Requisito | Meta |
|-----------|------|
| Uptime do backend | ≥ 99% mensal |
| Política de retry no webhook | Até 3 tentativas com backoff exponencial |
| Tratamento de falhas da OpenAI | Fallback com mensagem de erro amigável — sem perda de transcrição bruta |
| Tratamento de falhas do Fireflies | Retry automático com log de erro se transcrição não disponível |
| Backup de dados | Supabase backups automáticos diários |
| Recovery Time Objective (RTO) | < 4 horas para falhas de infraestrutura |

### 7.4 Escalabilidade

| Requisito | Estratégia |
|-----------|-----------|
| Crescimento de usuários | Supabase escala horizontalmente sem ação manual |
| Aumento de volume de webhooks | Backend stateless — pode escalar via múltiplas instâncias no EasyPanel |
| Custo por usuário | Monitorar custo de tokens OpenAI por usuário — implementar limites por plano |
| Banco de dados | Índices em `user_id` e `data` na tabela `meetings` para queries rápidas |

### 7.5 Manutenibilidade

| Requisito | Estratégia |
|-----------|-----------|
| TypeScript no frontend e backend | Tipagem estática reduz bugs em refatorações |
| Separação de camadas no backend | `routes/` (HTTP) + `services/` (lógica de negócio) + `supabaseClient` (dados) |
| Versionamento | Git com branches por feature, commits convencionais |
| Docker | Ambiente de desenvolvimento e produção padronizados |
| Variáveis de ambiente centralizadas | `.env.example` documentado para onboarding de novos devs |

### 7.6 Acessibilidade

| Requisito | Meta |
|-----------|------|
| Conformidade WCAG | Nível AA (mínimo) |
| Contraste de texto | Relação de contraste ≥ 4.5:1 para texto normal |
| Navegação por teclado | Todos os elementos interativos acessíveis via Tab/Enter/Space |
| Labels em formulários | Todos os inputs com `label` ou `aria-label` associado |
| Textos alternativos | Alt text em todas as imagens e ícones funcionais |
| Foco visível | Indicador de foco CSS visível em todos os elementos interativos |

### 7.7 Compatibilidade

| Plataforma | Suporte |
|------------|---------|
| Chrome 120+ | Suporte completo |
| Firefox 120+ | Suporte completo |
| Safari 17+ (macOS/iOS) | Suporte completo (incluindo PWA via "Adicionar à tela inicial") |
| Edge 120+ | Suporte completo |
| Android Chrome | Suporte completo (PWA installable) |
| iOS Safari | Suporte completo (PWA installable) |

---

## 8. Integrações Futuras

### 8.1 Gestão de Tarefas e Projetos

**ClickUp**
- Criar tasks automaticamente a partir dos Itens de Ação identificados pela IA
- Associar tasks a listas específicas do ClickUp do usuário
- Sincronizar status de conclusão dos checkboxes
- Prioridade: Alta — forte overlap com o perfil da usuária primária

**Notion**
- Criar páginas de ata no Notion automaticamente
- Template pré-configurado: Objetivo / Resumo / Decisões / Próximos Passos
- Associar à base de dados de reuniões do workspace do usuário

**Trello / Asana**
- Criação de cards/tasks a partir dos Itens de Ação
- Prioridade: Média

---

### 8.2 Comunicação e Colaboração

**Slack**
- Enviar mensagem automática em canal configurado ao finalizar reunião
- Formato: blocos do Slack com resumo estruturado
- Botão "Ver no ReuniãoAI" linkando para o detalhe

**WhatsApp Business API**
- Envio de resumo por WhatsApp para participantes da reunião
- Relevante para o perfil de clientes brasileiros
- Via N8N ou integração direta com a API oficial

**E-mail (SMTP / SendGrid / Resend)**
- Envio automático de ata formatada em HTML para lista de e-mails dos participantes
- Template profissional com branding customizável

---

### 8.3 Produtividade e Calendário

**Google Calendar**
- Associar cada reunião processada ao evento original no Google Calendar
- Exibir participantes reais do evento junto com os speakers identificados
- Criar follow-up event a partir dos próximos passos definidos

**Google Meet / Zoom**
- Processar transcrições nativas sem depender do Fireflies
- Ampliar base de usuários que não usam serviço de transcrição dedicado

---

### 8.4 Automação

**N8N**
- Trigger webhook quando nova reunião é processada no ReuniãoAI
- Permitir que usuários criem fluxos customizados no N8N a partir dos eventos do produto
- Integração bidirecional: N8N pode acionar processamento manual via API

**Zapier / Make (Integromat)**
- Integração via Zapier para usuários não-técnicos
- Trigger "Nova Reunião Processada" disponível na plataforma

---

### 8.5 Inteligência e Análise

**Meta Ads (Facebook/Instagram)**
- Cruzar tópicos discutidos em reuniões de briefing com campanhas ativas
- Gerar insights de criativo a partir de feedback de calls com clientes
- Nicho: gestores de tráfego que usam ReuniãoAI para documentar briefings

**CRM (RD Station, HubSpot, Pipedrive)**
- Associar reunião a um negócio/deal no CRM
- Salvar resumo como nota de atividade no lead
- Atualizar estágio do funil com base nas decisões identificadas

---

### 8.6 Transcrição (Fontes Alternativas ao Fireflies)

| Provedor | Prioridade | Notas |
|----------|-----------|-------|
| Otter.ai | Alta | Forte concorrente do Fireflies com API similar |
| Zoom AI | Alta | Transcrições nativas do Zoom sem app externo |
| Google Meet | Média | Transcrições via Google Workspace |
| Microsoft Teams | Média | Empresas B2B corporate |
| Rev.ai / AssemblyAI | Média | Para upload direto de áudio |
| OpenAI Whisper | Alta | Upload de arquivo de áudio — independente de plataforma de reunião |

---

## 9. Riscos e Mitigações

### 9.1 Riscos Técnicos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Falha no webhook do Fireflies — reunião processada antes da transcrição estar pronta | Alta | Alto | Implementar retry com delay de 30s após receber webhook; verificar status antes de buscar |
| JSON inválido retornado pela OpenAI | Média | Médio | Validação de schema + try/catch com fallback salvando ao menos a transcrição bruta |
| Expiração/rotação de chave OpenAI do usuário | Alta | Alto | Detecção de erro 401 da OpenAI com mensagem clara orientando o usuário a atualizar a chave |
| Downtime do EasyPanel/VPS | Baixa | Alto | Monitoramento via UptimeRobot; alertas por e-mail; SLA documentado |
| Supabase atingir limite de plano gratuito | Média | Alto | Monitorar métricas de uso; migrar para plano pago antes de atingir limite |
| Rate limit da OpenAI por usuário de volume alto | Média | Médio | Implementar fila de processamento com delay entre chamadas |
| Mudança de API do Fireflies (breaking change) | Baixa | Alto | Versionar as queries GraphQL; monitorar changelog da API |

### 9.2 Riscos de Negócio

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Baixa adoção — usuários não completam onboarding | Alta | Alto | Simplificar onboarding: reunião processada em < 10min do cadastro; tutorial interativo |
| Dependência crítica do Fireflies | Alta | Alto | Roadmap de fontes alternativas (Zoom, Otter, Whisper) para v2.0 |
| Custo de tokens OpenAI crescendo com escala | Média | Médio | Usar `gpt-4o-mini` (✓ já implementado); limites por plano; cache de análises idênticas |
| Produto entra em conflito com roadmap do Fireflies (feature nativa similar) | Média | Alto | Diferenciação via integrações (ClickUp, N8N, Meta Ads) que o Fireflies não oferece |
| Privacidade e LGPD — dados de reuniões de clientes | Alta | Alto | Termos de uso claros; política de privacidade; criptografia em repouso no Supabase |
| Concorrência de ferramentas consolidadas (Otter, Read.ai) | Alta | Médio | Focar no nicho de agências e gestores BR; preço acessível; integração com ferramentas locais |
| Churn por falta de valor percebido | Média | Alto | Onboarding guiado; e-mail de ativação; acompanhamento de usuários no primeiro mês |

### 9.3 Riscos de Privacidade e Compliance

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Transcrições de reuniões confidenciais armazenadas sem consentimento | Alta | Crítico | Política de privacidade clara; consentimento explícito no cadastro; opção de não salvar transcrição bruta |
| Dados de clientes finais dos usuários armazenados na plataforma | Alta | Alto | Alertas sobre dados de terceiros; DPA (Data Processing Agreement) para usuários empresariais |
| Uso de chaves de API de usuários pelo backend | Média | Alto | Logs de uso auditáveis; chaves criptografadas no Supabase; nunca logadas em texto claro |

---

## 10. Glossário

| Termo | Definição |
|-------|-----------|
| **Fireflies.ai** | Serviço de gravação e transcrição automática de reuniões online. Integra com Google Meet, Zoom, Microsoft Teams e outros. |
| **Transcript ID** | Identificador único de uma transcrição no Fireflies.ai. Usado para buscar o conteúdo via API GraphQL. |
| **Webhook** | Chamada HTTP automática disparada por um sistema externo quando um evento ocorre. No ReuniãoAI, o Fireflies dispara um webhook ao finalizar o processamento de uma reunião. |
| **GPT-4o-mini** | Modelo de linguagem da OpenAI usado para analisar transcrições e gerar resumos estruturados. Balanceia custo e qualidade para uso em escala. |
| **Supabase** | Plataforma open-source de backend-as-a-service com banco de dados PostgreSQL, autenticação e APIs REST e Realtime. |
| **RLS (Row Level Security)** | Funcionalidade do PostgreSQL/Supabase que restringe acesso a linhas do banco com base em políticas — garante que cada usuário acessa apenas seus dados. |
| **PWA (Progressive Web App)** | Tecnologia web que permite instalar um site como aplicativo no celular ou desktop, com capacidades offline e ícone na tela inicial. |
| **Tipo de reunião** | Classificação automática gerada pela IA. Exemplos: Vendas, Kickoff, Alinhamento de Equipe, Mentoria, Planejamento. |
| **Pontos importantes** | Array de decisões-chave e itens de ação extraídos pela IA da transcrição. Exibidos como checkboxes na página de detalhe. |
| **Tópicos discutidos** | Array de tags temáticas extraídas pela IA. Exibidos como word cloud colorida na página de detalhe. |
| **Toast** | Notificação visual não-bloqueante que aparece brevemente na interface para confirmar ações ou exibir erros. |
| **EasyPanel** | Plataforma de hospedagem e gerenciamento de aplicações Docker em VPS. Usado para hospedar o backend e frontend do ReuniãoAI. |
| **MoSCoW** | Framework de priorização de requisitos: Must Have, Should Have, Could Have, Won't Have. |
| **OKR** | Objectives and Key Results — metodologia de definição de metas com objetivo qualitativo e resultados-chave mensuráveis. |
| **KPI** | Key Performance Indicator — métrica quantitativa usada para monitorar desempenho de um processo ou produto. |
| **MAU** | Monthly Active Users — usuários únicos ativos no período de 30 dias. |
| **MRR** | Monthly Recurring Revenue — receita recorrente mensal total de assinantes. |
| **NPS** | Net Promoter Score — métrica de satisfação e lealdade do usuário. Calculada pela diferença entre promotores e detratores. |
| **Churn** | Taxa de cancelamento ou abandono de usuários em um período. |
| **Speaker** | Participante identificado na transcrição da reunião. O Fireflies identifica speakers automaticamente por voz. |
| **Prompt** | Instrução enviada para o modelo de linguagem (GPT-4o-mini) descrevendo o que deve ser analisado e como a resposta deve ser formatada. |
| **N8N** | Plataforma open-source de automação de fluxos de trabalho (similar ao Zapier). Usada para automações internas da agência. |
| **Workspace** | Espaço de trabalho compartilhado por um time dentro de um SaaS B2B. Cada workspace agrupa usuários e dados de uma organização. |
| **White-label** | Produto reembalado com a marca do revendedor, sem menção à marca original. |
| **Tier gratuito** | Plano sem cobrança com limitações (ex: máximo de reuniões por mês) usado como entrada no funil de aquisição. |

---

*Documento vivo — atualizar a cada sprint ou decisão de produto relevante.*  
*Responsável: Priscila Moraes — pryscyllamoraes@icloud.com*  
*Última revisão: 20 de abril de 2026*
