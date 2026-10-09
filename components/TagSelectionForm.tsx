"use client";

import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import { getTagSteps, getTags, type TagOption, type TagStep } from "@/lib/tags";

type TagSelectionFormProps = {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
};

export function TagSelectionForm({ selectedTagIds, onChange }: TagSelectionFormProps) {
  const [steps, setSteps] = useState<TagStep[]>([]);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([getTagSteps(controller.signal), getTags(controller.signal)]).then(
      ([loadedSteps, loadedTags]) => {
        if (controller.signal.aborted) return;
        setSteps(loadedSteps);
        setTags(loadedTags);
      },
      (reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Não foi possível carregar as opções de tags.");
        }
      },
    ).finally(() => {
      if (!controller.signal.aborted) setIsLoading(false);
    });

    return () => controller.abort();
  }, [retryKey]);

  function toggleTag(tagId: string) {
    onChange(
      selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((selectedId) => selectedId !== tagId)
        : [...selectedTagIds, tagId],
    );
  }

  function retryLoading() {
    setIsLoading(true);
    setError(null);
    setRetryKey((key) => key + 1);
  }

  if (isLoading) {
    return (
      <section className="rounded-lg border border-border bg-card p-5" aria-label="Carregando opções de tags">
        <Skeleton width="40%" height={32} />
        <Skeleton width="100%" height={48} />
        <Skeleton width="80%" height={48} />
      </section>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={<Button color="inherit" onClick={retryLoading}>Tentar novamente</Button>}>
        {error}
      </Alert>
    );
  }

  if (steps.length === 0 || tags.length === 0) {
    return <Alert severity="info">Não há opções de tags disponíveis.</Alert>;
  }

  const activeStep = steps[currentStep];
  const matchingTags = tags.filter((tag) => {
    if (tag.groupIds.length === 0) return steps.length === 1;
    return tag.groupIds.some((groupId) => activeStep.aliases.includes(groupId));
  });

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-lg font-semibold text-foreground">Tags do artigo</h2>
      <p className="mt-1 text-sm text-muted">Selecione as tags disponíveis para este artigo.</p>

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

      {matchingTags.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-3" role="group" aria-label={activeStep.label}>
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

      <div className="mt-6 flex justify-between border-t border-border pt-4">
        <Button type="button" disabled={currentStep === 0} onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))}>
          Voltar
        </Button>
        <Button
          type="button"
          disabled={currentStep === steps.length - 1}
          onClick={() => setCurrentStep((step) => Math.min(step + 1, steps.length - 1))}
        >
          Avançar
        </Button>
      </div>
    </section>
  );
}
