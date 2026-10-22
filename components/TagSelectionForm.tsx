"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "@/components/AuthProvider";
import { getTagSteps, getTags, syncUserTags, type TagOption, type TagStep } from "@/lib/tags";
import { setNeedsOnboarding } from "@/lib/mock-user-state";

const DEFAULT_STEPS: TagStep[] = [
  { id: "step_1", label: "Área de Atuação", aliases: ["step_1", "area", "área de atuação"] },
  { id: "step_2", label: "Tecnologias", aliases: ["step_2", "technology", "tecnologias"] },
  { id: "step_3", label: "Nível de Experiência", aliases: ["step_3", "seniority", "nível de experiência"] },
];

const DEFAULT_TAGS: TagOption[] = [
  { id: "1", name: "Frontend", groupIds: ["area"] },
  { id: "2", name: "Backend", groupIds: ["area"] },
  { id: "3", name: "Fullstack", groupIds: ["area"] },
  { id: "4", name: "React / Next.js", groupIds: ["technology"] },
  { id: "5", name: "Node.js / Express", groupIds: ["technology"] },
  { id: "6", name: "PHP / Laravel", groupIds: ["technology"] },
  { id: "7", name: "Júnior", groupIds: ["seniority"] },
  { id: "8", name: "Pleno", groupIds: ["seniority"] },
  { id: "9", name: "Sénior", groupIds: ["seniority"] },
];

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR");
}

type TagSelectionFormProps = {
  selectedTagIds?: string[];
  onChange?: (nextIds: string[]) => void;
};

export function TagSelectionForm({ selectedTagIds: selectedTagIdsProp, onChange }: TagSelectionFormProps) {
  const router = useRouter();
  const { user, patchUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  // No onboarding as tags já atribuídas ao usuário entram pré-selecionadas.
  const [internalSelectedTagIds, setInternalSelectedTagIds] = useState<string[]>(() =>
    (user?.tags ?? []).map((tag) => String(tag.id)),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [steps, setSteps] = useState<TagStep[]>(DEFAULT_STEPS);
  const [tags, setTags] = useState<TagOption[]>(DEFAULT_TAGS);

  const isControlled = Array.isArray(selectedTagIdsProp) && typeof onChange === "function";
  const selectedTagIds = isControlled ? selectedTagIdsProp : internalSelectedTagIds;

  useEffect(() => {
    const controller = new AbortController();

    async function loadTags() {
      setIsLoadingData(true);
      setLoadError(null);

      try {
        const [apiSteps, apiTags] = await Promise.all([
          getTagSteps(controller.signal),
          getTags(controller.signal),
        ]);

        if (apiSteps.length > 0) {
          setSteps(apiSteps);
        }

        if (apiTags.length > 0) {
          setTags(apiTags);
        }
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Não foi possível carregar as tags.");
      } finally {
        setIsLoadingData(false);
      }
    }

    void loadTags();

    return () => controller.abort();
  }, []);

  const activeStep = steps[currentStep] ?? steps[0];

  const matchingTags = useMemo(() => {
    if (!activeStep) {
      return [] as TagOption[];
    }

    const allowedAliases = new Set(activeStep.aliases.map(normalize));
    return tags.filter((tag) => tag.groupIds.some((groupId) => allowedAliases.has(normalize(groupId))));
  }, [activeStep, tags]);

  function toggleTag(id: string) {
    const nextIds = selectedTagIds.includes(id)
      ? selectedTagIds.filter((tagId) => tagId !== id)
      : [...selectedTagIds, id];

    if (isControlled && onChange) {
      onChange(nextIds);
      return;
    }

    setInternalSelectedTagIds(nextIds);
  }

  async function handleSubmit() {
    if (!user) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const syncedTags = await syncUserTags(selectedTagIds);

      patchUser({ tags: syncedTags });

      setNeedsOnboarding(user, false);
      router.push("/dashboard");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Não foi possível guardar as tags.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-lg font-semibold text-foreground">Define as tuas tags</h2>
      <p className="mt-1 text-sm text-muted">Seleciona as tags que melhor representam o teu perfil.</p>

      {loadError ? <Alert severity="warning" sx={{ mt: 2 }}>{loadError}</Alert> : null}
      {submitError ? <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert> : null}

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Etapas das tags">
        {steps.map((step, index) => (
          <Button
            key={step.id}
            type="button"
            variant={currentStep === index ? "contained" : "outlined"}
            onClick={() => setCurrentStep(index)}
            aria-current={currentStep === index ? "step" : undefined}
            sx={{ textTransform: "none" }}
          >
            {step.label}
          </Button>
        ))}
      </div>

      {isLoadingData ? (
        <div className="mt-5 flex justify-center" role="status" aria-label="Carregando tags">
          <CircularProgress size={24} />
        </div>
      ) : matchingTags.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-3" role="group" aria-label={activeStep?.label ?? "Tags"}>
          {matchingTags.map((tag) => {
            const isSelected = selectedTagIds.includes(tag.id);

            return (
              <button
                key={tag.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleTag(tag.id)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary"
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      ) : (
        <Alert severity="info" sx={{ mt: 3 }}>Não há tags nesta etapa.</Alert>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
        <Button
          type="button"
          disabled={currentStep === 0}
          onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))}
        >
          Voltar
        </Button>

        {currentStep < steps.length - 1 ? (
          <Button
            type="button"
            onClick={() => setCurrentStep((step) => Math.min(step + 1, steps.length - 1))}
          >
            Avançar
          </Button>
        ) : (
          <Button
            type="button"
            variant="contained"
            disabled={isSubmitting || (!isControlled && !user) || selectedTagIds.length === 0}
            onClick={isControlled ? undefined : handleSubmit}
          >
            {isControlled ? "Concluir seleção" : isSubmitting ? "A guardar..." : "Finalizar"}
          </Button>
        )}
      </div>
    </section>
  );
}

export default TagSelectionForm;
