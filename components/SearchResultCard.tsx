import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import type { ArticleMetadata, ArticleTag } from "@/lib/articles";

type SearchResultCardProps = ArticleMetadata & {
  tags?: ArticleTag[];
};

export function SearchResultCard({ id, title, description, tags }: SearchResultCardProps) {
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
        {description ? (
          <Typography
            component="p"
            variant="body2"
            className="leading-6"
            sx={{ color: "var(--muted)", minWidth: 0, overflowWrap: "anywhere" }}
          >
            {description}
          </Typography>
        ) : null}
        {tags && tags.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="Tags do artigo">
            {tags.map((tag) => (
              <li
                key={String(tag.id)}
                className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-muted"
              >
                {tag.name ?? `#${tag.id}`}
              </li>
            ))}
          </ul>
        ) : null}
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
