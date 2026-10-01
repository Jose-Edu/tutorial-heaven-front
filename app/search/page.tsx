import { FeedbackState } from "@/components/FeedbackState";
import { PageContainer } from "@/components/PageContainer";
import { SearchResultCard } from "@/components/SearchResultCard";
import { SectionWrapper } from "@/components/SectionWrapper";
import type { ArticleMetadata } from "@/lib/articles";

const mockResults: ArticleMetadata[] = [
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
    {
        id: "api-routes",
        title: "Criando endpoints no Next.js",
        description: "Estruture rotas de API no App Router e conecte sua interface a dados reais.",
        createdAt: null,
        updatedAt: null,
    },
    {
        id: "design-systems",
        title: "Fundamentos de um design system",
        description: "Defina tokens, componentes e padrões visuais para manter seu produto consistente.",
        createdAt: null,
        updatedAt: null,
    },
];

type SearchPageProps = {
    searchParams: Promise<{ q?: string | string[] }>;
};

export default async function Search({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const queryValue = Array.isArray(params.q) ? params.q[0] : params.q;
    const term = queryValue?.trim() ?? "";
    const normalizedTerm = term.toLocaleLowerCase("pt-BR");
    const results = normalizedTerm
        ? mockResults.filter(({ title, description }) =>
                `${title} ${description}`.toLocaleLowerCase("pt-BR").includes(normalizedTerm),
            )
        : [];

    return (
        <PageContainer>
            <SectionWrapper>
                <header className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary">Busca</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                        {term ? `Resultados para: ${term}` : "Resultados da busca"}
                    </h1>
                </header>

                {results.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {results.map((result) => (
                            <SearchResultCard key={result.id} {...result} />
                        ))}
                    </div>
                ) : (
                    <FeedbackState
                        title="Nenhum resultado encontrado"
                        description={
                            term
                                ? `Não encontramos tutoriais para "${term}". Tente buscar por outro termo.`
                                : "Digite um termo na busca para encontrar tutoriais."
                        }
                    />
                )}
            </SectionWrapper>
        </PageContainer>
    );
}