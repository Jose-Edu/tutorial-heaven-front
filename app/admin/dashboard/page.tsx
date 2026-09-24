import Button from "@mui/material/Button";
import { PageContainer } from "@/components/PageContainer";
import { SearchResultCard } from "@/components/SearchResultCard";
import { SectionWrapper } from "@/components/SectionWrapper";
import type { ArticleMetadata } from "@/lib/articles";

const latestArticles: ArticleMetadata[] = [
    {
        id: "nextjs-app-router",
        title: "Construindo rotas com o App Router",
        description: "Aprenda a organizar páginas, layouts e navegação em projetos modernos com Next.js.",
        createdAt: null,
        updatedAt: null,
    },
    {
        id: "tailwind-responsive",
        title: "Interfaces responsivas com Tailwind CSS",
        description: "Use grids, flexbox e breakpoints para criar experiências consistentes em qualquer tela.",
        createdAt: null,
        updatedAt: null,
    },
    {
        id: "mui-components",
        title: "Componentes acessíveis com MUI",
        description: "Combine componentes prontos e estilos personalizados para acelerar seu desenvolvimento.",
        createdAt: null,
        updatedAt: null,
    },
    {
        id: "typescript-basics",
        title: "TypeScript para interfaces confiáveis",
        description: "Veja como tipar propriedades, eventos e dados para reduzir erros no frontend.",
        createdAt: null,
        updatedAt: null,
    },
];

export default function Dashboard() {
    return (
        <PageContainer>
            <SectionWrapper>
                <section className="mb-10 flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Administração</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                        <p className="mt-3 max-w-2xl text-muted">
                            Gerencie os conteúdos publicados e acompanhe os artigos mais recentes.
                        </p>
                    </div>
                    <Button
                        href="/edit/novo"
                        variant="contained"
                        sx={{
                            alignSelf: "flex-start",
                            backgroundColor: "var(--primary)",
                            borderRadius: "6px",
                            boxShadow: "none",
                            color: "var(--primary-foreground)",
                            flexShrink: 0,
                            padding: "10px 18px",
                            textTransform: "none",
                            "&:hover": {
                                backgroundColor: "var(--accent-foreground)",
                                boxShadow: "none",
                            },
                            "@media (min-width: 640px)": {
                                alignSelf: "auto",
                            },
                        }}
                    >
                        Criar Artigo
                    </Button>
                </section>

                <div className="mb-6 flex items-baseline justify-between gap-4">
                    <h2 className="text-xl font-semibold text-foreground">Últimos artigos criados</h2>
                    <span className="text-sm text-muted">{latestArticles.length} artigos</span>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {latestArticles.map((article) => (
                        <SearchResultCard key={article.id} {...article} />
                    ))}
                </div>
            </SectionWrapper>
        </PageContainer>
    );
}