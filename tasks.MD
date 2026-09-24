# Plano de evolução do sistema de artigos Markdown

## Objetivo

Refatorar e aprimorar o fluxo de criação, edição e visualização de artigos Markdown, mantendo a arquitetura do App Router, a integração com MUI/Tailwind e a compatibilidade entre Server Components e Client Components.

## 1. Arquitetura dos artigos

### 1.1 Separação de responsabilidades

- [ ] Mapear as responsabilidades atuais de `ArticleEditor`, `ArticleViewer`, `/edit/[id]` e `/page/[id]`.
  - Identificar quais trechos cuidam de apresentação, carregamento, transformação de payload, estados de loading/erro e persistência.
  - Registrar duplicações entre o carregamento feito pelo editor e o carregamento feito pelo visualizador.

- [ ] Separar a lógica de fetch e salvamento da apresentação do editor.
  - Manter o componente visual responsável por campos, ações, feedback e estados visuais.
  - Centralizar as chamadas para `GET`, `POST` e `PATCH` em uma camada de acesso a dados já existente ou em um módulo de domínio compatível com a estrutura atual.
  - Preservar `Accept`, `Content-Type`, autenticação, `cache: "no-store"` e o tratamento consistente de mensagens retornadas pela API.

- [ ] Definir um fluxo único para loading, erro, vazio e sucesso.
  - Reutilizar `FeedbackState`, `Alert` e os padrões já presentes em `AuthPanel`.
  - Garantir que erros de rede, respostas sem JSON e erros de validação do backend tenham mensagens úteis.
  - Evitar que uma resposta antiga sobrescreva o estado após a troca de rota ou desmontagem do componente.

- [ ] Separar o estado de edição do modelo persistido.
  - Usar um estado de formulário explícito para `title`, `description` e `content`.
  - Normalizar o payload antes do envio e evitar enviar campos indefinidos ou metadados controlados pelo servidor.
  - Definir o comportamento para formulário alterado, navegação acidental e confirmação de saída, se esse requisito for adotado.

- [ ] Revisar a fronteira entre componentes Server e Client.
  - Manter a resolução de `params` e a composição de página no Server Component sempre que possível.
  - Isolar `@uiw/react-md-editor`, hooks de estado e APIs do navegador em Client Components.
  - Evitar importar CSS ou dependências client-only em componentes server sem necessidade.

### 1.2 Tipagem do domínio

- [ ] Padronizar a tipagem principal `Article`.
  - Definir campos obrigatórios: `id`, `title` e `content`.
  - Definir campos opcionais ou anuláveis: `description`, `createdAt` e `updatedAt`, conforme o contrato real da API.
  - Escolher um formato único de data e documentar se a API retorna ISO 8601, string local ou outro formato.

- [ ] Criar a tipagem `ArticleMetadata`.
  - Concentrar dados usados em listagens e cabeçalhos, como `id`, `title`, `description`, `createdAt` e `updatedAt`.
  - Diferenciar claramente metadados de conteúdo Markdown completo.
  - Usar `ArticleMetadata` em cards, dashboard, busca e previews; usar `Article` somente quando `content` for necessário.

- [ ] Definir tipos de entrada e saída da API.
  - Criar tipos distintos para criação, atualização e resposta, evitando reutilizar indiscriminadamente `Article` como payload de formulário.
  - Documentar se a resposta vem diretamente como artigo ou encapsulada em `{ data: Article }`.
  - Tipar erros de validação por campo para que o editor consiga exibi-los junto aos inputs.

- [ ] Validar e normalizar respostas externas em um único ponto.
  - Confirmar a presença de `title` e `content` antes de renderizar o visualizador.
  - Tratar valores nulos, campos desconhecidos e respostas incompatíveis sem quebrar a página.
  - Manter a tipagem estrita do TypeScript sem usar `any` como atalho.

### 1.3 SSR, hidratação e rota `/edit/[id]`

- [ ] Definir o fluxo de hidratação da rota `/edit/[id]`.
  - O Server Component deve resolver o `id` recebido em `params` e passá-lo ao editor client como propriedade serializável.
  - O editor deve iniciar com estado de loading para artigos existentes e estado vazio para `/edit/novo`.
  - Evitar acessar `window`, `localStorage` ou APIs do navegador durante a renderização no servidor.

