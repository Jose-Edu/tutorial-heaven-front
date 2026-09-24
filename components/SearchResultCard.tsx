import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import type { ArticleMetadata } from "@/lib/articles";

export function SearchResultCard({ id, title, description }: ArticleMetadata) {
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
          {description ?? "Sem descrição disponível."}
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