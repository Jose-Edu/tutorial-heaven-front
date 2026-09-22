import { AuthPanel, PageContainer } from "@/components";

export default function Home() {
  return (
    <PageContainer className="py-10 sm:py-14 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="relative overflow-hidden rounded-[2rem] border border-border bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_35%),linear-gradient(135deg,_var(--surface),_var(--surface-muted))] p-8 shadow-[0_24px_80px_rgba(24,24,27,0.08)] sm:p-10 lg:p-12">
          <div className="absolute right-0 top-0 size-40 translate-x-1/3 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-xl animate-float-in">
            <span className="inline-flex rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-muted">
              Tutorial Heaven
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Login e cadastro com a estrutura visual já existente.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg">
              A tela usa o mesmo sistema visual do restante do app e envia as credenciais para o backend Laravel por meio de rotas locais do Next.js.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/80 p-4">
                <p className="text-sm font-semibold text-foreground">Auth pronta</p>
                <p className="mt-2 text-sm leading-6 text-muted">Entrar, cadastrar, e passar a resposta do backend adiante sem expor a URL no cliente.</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/80 p-4">
                <p className="text-sm font-semibold text-foreground">Layout consistente</p>
                <p className="mt-2 text-sm leading-6 text-muted">Header, footer e estilo Material seguem a base já estabelecida no projeto.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="animate-float-in" style={{ animationDelay: "120ms" }}>
          <AuthPanel />
        </div>
      </div>
    </PageContainer>

    
  );

  
}