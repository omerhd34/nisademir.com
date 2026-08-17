import { notFound } from "next/navigation";
import ArticleEditor from "@/app/admin/components/ArticleEditor";
import { getArticleRecordById } from "@/lib/contentStore";

export default async function AdminEditArticlePage({ params }) {
 const { id } = await params;
 const articleId = Number(id);

 if (!Number.isFinite(articleId)) {
  notFound();
 }

 const article = await getArticleRecordById(articleId);

 if (!article) {
  notFound();
 }

 return <ArticleEditor articleId={id} initialArticle={article} />;
}
