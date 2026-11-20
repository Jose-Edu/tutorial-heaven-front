import { ArticleResultsPage } from "@/components/ArticleResultsPage";
import { ProtectedUserDashboard } from "@/components/ProtectedUserDashboard";

export default function UserDashboardPage() {
  return (
    <ProtectedUserDashboard>
      <ArticleResultsPage term="" source="recommended" />
    </ProtectedUserDashboard>
  );
}
