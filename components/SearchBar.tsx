"use client";

import { FormEvent, useRef, useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();

    if (!term) {
      inputRef.current?.focus();
      return;
    }

    console.log("Busca por:", term);
  }

  function openMobileSearch() {
    setIsMobileOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }

  function closeMobileSearch() {
    setIsMobileOpen(false);
    inputRef.current?.blur();
  }

  const field = (
    <TextField
      inputRef={inputRef}
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder="Buscar tutoriais"
      size="small"
      fullWidth
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "6px",
          backgroundColor: "var(--surface)",
          color: "var(--foreground)",
          "& fieldset": { borderColor: "var(--border)" },
          "&:hover fieldset": { borderColor: "var(--primary)" },
          "&.Mui-focused fieldset": { borderColor: "var(--ring)" },
        },
        "& .MuiInputBase-input": { py: 1, fontSize: "0.875rem" },
        "& .MuiInputBase-input::placeholder": { color: "var(--muted)", opacity: 1 },
      }}
      slotProps={{
        htmlInput: { "aria-label": "Buscar tutoriais" },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: "var(--muted)" }} />
            </InputAdornment>
          ),
          endAdornment: query ? (
            <InputAdornment position="end">
              <IconButton aria-label="Limpar busca" size="small" onClick={() => setQuery("")}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
    />
  );

  return (
    <>
      <form onSubmit={submitSearch} className="hidden w-full max-w-md md:flex" role="search">
        {field}
      </form>

      <div className="md:hidden">
        <IconButton aria-label="Abrir busca" onClick={openMobileSearch} sx={{ color: "var(--foreground)" }}>
          <SearchIcon />
        </IconButton>
        {isMobileOpen ? (
          <form onSubmit={submitSearch} className="absolute left-4 right-4 top-full mt-2 rounded-lg border border-border bg-background p-3 shadow-md" role="search">
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">{field}</div>
              <IconButton aria-label="Fechar busca" onClick={closeMobileSearch} sx={{ color: "var(--foreground)" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          </form>
        ) : null}
      </div>
    </>
  );
}
