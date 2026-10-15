"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TagSelectionForm from "@/components/TagSelectionForm";
import { PageContainer } from "@/components";
import { getNeedsOnboarding, getStoredAuthUser } from "@/lib/mock-user-state";

export default function OnboardingPage() {
  const router = useRouter();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    const currentUser = getStoredAuthUser();

    if (!currentUser) {
      router.replace("/");
      return;
    }

    if (!getNeedsOnboarding(currentUser)) {
      router.replace("/search");
      return;
    }

    setIsCheckingAccess(false);
  }, [router]);

  if (isCheckingAccess) {
    return null;
  }

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