import { ArticleViewer } from "@/components/ArticleViewer";
import { PageContainer } from "@/components/PageContainer";
import { SectionWrapper } from "@/components/SectionWrapper";
import { articleViewerMock } from "@/lib/article-viewer-mock";

export default function ViewerPreview() {
  return <PageContainer><SectionWrapper><ArticleViewer article={articleViewerMock} /></SectionWrapper></PageContainer>;
}