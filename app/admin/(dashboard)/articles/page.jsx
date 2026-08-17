import { getArticleRecords } from "@/lib/contentStore";
import ArticlesList from "@/app/admin/components/ArticlesList";

export default async function AdminArticlesPage() {
 const articles = (await getArticleRecords()).map(({ id, title }) => ({ id, title }));

 return <ArticlesList initialArticles={articles} />;
}
