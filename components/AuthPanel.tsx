"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
import { useAuth } from "@/components/AuthProvider";
import { getAuthFieldErrors } from "@/lib/auth-api";
import { initializeNeedsOnboarding } from "@/lib/mock-user-state";

type AuthMode = "login" | "register";
type AlertState = { type: "success" | "error"; message: string } | null;
type FormState = { name: string; email: string; password: string };

const emptyFormState: FormState = { name: "", email: "", password: "" };

export function AuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [formState, setFormState] = useState<FormState>(emptyFormState);
  const [alertState, setAlertState] = useState<AlertState>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, status, error: authError, login, register, logout } = useAuth();

  function updateField(field: keyof FormState, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: [] }));
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAlertState(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const authenticatedUser = mode === "login"
        ? await login({ email: formState.email, password: formState.password })
        : await register({
            name: formState.name,
            email: formState.email,
            password: formState.password,
            password_confirmation: formState.password,
          });

      const redirectPath = authenticatedUser.role === "admin"
        ? "/admin/dashboard"
        : initializeNeedsOnboarding(authenticatedUser)
          ? "/onboarding"
          : "/search";

      setAlertState({
        type: "success",
        message: mode === "login" ? "Login realizado com sucesso." : "Cadastro realizado com sucesso.",
      });
      setFormState((current) => ({ ...current, password: "" }));
      router.push(redirectPath);
    } catch (error) {
      const errors = getAuthFieldErrors(error);
      if (errors.password_confirmation && !errors.password) {
        errors.password = errors.password_confirmation;
      }
      setFieldErrors(errors);
      setAlertState({
        type: "error",
        message: error instanceof Error ? error.message : "Não foi possível concluir a operação.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogout() {
    setIsSubmitting(true);
    setAlertState(null);

    try {
      await logout();
      setFormState(emptyFormState);
      setMode("login");
      setAlertState({ type: "success", message: "Logout realizado com sucesso." });
    } catch (error) {
      setAlertState({
        type: "error",
        message: error instanceof Error ? error.message : "Não foi possível encerrar a sessão agora.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card
      elevation={0}
      className="overflow-hidden border border-border bg-surface shadow-sm"
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
              Use sua conta para continuar de onde parou.
            </Typography>
          </div>

          {user ? (
            <Card variant="outlined" sx={{ borderRadius: 4, borderColor: "var(--border)", backgroundColor: "var(--surface-muted)" }}>
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Stack spacing={1.5}>
                  <div>
                    <Typography variant="subtitle2" sx={{ color: "var(--primary)", fontWeight: 700 }}>
                      Sessão ativa
                    </Typography>
                    <Typography variant="h6" sx={{ color: "var(--foreground)", fontWeight: 700 }}>
                      {user.name ?? "Usuário autenticado"}
                    </Typography>
                    {user.email ? (
                      <Typography variant="body2" sx={{ color: "var(--muted)" }}>
                        {user.email}
                      </Typography>
                    ) : null}
                  </div>

                  <Button
                    variant="outlined"
                    onClick={handleLogout}
                    disabled={isSubmitting}
                    sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700 }}
                  >
                    {isSubmitting ? <CircularProgress size={18} color="inherit" /> : "Sair"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : null}

          <Tabs
            value={mode}
            onChange={(_, nextMode: AuthMode) => {
              setMode(nextMode);
              setAlertState(null);
              setFieldErrors({});
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
          {!alertState && status === "error" && authError ? <Alert severity="error">{authError}</Alert> : null}
          {status === "loading" && !user ? (
            <div className="flex justify-center" role="status" aria-label="Verificando sessão">
              <CircularProgress size={22} />
            </div>
          ) : null}

          <form onSubmit={submitAuth}>
            <Stack spacing={2.25}>
              {mode === "register" ? (
                <TextField
                  label="Nome"
                  value={formState.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  error={Boolean(fieldErrors.name)}
                  helperText={fieldErrors.name?.[0]}
                  required
                  fullWidth
                  autoComplete="name"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "14px",
                      backgroundColor: "var(--surface)",
                      "& fieldset": { borderColor: "var(--border-strong)" },
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
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email?.[0]}
                required
                fullWidth
                autoComplete="email"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    backgroundColor: "var(--surface)",
                    "& fieldset": { borderColor: "var(--border-strong)" },
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
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password?.[0]}
                required
                fullWidth
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    backgroundColor: "var(--surface)",
                    "& fieldset": { borderColor: "var(--border-strong)" },
                    "&:hover fieldset": { borderColor: "var(--primary)" },
                    "&.Mui-focused fieldset": { borderColor: "var(--ring)" },
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting || status === "loading"}
                sx={{ borderRadius: "14px", py: 1.5, fontWeight: 700, textTransform: "none" }}
              >
                {isSubmitting ? <CircularProgress size={22} color="inherit" /> : mode === "login" ? "Entrar" : "Criar conta"}
              </Button>

              <Divider sx={{ borderColor: "var(--border-strong)" }} />

              <Typography variant="body2" sx={{ color: "var(--muted)", lineHeight: 1.7 }}>
                {mode === "login"
                  ? "Ao entrar, sua sessão fica pronta para continuar."
                  : "Se o cadastro for bem-sucedido, você já pode seguir para a próxima etapa."}
              </Typography>
            </Stack>
          </form>
        </Stack>
      </CardContent>
    </Card>
  );
}
