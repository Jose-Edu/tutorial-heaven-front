import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import type { Article } from "@/lib/articles";

type ArticleViewerProps = {
  article: Article;
};

const markdownComponents: Components = {
  a: ({ href, children }) => <a className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring visited:text-accent-foreground" href={href} rel={href?.startsWith("http") ? "noreferrer" : undefined} target={href?.startsWith("http") ? "_blank" : undefined}>{children}</a>,
  code: ({ children, className }) => <code className={className ?? "rounded bg-surface-muted px-1.5 py-0.5 font-mono text-sm text-foreground"}>{children}</code>,
  pre: ({ children }) => <pre className="overflow-x-auto rounded-lg bg-code-background p-5 text-sm leading-6 text-code-foreground">{children}</pre>,
  table: ({ children }) => <div className="overflow-x-auto"><table>{children}</table></div>,
};

export function ArticleViewer({ article }: ArticleViewerProps) {
  return (
    <article className="mx-auto w-full max-w-4xl animate-float-in">
      <header className="border-b border-border pb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Artigo</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{article.title}</h1>
        {article.description ? <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{article.description}</p> : null}
      </header>

      <div className="article-content mt-10 max-w-none text-base leading-8 text-foreground">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {article.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}