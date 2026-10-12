"use client";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { PageContainer } from "@/components/PageContainer";
import { ArticleManagement } from "@/components/ArticleManagement";
import { SectionWrapper } from "@/components/SectionWrapper";
import { useAuth } from "@/components/AuthProvider";

export default function Dashboard() {
    const { user } = useAuth();
    const canManageArticles = user?.role === "admin";

    return (
        <PageContainer>
            <SectionWrapper>
                <section className="mb-10 flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Administração</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                        <p className="mt-3 max-w-2xl text-muted">
                            Gerencie os conteúdos publicados e acompanhe os artigos mais recentes.
                        </p>
                    </div>
                    {canManageArticles ? (
                        <Button
                            href="/edit/novo"
                            variant="contained"
                            sx={{
                                alignSelf: "flex-start",
                                backgroundColor: "var(--primary)",
                                borderRadius: "6px",
                                boxShadow: "none",
                                color: "var(--primary-foreground)",
                                flexShrink: 0,
                                padding: "10px 18px",
                                textTransform: "none",
                                "&:hover": {
                                    backgroundColor: "var(--primary-hover)",
                                    boxShadow: "none",
                                },
                                "@media (min-width: 640px)": {
                                    alignSelf: "auto",
                                },
                            }}
                        >
                            Criar Artigo
                        </Button>
                    ) : null}
                </section>

                {!canManageArticles ? (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Você precisa de permissão de administrador para criar ou editar artigos.
                    </Alert>
                ) : null}

                <div className="mb-6 flex items-baseline justify-between gap-4">
                    <h2 className="text-xl font-semibold text-foreground">Últimos artigos criados</h2>
                </div>

                <ArticleManagement />
            </SectionWrapper>
        </PageContainer>
    );
}