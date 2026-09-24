import { ArticleReader } from "@/components/ArticleReader";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ArticleReader key={id} id={id} />;
}