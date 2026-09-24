import { ArticleEditor } from "@/components/ArticleEditor";

export default async function Edit({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return <ArticleEditor key={id} id={id} />;
}