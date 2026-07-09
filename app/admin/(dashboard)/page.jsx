import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
 ArrowRight,
 UserCircle,
 Briefcase,
 BookOpen,
 CircleHelp,
 Mail,
} from "lucide-react";

const SECTIONS = [
 { href: "/admin/about", title: "Hakkımda", desc: "Tanışalım sayfası metinleri", icon: UserCircle },
 { href: "/admin/work", title: "Çalışma Alanları", desc: "Terapi alanları ve açıklamalar", icon: Briefcase },
 { href: "/admin/articles", title: "Yazılar", desc: "Blog yazılarını ekle ve düzenle", icon: BookOpen },
 { href: "/admin/faq", title: "SSS", desc: "Sıkça sorulan sorular ve cevapları", icon: CircleHelp },
 { href: "/admin/social", title: "İletişim", desc: "E-posta, telefon ve sosyal medya", icon: Mail },
];

export default function AdminDashboardPage() {
 return (
  <div className="space-y-6">
   <header>
    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted">Dashboard</p>
    <h2 className="font-serif text-2xl lg:text-3xl text-heading mt-1">Site İçeriği</h2>
    <p className="text-sm text-body mt-1.5 max-w-xl">
     Aşağıdaki bölümlerden site verilerini düzenleyebilirsiniz.
    </p>
   </header>

   <div className="grid sm:grid-cols-2 gap-4">
    {SECTIONS.map(({ href, title, desc, icon: Icon }) => (
     <Link key={href} href={href} className="group block h-full">
      <Card className="h-full transition-all duration-300 hover:border-primary/30 dark:hover:border-primary-dark/30 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(40,30,20,0.08)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
       <CardContent className="p-5">
        <div className="flex items-start gap-3.5">
         <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary-dark/15 text-primary dark:text-primary-dark-light shrink-0 transition-colors duration-300 group-hover:bg-primary group-hover:text-white dark:group-hover:bg-primary-dark dark:group-hover:text-gray-950">
          <Icon className="w-[1.15rem] h-[1.15rem]" />
         </span>
         <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="font-serif text-lg text-heading leading-tight transition-colors duration-300 group-hover:text-primary dark:group-hover:text-primary-dark-light">
           {title}
          </h3>
          <p className="text-sm text-body mt-1 leading-relaxed">{desc}</p>
         </div>
         <ArrowRight className="w-4 h-4 text-muted shrink-0 mt-1 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
        </div>
       </CardContent>
      </Card>
     </Link>
    ))}
   </div>
  </div>
 );
}
