import { getSocial, getArticles } from '@/lib/siteData';
import HomePageClient from './HomePageClient';

export const dynamic = "force-dynamic";

export default async function HomePage() {
 const [social, articles] = await Promise.all([
  getSocial(),
  getArticles(),
 ]);

 return <HomePageClient social={social} articles={articles} />;
}