- [ ] Garantir que o editor Markdown não seja renderizado no servidor.
  - Carregar `@uiw/react-md-editor` com `dynamic(..., { ssr: false })`.
  - Confirmar que o HTML inicial e o primeiro estado client não geram diferenças de hidratação.
  - Validar o comportamento ao atualizar diretamente uma URL de edição e ao navegar entre dois IDs.

- [ ] Definir a estratégia de cache da edição e leitura.
  - Manter `cache: "no-store"` em dados administrativos e conteúdo que possa ter acabado de ser salvo.
  - Após salvar, decidir entre atualizar o estado local, redirecionar para `/page/[id]` ou invalidar o cache da página.
  - Testar a sequência criar, salvar, atualizar a rota e abrir a visualização pública.

- [ ] Adicionar testes de integração para a rota de edição.
  - Cobrir criação de artigo, carregamento de artigo existente, falha de carregamento, falha de salvamento e resposta inválida.
  - Verificar que o editor não tenta enviar um formulário sem conteúdo obrigatório.
  - Verificar que a navegação de cancelar aponta para o destino correto em criação e edição.

## 2. Mock robusto para o `ArticleViewer`

### 2.1 Fonte de dados de teste

- [ ] Criar um mock dedicado e previsível para o visualizador.
  - Manter o mock separado do componente de produção para permitir testes visuais sem depender do backend Laravel.
  - Usar um objeto compatível com `Article`, com título, descrição, ID, datas e conteúdo Markdown.
  - Evitar dados mínimos demais: o mock deve representar um artigo real e longo o suficiente para exercitar scroll e espaçamento.

- [ ] Criar uma página, fixture ou cenário isolado para renderizar o mock.
  - Reutilizar `ArticleViewer` sem duplicar sua implementação.
  - Permitir inspeção rápida em viewport desktop e mobile.
  - Garantir que a visualização isolada não dependa de autenticação, `BACKEND_ROUTE` ou disponibilidade da API.

### 2.2 Cobertura obrigatória de Markdown

- [ ] Incluir cabeçalhos de níveis variados.
  - Usar `#`, `##` e `###` para validar hierarquia, margens, contraste e âncoras visuais.

- [ ] Incluir parágrafos, ênfase e texto inline.
  - Cobrir texto em **negrito**, *itálico*, `código inline` e combinação de estilos.

- [ ] Incluir blocos de código com sintaxe.
  - Adicionar pelo menos um bloco `typescript` ou `tsx` e um bloco `bash`.
  - Confirmar overflow horizontal, fonte monoespaçada, fundo sólido e contraste adequado.
  - Validar que o marcador de linguagem não cause layout quebrado.

- [ ] Incluir tabela compatível com `remark-gfm`.
  - Usar cabeçalho, múltiplas colunas, alinhamento e linhas suficientes para validar overflow horizontal em mobile.
  - Confirmar que bordas e cabeçalho permanecem legíveis nos temas claro e escuro.

- [ ] Incluir listas ordenadas, não ordenadas e aninhadas.
  - Cobrir pelo menos dois níveis de aninhamento.
  - Validar recuo, marcadores, numeração e espaçamento entre itens.

- [ ] Incluir citações.
  - Usar uma citação simples e, se necessário, uma citação com múltiplos parágrafos.
  - Confirmar borda lateral, fundo e cor de texto sem reduzir a legibilidade.

- [ ] Incluir links internos e externos.
  - Validar texto longo, URLs externas e comportamento de foco/hover.
  - Definir, se necessário, política para `target`, `rel` e sanitização de links.

- [ ] Incluir separadores, imagens e conteúdo incomum.
  - Testar `---`, alt text, links quebrados e texto muito extenso.
  - Definir fallback visual para elementos não suportados ou incompletos.

### 2.3 Critérios de validação visual

