# Nisa — Uzman Klinik Psikolog Web Sitesi

Uzman Klinik Psikolog **Nisa Demir** için geliştirilmiş, içerik yönetim panelli kişisel web sitesi. Ziyaretçiler terapi alanlarını inceleyebilir, blog yazılarını okuyabilir ve iletişim formu üzerinden mesaj gönderebilir; site sahibi ise admin panelinden tüm içeriği güncelleyebilir.

## Özellikler

### Ziyaretçi tarafı

- **Ana sayfa** — Alıntılar, görseller ve öne çıkan yazılar
- **Tanışalım** — Biyografi ve mesleki geçmiş
- **Çalışma alanları** — Bireysel terapi, online terapi vb. hizmet tanımları
- **Blog & makaleler** — Slug tabanlı makale listesi ve detay sayfaları
- **İletişim** — Çalışma saatleri, sosyal bağlantılar ve e-posta formu (Resend)
- **Açık/koyu tema** — Kullanıcı tercihi `localStorage` ile saklanır
- **SEO** — Dinamik sitemap, robots.txt, Open Graph görseli ve JSON-LD yapılandırılmış veri

### Admin paneli (`/admin`)

Cookie tabanlı oturum ile korunan içerik yönetimi:

| Bölüm | Yönetilen içerik |
|-------|------------------|
| Sosyal Medya | E-posta, Instagram kullanıcı adı ve URL |
| Ana Sayfa | Alıntı metinleri, yazarlar, kitaplar, görseller |
| Hakkımda | Tanışalım sayfası metinleri |
| Çalışma Alanları | Başlık, açıklama ve ikonlar |
| Yazılar | Blog yazısı ekleme, düzenleme, silme |
| İletişim | Çalışma saatleri |

## Teknoloji yığını

| Katman | Teknoloji |
|--------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | React 19, [Tailwind CSS 4](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/) |
| İçerik | JS dosyaları (`data/*.js`) — production’da Cloudinary |
| E-posta | [Resend](https://resend.com/) |
| İkonlar | Lucide React, React Icons |

## Proje yapısı

```
nisa2/
├── app/
│   ├── (routes)/          # Ziyaretçi sayfaları (Ana sayfa, Tanışalım, Yazılar…)
│   ├── admin/             # Admin paneli ve giriş
│   ├── api/               # REST API route'ları
│   └── components/        # Paylaşılan UI bileşenleri
├── components/ui/         # Shadcn/Radix tabanlı temel bileşenler
├── context/               # React context (tema vb.)
├── lib/                   # Auth, site verisi ve içerik saklama yardımcıları
├── data/
│   ├── about.js           # Tanışalım metinleri
│   ├── social.js          # E-posta, telefon, Instagram
│   ├── work.js            # Çalışma alanları
│   ├── articles.js        # Blog yazıları
│   ├── faq.js             # Sıkça sorulan sorular
│   └── contact.js         # Çalışma saatleri
└── public/                # Statik dosyalar (görseller)
```

## Gereksinimler

- **Node.js** 18.18 veya üzeri
- **Resend** hesabı ve API anahtarı (iletişim formu için)

## Kurulum

### 1. Bağımlılıkları yükleyin

```bash
npm install
```

### 2. Ortam değişkenlerini ayarlayın

Proje kökünde `.env` dosyası oluşturun:

```env
# Site URL (production'da zorunlu — sitemap ve SEO için)
NEXT_PUBLIC_SITE_URL="https://ornek.com"

# Admin girişi
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="guclu-sifre"
ADMIN_SECRET="uzun-rastgele-gizli-anahtar"

# İletişim formu e-postası
RESEND_API_KEY="re_xxxxxxxx"

# Görsel yükleme (production'da zorunlu — Vercel/Railway'de yerel disk yazılamaz)
CLOUDINARY_CLOUD_NAME="ornek-cloud"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxyz"
# CLOUDINARY_FOLDER="nisademir"  # opsiyonel klasör adı
```

> **Not:** Geliştirme ortamında `ADMIN_*` değişkenleri tanımlanmazsa varsayılan `admin` / `admin123` kullanılır. Production'da mutlaka güçlü değerler atayın.

### 3. Geliştirme sunucusunu başlatın

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde açılır. Admin paneli: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusu (Turbopack) |
| `npm run build` | Production derlemesi |
| `npm run start` | Production sunucusu |
| `npm run lint` | ESLint kontrolü |

## Sayfa rotaları

| Rota | Açıklama |
|------|----------|
| `/` | Ana sayfa |
| `/tanisalim` | Hakkımda |
| `/calisma_alanlarim` | Terapi alanları |
| `/yazilarim` | Blog listesi |
| `/yazilarim/[slug]` | Makale detayı |
| `/iletisim` | İletişim formu |
| `/admin/login` | Admin girişi |
| `/admin` | İçerik yönetim paneli |

## Production dağıtımı

Proje [Vercel](https://vercel.com/) veya benzeri bir platforma deploy edilebilir.

1. Ortam değişkenlerinin tamamını platform paneline ekleyin.
2. `NEXT_PUBLIC_SITE_URL` değerini canlı domain ile eşleştirin (`https://www.nisademir.com`). Bu değişken sitemap, canonical URL ve Open Graph için zorunludur; ayarlanmazsa sitemap yanlış `*.vercel.app` adresleri üretebilir.
3. Resend'de gönderici domain'inizi doğrulayın; `app/api/contact/route.js` içindeki `from` adresini buna göre güncelleyin.
4. Admin panelinden içerik kaydetmek ve görsel yüklemek için [Cloudinary](https://cloudinary.com/) hesabı açın ve `CLOUDINARY_*` değişkenlerini ekleyin. Localhost'ta içerik `data/*.js` dosyalarına, görseller diske yazılır; production'da ikisi de Cloudinary'ye kaydedilir.
5. Build komutu: `npm run build` — Start komutu: `npm run start`

`VERCEL_URL` tanımlandığında site URL'si otomatik olarak türetilir; yine de `NEXT_PUBLIC_SITE_URL` kullanımı önerilir.

## Lisans

Bu proje özel (`private`) bir projedir.
