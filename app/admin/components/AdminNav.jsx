"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
 UserCircle,
 Briefcase,
 BookOpen,
 CircleHelp,
 LogOut,
 Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
 { href: "/admin/about", label: "Hakkımda", icon: UserCircle },
 { href: "/admin/work", label: "Çalışma Alanları", icon: Briefcase },
 { href: "/admin/articles", label: "Yazılar", icon: BookOpen },
 { href: "/admin/faq", label: "SSS", icon: CircleHelp },
 { href: "/admin/social", label: "İletişim", icon: Mail },
];

export default function AdminNav() {
 const pathname = usePathname();
 const router = useRouter();

 async function handleLogout() {
  await fetch("/api/admin/logout", { method: "POST" });
  router.push("/admin/login");
  router.refresh();
 }

 return (
  <header className="sticky top-0 z-40 border-b border-gray-200/70 dark:border-dark-500/40 bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl">
   <div className="container mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 h-14 lg:h-16">
     <Link href="/admin" className="shrink-0 justify-self-start">
      <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted leading-none">Yönetim</p>
      <span className="font-serif text-base lg:text-lg text-heading leading-tight">Admin Panel</span>
     </Link>

     <nav className="flex items-center justify-center gap-0.5 overflow-x-auto min-w-0 max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
       const active = exact ? pathname === href : pathname.startsWith(href);
       return (
        <Link
         key={href}
         href={href}
         className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 lg:px-3 lg:py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer",
          active
           ? "bg-primary/10 text-primary dark:bg-primary-dark/15 dark:text-primary-dark-light"
           : "text-body hover:bg-gray-100 dark:hover:bg-dark-800"
         )}
        >
         <Icon className="w-4 h-4 shrink-0" />
         <span className="hidden sm:inline">{label}</span>
        </Link>
       );
      })}
     </nav>

     <Button variant="outline" size="sm" className="shrink-0 justify-self-end" onClick={handleLogout}>
      <LogOut className="w-4 h-4" />
      <span className="hidden md:inline">Çıkış Yap</span>
     </Button>
    </div>
   </div>
  </header>
 );
}