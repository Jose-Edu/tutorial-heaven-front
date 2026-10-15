import { ArticleSearchResults } from "@/components/ArticleSearchResults";
import { PageContainer } from "@/components/PageContainer";
import { SectionWrapper } from "@/components/SectionWrapper";

type SearchPageProps = {
    searchParams: Promise<{ q?: string | string[] }>;
};

export default async function Search({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const queryValue = Array.isArray(params.q) ? params.q[0] : params.q;
    const term = queryValue?.trim() ?? "";
    return (
        <PageContainer>
            <SectionWrapper>
                <header className="mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary">Busca</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                        {term ? `Resultados para: ${term}` : "Resultados da busca"}
                    </h1>
                </header>

                <ArticleSearchResults term={term} />
            </SectionWrapper>
        </PageContainer>
    );
}