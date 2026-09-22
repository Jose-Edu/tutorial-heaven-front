"use client";

import { FormEvent, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

type AuthMode = "login" | "register";

type AlertState = {
  type: "success" | "error";
  message: string;
} | null;

type FormState = {
  name: string;
  email: string;
  password: string;
};

const emptyFormState: FormState = {
  name: "",
  email: "",
  password: "",
};

async function readResponseMessage(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json().catch(() => null)) as { message?: string; error?: string; errors?: Record<string, string[]> } | null;

    if (payload?.message) {
      return payload.message;
    }

    if (payload?.error) {
      return payload.error;
    }

    const fieldErrors = payload?.errors;
    const firstFieldError = fieldErrors ? Object.values(fieldErrors).flat()[0] : undefined;

    if (firstFieldError) {
      return firstFieldError;
    }
  }

  return response.statusText || "O servidor respondeu com um erro inesperado.";
}

export function AuthPanel() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [formState, setFormState] = useState<FormState>(emptyFormState);
  const [alertState, setAlertState] = useState<AlertState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof FormState, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAlertState(null);
    setIsSubmitting(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = mode === "login"
        ? {
            email: formState.email,
            password: formState.password,
          }
        : {
            name: formState.name,
            email: formState.email,
            password: formState.password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setAlertState({ type: "error", message: await readResponseMessage(response) });
        return;
      }

      setAlertState({
        type: "success",
        message: mode === "login" ? "Login realizado com sucesso." : "Cadastro realizado com sucesso.",
      });
      setFormState((current) => ({ ...current, password: "" }));
    } catch {
      setAlertState({
        type: "error",
        message: "Não foi possível conectar ao backend agora. Verifique o BACKEND_ROUTE.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card
      elevation={0}
      className="overflow-hidden border border-border bg-surface/95 shadow-[0_24px_80px_rgba(24,24,27,0.08)] backdrop-blur"
      sx={{ borderRadius: 6 }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3}>
          <div>
            <Typography variant="overline" sx={{ color: "var(--primary)", letterSpacing: "0.22em" }}>
              Acesso
            </Typography>
            <Typography variant="h4" component="h2" sx={{ mt: 0.5, fontWeight: 700, color: "var(--foreground)" }}>
              Entre ou crie sua conta
            </Typography>
            <Typography sx={{ mt: 1, color: "var(--muted)" }}>
              A interface já conversa com o backend Laravel via rotas locais do Next.js.
            </Typography>
          </div>

          <Tabs
            value={mode}
            onChange={(_, nextMode: AuthMode) => {
              setMode(nextMode);
              setAlertState(null);
            }}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
            sx={{ minHeight: 44 }}
          >
            <Tab value="login" label="Entrar" sx={{ minHeight: 44, textTransform: "none", fontWeight: 600 }} />
            <Tab value="register" label="Cadastrar" sx={{ minHeight: 44, textTransform: "none", fontWeight: 600 }} />
          </Tabs>

          {alertState ? <Alert severity={alertState.type}>{alertState.message}</Alert> : null}

          <form onSubmit={submitAuth}>
            <Stack spacing={2.25}>
              {mode === "register" ? (
                <TextField
                  label="Nome"
                  value={formState.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                  fullWidth
                  autoComplete="name"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      backgroundColor: "var(--surface)",
                      "& fieldset": { borderColor: "var(--border)" },
                      "&:hover fieldset": { borderColor: "var(--primary)" },
                      "&.Mui-focused fieldset": { borderColor: "var(--ring)" },
                    },
                  }}
                />
              ) : null}

              <TextField
                label="E-mail"
                type="email"
                value={formState.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
                fullWidth
                autoComplete="email"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    backgroundColor: "var(--surface)",
                    "& fieldset": { borderColor: "var(--border)" },
                    "&:hover fieldset": { borderColor: "var(--primary)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--ring)" },
                  },
                }}
              />

              <TextField
                label="Senha"
                type="password"
                value={formState.password}
                onChange={(event) => updateField("password", event.target.value)}
                required
                fullWidth
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    backgroundColor: "var(--surface)",
                    "& fieldset": { borderColor: "var(--border)" },
                    "&:hover fieldset": { borderColor: "var(--primary)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--ring)" },
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{
                  borderRadius: "14px",
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: "none",
                }}
              >
                {isSubmitting ? <CircularProgress size={22} color="inherit" /> : mode === "login" ? "Entrar" : "Criar conta"}
              </Button>

              <Divider sx={{ borderColor: "var(--border)" }} />

              <Typography variant="body2" sx={{ color: "var(--muted)", lineHeight: 1.7 }}>
                {mode === "login"
                  ? "Ao entrar, a resposta do backend é repassada pelo Next.js para que você possa continuar com a mesma sessão."
                  : "Se o cadastro for bem-sucedido, você já recebe a resposta do backend sem mudar a estrutura da interface."}
              </Typography>
            </Stack>
          </form>
        </Stack>
      </CardContent>
    </Card>
  );
}