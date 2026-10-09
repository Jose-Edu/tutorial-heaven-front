import { PageContainer } from "@/components";
import Link from "next/link";

export default function OnboardingPage() {
  return (
    <PageContainer className="py-10 sm:py-14">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Tags dos artigos</h1>
        <p className="text-muted mt-2">
          As tags são consultadas e selecionadas diretamente no formulário de criação ou edição de cada artigo.
        </p>
      </div>

      <div className="flex justify-center">
        <Link
          href="/edit/novo"
          className="rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Criar artigo
        </Link>
      </div>
    </PageContainer>
  );
}