import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

type SearchResultCardProps = {
  id: string;
  title: string;
  description: string;
};

export function SearchResultCard({ id, title, description }: SearchResultCardProps) {
  return (
    <Card
      className="flex h-full flex-col overflow-hidden border border-border bg-card md:flex-row"
      sx={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        boxShadow: "none",
        borderRadius: "8px",
      }}
    >
      <div
        className="flex h-40 shrink-0 items-center justify-center border-b border-border bg-surface-muted text-sm font-semibold uppercase tracking-wide text-muted md:h-auto md:w-40 md:border-b-0 md:border-r"
        aria-label={`Imagem placeholder de ${title}`}
        role="img"
      >
        Tutorial
      </div>
      <CardContent className="flex min-w-0 flex-1 flex-col p-5 last:pb-5">
        <Typography
          component="h2"
          variant="h6"
          className="font-semibold"
          sx={{ color: "var(--card-foreground)" }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          className="mt-2 flex-1 leading-6"
          sx={{ color: "var(--muted)" }}
        >
          {description}
        </Typography>
        <Button
          href={`/page/${id}`}
          variant="contained"
          size="small"
          className="mt-5 self-start"
          sx={{
            backgroundColor: "var(--primary)",
            borderRadius: "6px",
            boxShadow: "none",
            color: "var(--primary-foreground)",
            textTransform: "none",
            "&:hover": { backgroundColor: "var(--accent-foreground)", boxShadow: "none" },
          }}
        >
          Ver detalhes
        </Button>
      </CardContent>
    </Card>
  );
}