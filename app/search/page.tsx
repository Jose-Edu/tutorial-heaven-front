import { ArticleResultsPage } from "@/components/ArticleResultsPage";

type SearchPageProps = {
    searchParams: Promise<{ q?: string | string[] }>;
};

export default async function Search({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const queryValue = Array.isArray(params.q) ? params.q[0] : params.q;
    const term = queryValue?.trim() ?? "";
    return <ArticleResultsPage term={term} />;
}