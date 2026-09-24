import type { Article } from "@/lib/articles";

export const articleViewerMock: Article = {
  id: "markdown-viewer-preview",
  title: "Um guia prático para escrever Markdown que escala",
  description: "Fixture visual para validar tipografia, tabelas, código, listas e estados de contraste do ArticleViewer.",
  createdAt: "2026-09-24T09:00:00.000Z",
  updatedAt: "2026-09-24T12:30:00.000Z",
  content: `# Escrevendo documentação que ajuda de verdade

Uma boa documentação reduz dúvidas e deixa decisões técnicas **fáceis de encontrar**. Ela pode combinar texto, exemplos e links sem perder ritmo.

## O fluxo recomendado

1. Comece pelo resultado esperado.
2. Mostre o menor exemplo funcional.
3. Explique as decisões importantes:
   - limites da solução;
   - comportamento em erro;
   - próximos passos para quem lê.

### Checklist de implementação

- [x] Contrato definido
- [x] Exemplo executável
- [ ] Testes de integração
  - [ ] Resposta de sucesso
  - [ ] Resposta inválida

> "A documentação é parte do produto, não um comentário deixado para depois."

## Código com sintaxe

\`\`\`ts
type Article = {
  id: string;
  title: string;
  content: string;
};

export function getTitle(article: Article) {
  return article.title.trim();
}
\`\`\`

\`\`\`bash
npm run lint
npm run build
\`\`\`

## Comparando formatos

| Formato | Melhor uso | Observação |
| --- | --- | --- |
| Markdown | Conteúdo editorial | Fácil de revisar |
| JSON | Integração de dados | Estrutura explícita |
| HTML | Apresentação final | Mais controle visual |

Links úteis: [documentação do Next.js](https://nextjs.org/docs) e [especificação GFM](https://github.github.com/gfm/).

---

O visualizador deve continuar legível quando a linha do código for longa, quando a tabela ultrapassar a largura do celular e quando o tema escuro estiver ativo.
`,
};