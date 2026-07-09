'use client';
import HomeHero from '@/app/components/home/HomeHero';
import HomeArticles from '@/app/components/home/HomeArticles';

export default function HomePageClient({ social, articles }) {
 return (
  <div className="transition-colors duration-300">
   <HomeHero social={social} />
   <HomeArticles articles={articles} />
  </div>
 );
}
