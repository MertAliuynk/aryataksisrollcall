# Spor Kulübü Yoklama Takip Sistemi

Modern ve kullanıcı dostu bir spor kulübü yoklama takip sistemi. Next.js, tRPC ve PostgreSQL ile geliştirilmiştir.

## 🚀 Özellikler

- **Role-Based Access (Rol Tabanlı Erişim)**
  - Çalışan girişi: Tam yönetim paneli
  - Veli girişi: Sadece yoklama raporları
- **Öğrenci Yönetimi**: Öğrenci ekleme, düzenleme, listeleme
- **Kurs Yönetimi**: Kurs oluşturma ve öğrenci atama
- **Yoklama Takibi**: Günlük yoklama alma ve raporlama
- **Responsive Design**: Mobil ve desktop uyumlu
- **Animasyonlu UI**: Modern glassmorphism tasarım

## 🛠️ Teknolojiler

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **API**: tRPC (Type-safe)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

## 📦 Kurulum

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd my-app
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. PostgreSQL Kurulumu
PostgreSQL'i sisteminize kurun ve bir database oluşturun:
```sql
CREATE DATABASE spor_kulubu;
```

### 4. Environment Variables
`.env` dosyası oluşturun:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/spor_kulubu"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 5. Database Migration
```bash
npx prisma db push
```

### 6. Prisma Client Generate
```bash
npx prisma generate
```

### 7. Sunucuyu Başlatın
```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 🗄️ Database Scripts

```bash
# Prisma Client generate
npm run db:generate

# Database push (schema'yı database'e uygula)
npm run db:push

# Prisma Studio (GUI database editor)
npm run db:studio
```

## 📱 Kullanım

### Ana Sayfa
- Rol seçimi (Çalışan/Veli girişi)
- Sistem özelliklerinin tanıtımı

### Çalışan Paneli (/students)
- Öğrenci listesi ve arama
- Yeni öğrenci ekleme
- Kurs yönetimi
- Yoklama alma
- Detaylı raporlar

### Veli Paneli (/parent-reports)
- Sadece yoklama raporları görüntüleme
- Kurs bazlı filtreleme
- Öğrenci arama

## 🎨 UI Bileşenleri

Proje, shadcn/ui tabanlı modern bileşenler içerir:
- Animasyonlu butonlar
- Glassmorphism kartlar
- Responsive tablo yapısı
- Modal dialog'lar
- Form elemanları

## 🚀 Production Deployment

### Vercel Deployment
1. Vercel hesabınıza projeyi import edin
2. Environment variables'ı ekleyin
3. PostgreSQL database bağlantısını yapılandırın
4. Deploy edin

### Database Migration (Production)
```bash
npx prisma db push
```

## 📝 License

MIT License - Detaylar için LICENSE dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

Sorularınız için issue açabilirsiniz.
