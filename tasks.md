# Plano de integração do front-end com a API Laravel

## 1. Cliente HTTP e autenticação Sanctum (Bearer token via cookie HttpOnly)

- [x] Centralizar chamadas HTTP em um cliente tipado que use exclusivamente as rotas definidas em `routes/api.php`, com JSON, tratamento uniforme de respostas e suporte a cancelamento.
- [x] Configurar a URL base para o prefixo padrão `/api` do Laravel; usar os endpoints de autenticação `/api/login`, `/api/register`, `/api/logout` e `/api/user`, e os endpoints de recursos sob `/api/v1`.
- [x] Configurar a autenticação por Bearer token confirmado: receber o token no login, guardá-lo em cookie `HttpOnly` no proxy Next.js e enviá-lo ao Laravel pelo cabeçalho `Authorization`, sem persistir o token no `localStorage`.
- [x] Preservar corretamente o cookie seguro e os cabeçalhos necessários no proxy do Next.js; limpar o token quando logout ou resposta `401` invalidar a autenticação.
- [x] Implementar login via `POST /api/login` e registro via `POST /api/register`, com validação de formulário, estados de envio e mensagens de erro/sucesso.
- [x] Implementar logout via `POST /api/logout`, atualizando o estado local somente após o tratamento adequado da resposta do servidor.
- [x] Criar um estado global tipado para o usuário autenticado consultando `GET /api/user`; representar estados de inicialização, autenticado, não autenticado e erro de consulta.
- [x] Tratar `401` como sessão ausente/expirada e `403` como falta de autorização, sem mascarar falhas de rede ou erros do servidor.
- [ ] Testar os fluxos de login, registro, consulta de usuário e logout com sessão válida, expirada e indisponível.

## 2. CRUD de artigos (`/api/v1/articles`)

### Contrato e conteúdo Markdown em Base64

- [x] Implementar exclusivamente os endpoints definidos no contrato: `GET /api/v1/articles`, `GET /api/v1/articles/{id}`, `POST /api/v1/articles`, `PATCH /api/v1/articles/{id}` e `DELETE /api/v1/articles/{id}`.
- [x] Usar `content` como campo do artigo no payload e codificar o Markdown em Base64 antes de enviar os bodies de criação e atualização; usar `PATCH` para atualização.
- [x] Criar funções tipadas e centralizadas para converter texto UTF-8 em Base64 e Base64 em texto UTF-8, usando conversão compatível com caracteres acentuados, símbolos e outros caracteres fora de ASCII.
- [x] Decodificar `content` recebido nas respostas de listagem e detalhe antes de fornecer os dados ao editor Markdown ou ao visualizador.
- [x] Evitar codificação/decodificação duplicada: manter o conteúdo em texto puro na interface e aplicar Base64 somente na fronteira HTTP.
- [x] Tratar conteúdo Base64 ausente ou inválido com erro explícito, sem exibir conteúdo corrompido como se fosse válido.
- [x] Tipar os modelos de request e response de acordo com os campos efetivamente acordados com o backend, incluindo suporte aos envelopes de lista Laravel e conteúdo paginado.

### Leitura: listagem e visualização

- [x] Substituir dados simulados do dashboard e da busca por listagem autenticada `GET /api/v1/articles`.
- [x] Exibir Skeletons/Spinners durante o carregamento, estado vazio quando não houver artigos e feedback com opção de nova tentativa em caso de falha recuperável.
- [x] Carregar artigos por `GET /api/v1/articles/{id}` e passar o conteúdo Markdown decodificado para o visualizador.
- [x] Exibir estado de carregamento na listagem, visualização e edição enquanto os dados são buscados.
- [x] Tratar `401`, `403`, `404`, erros `5xx` e falhas de rede com estados e mensagens adequados.
- [x] Cancelar requisições obsoletas ao trocar de artigo ou desmontar a tela.

### Criação, edição e exclusão

- [x] Integrar a rota de criação `/edit/novo` ao `POST /api/v1/articles`, enviando o conteúdo Markdown codificado em Base64.
- [x] Integrar a rota `/edit/[id]` ao endpoint de detalhe e ao método `PATCH` de atualização, codificando `content` em Base64 antes do envio.
- [x] Mapear erros HTTP `422` do Laravel para os campos do formulário, preservar o texto Markdown digitado e permitir sua correção sem perda de conteúdo.
- [x] Após criação ou edição confirmada, apresentar feedback de sucesso e oferecer navegação para a listagem atualizada; tratar erros HTTP como falhas.
- [x] Implementar exclusão por `DELETE /api/v1/articles/{id}` com confirmação, estado de envio, prevenção de ações duplicadas e atualização da interface após confirmação do servidor.
- [x] Exibir ações do CRUD na área administrativa autenticada e tratar `401` e `403` a partir da resposta do backend.
- [x] Tratar sucesso, `401`, `403`, `404`, `422`, `5xx`, resposta malformada e falha de rede nos fluxos de artigos.

## 3. Consulta de tags (`/api/v1/tags`)

- [x] Usar tags exclusivamente para leitura e preenchimento dos seletores no formulário de artigos, por meio de `GET /api/v1/tags`.
- [x] Consultar `GET /api/v1/tags/steps` para obter as etapas do seletor e renderizá-las conforme os dados retornados.
- [x] Tipar e adaptar as respostas de tags e etapas ao formato fornecido pelo backend; não manter listas simuladas como fonte de dados.
- [x] Implementar estados de carregamento, vazio e erro para tags/etapas, incluindo feedback acessível e opção de nova tentativa.
- [ ] Integrar os IDs selecionados ao payload do artigo somente conforme o formato de associação definido pelo contrato do backend.
- [x] Não implementar criação, edição ou exclusão de tags, nem chamadas mutáveis ou endpoints além das rotas de leitura acima.

## 4. UI/UX e Design System (regras invioláveis)

- [x] Revisar autenticação, dashboard, listagem, visualização, criação/edição, exclusão e seletores de tags mantendo consistência visual.
- [x] Usar cores sólidas e alto contraste; não usar gradientes em fundos, botões, cards, alertas ou elementos decorativos.
- [x] Definir modo escuro com fundos, superfícies, bordas, textos, campos e estados de foco claramente distinguíveis, sem aparência “lavada”.
- [x] Padronizar feedbacks de sucesso/erro por toasts ou alertas acessíveis e usar modal de confirmação para exclusão.
- [x] Padronizar estados de loading, disabled, hover, foco e erro dos formulários e ações do CRUD.
- [x] Associar erros de validação aos campos e anunciar estados/mensagens para leitores de tela; não depender somente de cor para comunicar estado.
- [x] Validar responsividade, navegação por teclado e consistência dos componentes MUI/Tailwind em modo claro e escuro.

## 5. Validação final

- [ ] Testar os fluxos de autenticação e todas as operações de artigos contra o backend Laravel.
- [x] Validar conversão Base64 com Markdown contendo acentos, emojis, símbolos, quebras de linha e texto vazio, confirmando round-trip UTF-8 sem alteração.
- [x] Confirmar por inspeção e build que listagem, detalhe, editor e visualizador operam com conteúdo Base64 na fronteira HTTP e Markdown em texto puro na interface.
- [ ] Verificar que as tags vêm exclusivamente dos endpoints GET do contrato e que não há ações ou chamadas mutáveis de tags.
- [ ] Executar lint, verificação de tipos e testes relevantes; corrigir regressões da integração.