- [ ] Verificar hierarquia tipográfica e espaçamento em desktop, tablet e mobile.
- [ ] Confirmar que tabelas e blocos de código não causam overflow horizontal na página inteira.
- [ ] Confirmar estados de foco visíveis para links e controles navegáveis por teclado.
- [ ] Comparar o mock no tema claro e no tema escuro antes de considerar a estilização concluída.

## 3. Correção e adequação do Dark Mode

### 3.1 Editor Markdown

- [ ] Sincronizar o tema do editor com o tema global da aplicação.
  - Detectar o tema ativo pelo mecanismo já usado pelo projeto, como classe `.dark` ou `data-theme="dark"`.
  - Definir `data-color-mode="dark"` no `@uiw/react-md-editor` quando o tema escuro estiver ativo.
  - Definir `data-color-mode="light"` no tema claro, evitando depender de um valor fixo.

- [ ] Corrigir a aparência do wrapper e dos campos do editor.
  - Aplicar bordas, fundo, texto e placeholders coerentes com os tokens CSS/MUI existentes.
  - Verificar toolbar, textarea, preview, menus e estados de foco do `@uiw/react-md-editor`.
  - Evitar que estilos padrão do pacote sobrescrevam o contraste definido pelo tema do projeto.

- [ ] Testar troca de tema com o editor já montado.
  - Confirmar que a troca entre claro e escuro atualiza o editor sem remontagem incorreta ou perda de conteúdo.
  - Confirmar que o valor digitado permanece intacto durante a troca.
  - Validar a rota `/edit/novo` e a edição de um artigo existente.

### 3.2 Visualização Markdown

- [ ] Criar tokens explícitos para a leitura em tema escuro.
  - Usar fundos sólidos cinza escuro ou preto, como tokens equivalentes a `zinc-900`, `zinc-950` ou `var(--code-background)`.
  - Usar texto claro de alto contraste e tons distintos para texto secundário, links, bordas e citações.
  - Garantir que títulos, parágrafos, listas, tabelas, blockquotes, links e código tenham contraste suficiente.

- [ ] Ajustar tabelas e blocos de código no tema escuro.
  - Usar superfícies sólidas diferentes para cabeçalho de tabela, células, bloco de código e código inline.
  - Preservar bordas visíveis sem criar excesso de brilho.
  - Validar conteúdo longo e overflow horizontal em telas pequenas.

- [ ] Corrigir estados interativos no tema escuro.
  - Definir hover, focus-visible e visited sem depender apenas de mudança sutil de luminosidade.
  - Garantir que links mantenham indicação visual clara e acessível.
  - Confirmar que seleção de texto não produz texto ilegível.

### 3.3 Regra visual obrigatória

- [ ] Garantir que toda a correção do Dark Mode utilize cores sólidas e de alto contraste.
  - Usar fundos cinza escuro/preto e superfícies sólidas do Tailwind/MUI ou tokens equivalentes do projeto.
  - É expressamente proibido usar gradientes para simular profundidade ou corrigir contraste.
  - Não usar efeitos que deixem a interface lavada, acinzentada ou ilegível.
  - Revisar editor, viewer, tabelas, blocos de código, alerts, botões e estados de foco sob essa regra.

- [ ] Fazer uma auditoria de contraste.
  - Medir texto normal, texto grande, links, placeholders, bordas funcionais e controles.
  - Corrigir qualquer combinação que não seja legível em tema escuro.
  - Registrar as decisões finais nos tokens de `globals.css`, evitando cores isoladas espalhadas pelos componentes.

## 4. Validação e entrega

- [ ] Executar `npx tsc --noEmit` após a refatoração.
- [ ] Executar lint nos componentes, páginas e rotas modificados.
- [ ] Executar `npm run build` para validar App Router, imports client-only e rotas dinâmicas.
- [ ] Testar manualmente `/edit/novo`, `/edit/[id]` e `/page/[id]` com backend disponível e indisponível.
- [ ] Testar o mock do viewer nos temas claro e escuro em viewport desktop e mobile.
- [ ] Confirmar que não foram introduzidos gradientes no editor, viewer ou tokens do Dark Mode.
- [ ] Atualizar a documentação de instalação, contrato da API e estratégia de temas após a conclusão.
