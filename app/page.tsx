import { AuthPanel, PageContainer } from "@/components";

export default function Home() {
  return (
    <PageContainer className="py-10 sm:py-14 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="rounded-2xl border border-border bg-surface p-8 shadow-sm sm:p-10 lg:p-12">
          <div className="max-w-xl animate-float-in">
            <span className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-muted">
              Tutorial Heaven
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Entre na sua conta ou crie uma nova em poucos segundos.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg">
              Acesse sua área com uma interface simples, clara e pronta para uso.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">Acesso rápido</p>
                <p className="mt-2 text-sm leading-6 text-muted">Faça login ou cadastre-se sem distrações.</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">Experiência leve</p>
                <p className="mt-2 text-sm leading-6 text-muted">Tudo o que você precisa em uma tela objetiva.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="animate-float-in">
          <AuthPanel />
        </div>
      </div>
    </PageContainer>

    
  );

  
}