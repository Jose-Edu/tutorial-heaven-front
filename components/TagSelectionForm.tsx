"use client";

import { useState } from "react";

interface Tag {
  id: number;
  name: string;
  category: "area" | "technology" | "seniority";
}

const AVAILABLE_TAGS: Tag[] = [

  { id: 1, name: "Frontend", category: "area" },
  { id: 2, name: "Backend", category: "area" },
  { id: 3, name: "Fullstack", category: "area" },

  { id: 4, name: "React / Next.js", category: "technology" },
  { id: 5, name: "Node.js / Express", category: "technology" },
  { id: 6, name: "PHP / Laravel", category: "technology" },

  { id: 7, name: "Júnior", category: "seniority" },
  { id: 8, name: "Pleno", category: "seniority" },
  { id: 9, name: "Sénior", category: "seniority" },
];

export default function TagSelectionForm() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const steps = [
    { title: "Área de Atuação", category: "area" },
    { title: "Tecnologias", category: "technology" },
    { title: "Nível de Experiência", category: "seniority" },
  ];

  const toggleTag = (id: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((tagId) => tagId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/user/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ tag_ids: selectedTagIds }),
      });

      if (response.ok) {
        alert("Tags salvas com sucesso!");
      } else {
        alert("Erro ao salvar as tags.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategory = steps[currentStep - 1].category;
  const filteredTags = AVAILABLE_TAGS.filter(
    (tag) => tag.category === currentCategory
  );

  return (
    <div className="max-w-xl mx-auto p-6 bg-surface border border-border rounded-xl shadow-md">
      {/* Indicador de Passos */}
      <div className="flex justify-between items-center mb-6">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          return (
            <div key={step.category} className="flex items-center gap-2">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep === stepNumber
                    ? "bg-primary text-primary-foreground"
                    : currentStep > stepNumber
                    ? "bg-muted text-foreground"
                    : "bg-border text-muted"
                }`}
              >
                {stepNumber}
              </span>
              <span className="text-xs text-muted font-medium hidden sm:inline">
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Título do Passo Atual */}
      <h2 className="text-xl font-semibold text-foreground mb-4">
        {steps[currentStep - 1].title}
      </h2>

      {/* Lista de Tags do Passo */}
      <div className="flex flex-wrap gap-3 mb-8">
        {filteredTags.map((tag) => {
          const isSelected = selectedTagIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-primary"
              }`}
            >
              {tag.name}
            </button>
          );
        })}
      </div>

      {/* Botões de Navegação */}
      <div className="flex justify-between items-center border-t border-border pt-4">
        <button
          type="button"
          onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 text-sm text-muted hover:text-foreground disabled:opacity-40"
        >
          Voltar
        </button>

        {currentStep < steps.length ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => prev + 1)}
            className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90"
          >
            Avançar
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || selectedTagIds.length === 0}
            className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "A guardar..." : "Finalizar"}
          </button>
        )}
      </div>
    </div>
  );
}