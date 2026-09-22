import TagSelectionForm from "@/components/TagSelectionForm";
import { PageContainer } from "@/components";

export default function OnboardingPage() {
  return (
    <PageContainer className="py-10 sm:py-14">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Define o teu perfil dev
        </h1>
        <p className="text-muted mt-2">
          Seleciona as tuas tecnologias e competências para personalizarmos a tua experiência.
        </p>
      </div>

      <TagSelectionForm />
    </PageContainer>
  );
}