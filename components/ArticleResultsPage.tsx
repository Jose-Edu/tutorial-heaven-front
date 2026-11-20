import { ArticleSearchResults, type ArticleResultsSource } from "@/components/ArticleSearchResults";
import { PageContainer } from "@/components/PageContainer";
import { SectionWrapper } from "@/components/SectionWrapper";

type ArticleResultsPageProps = {
  term: string;
  source?: ArticleResultsSource;
};

export function ArticleResultsPage({ term, source = "search" }: ArticleResultsPageProps) {
  const isRecommended = source === "recommended";

  return (
    <PageContainer>
      <SectionWrapper>
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            {isRecommended ? "Recomendados" : "Busca"}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {isRecommended
              ? "Artigos recomendados"
              : term
                ? `Resultados para: ${term}`
                : "Resultados da busca"}
          </h1>
        </header>

        <ArticleSearchResults term={term} source={source} />
      </SectionWrapper>
    </PageContainer>
  );
}
