import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import type { ArticleMetadata } from "@/lib/articles";

export function SearchResultCard({ id, title }: ArticleMetadata) {
  return (
    <Card
      className="flex h-full min-w-0 flex-col overflow-hidden border border-border bg-card"
      sx={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        boxShadow: "none",
        borderRadius: "8px",
      }}
    >
      <CardContent className="flex min-w-0 flex-1 flex-col gap-5 p-5 last:pb-5 sm:p-6 sm:last:pb-6">
        <Typography
          component="h2"
          variant="h6"
          className="font-semibold"
          sx={{ color: "var(--card-foreground)", minWidth: 0, overflowWrap: "anywhere" }}
        >
          {title}
        </Typography>
        <Button
          href={`/page/${encodeURIComponent(id)}`}
          variant="contained"
          size="small"
          className="mt-auto self-start"
          sx={{
            backgroundColor: "var(--primary)",
            borderRadius: "6px",
            boxShadow: "none",
            color: "var(--primary-foreground)",
            textTransform: "none",
            "&:hover": { backgroundColor: "var(--primary-hover)", boxShadow: "none" },
          }}
        >
          Ver detalhes
        </Button>
      </CardContent>
    </Card>
  );
}