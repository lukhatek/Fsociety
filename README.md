# fsociety - Mr. Robot Temalı Forum

Karanlık ve çarpıcı atmosferde, Mr. Robot evreninden ilham alan hacktivist temalı forum sitesi.

## 🎯 Özellikler

### 🎨 Görsel Özellikler
- **Mr. Robot Teması**: Karanlık, terminal stilinde arayüz
- **Glitch Efektleri**: Yazılar için dijital bozulma animasyonları
- **Matrix Animasyonu**: Arka plan yağmur efekti
- **fsociety Logosu**: Animasyonlu karakter düşme efekti
- **Terminal Efektleri**: Yanıp sönen cursor, terminal promptu
- **IBM Plex Mono Font**: Terminal benzeri yazı tipi

### 🔧 Teknik Özellikler
- **100% Statik**: GitHub Pages uyumlu
- **localStorage**: Tüm veriler tarayıcıda saklanır
- **Responsive**: Mobil uyumlu tasarım
- **Türkçe**: Tam Türkçe arayüz

### 👥 Kullanıcı Sistemi
- **Kayıt/Giriş**: Tam kullanıcı yönetimi
- **Admin Panel**: Lukha/ahmetdurden1 ile özel yetkiler
- **Profil Sistemi**: Varsayılan avatar ataması

### 📝 Forum Özellikleri
- **Gönderi Oluşturma**: Kullanıcılar post oluşturabilir
- **Gönderi Görüntüleme**: Tüm gönderiler listelenebilir
- **Tarih Formatı**: Türkçe tarih gösterimi
- **Yorum Sistemi**: (Geliştirme aşamasında)

## 🚀 Kurulum

### GitHub Pages ile Yayınlama

1. **Bu repoyu fork edin**
2. **Settings > Pages** bölümüne gidin
3. **Source** olarak "Deploy from a branch" seçin
4. **Branch** olarak "main" ve "/ (root)" seçin
5. **Save** tıklayın

Site birkaç dakika içinde `https://kullanici-adiniz.github.io/repo-adi` adresinde yayınlanacak.

### Özel Domain (lukha.io gibi)

1. **CNAME** dosyasını düzenleyin
2. Domain'inizin DNS ayarlarını yapın
3. **GitHub Pages** ayarlarında custom domain'i girin

## 🔑 Varsayılan Giriş Bilgileri

**Admin Hesabı:**
- Kullanıcı Adı: `Lukha`
- Şifre: `ahmetdurden1`

## 📱 Kullanım

1. **Kayıt Ol**: Yeni hesap oluştur
2. **Giriş Yap**: Mevcut hesapla giriş yap
3. **Gönderi Oluştur**: "Yeni Gönderi Oluştur" butonu ile
4. **Kullanıcı Ekle**: Admin yetkisiyle yeni kullanıcı ekle

## 🎨 Görsel Efektler

### Glitch Text
```css
.glitch-text {
    animation: glitch 2s infinite;
}
```

### Matrix Rain
Arka planda sürekli akan Matrix karakterleri

### Terminal Efektleri
- Yanıp sönen cursor
- Terminal promptu (`root@fsociety:~$ `)
- Yeşil monospace font

## 🔧 Teknik Detaylar

### Veri Depolama
- **localStorage**: Tüm veriler tarayıcıda saklanır
- **JSON Format**: Kullanıcılar ve gönderiler JSON olarak tutulur
- **Session Management**: Giriş durumu korunur

### Dosya Yapısı
```
/
├── index.html          # Ana sayfa
├── style.css          # Tüm stiller
├── app.js             # Ana JavaScript dosyası
├── kullanicilar.json  # Varsayılan kullanıcılar
├── gonderiler.json    # Varsayılan gönderiler
├── CNAME              # Özel domain için
└── README.md          # Bu dosya
```

## 🌟 Mr. Robot Alıntıları

Site rastgele olarak aşağıdaki Türkçe alıntıları gösterir:

- "Kontrol bir yanılsama."
- "Güç halka aittir."
- "Sistem bozuldu."
- "Biz fsociety'iz."
- "Merhaba, dostum."
- "Devrim televizyona çıkmayacak."

## 🎯 Geliştirme Notları

### Eklenmesi Planlanan Özellikler
- Yorum sistemi
- Kullanıcı profil düzenleme
- Gönderi düzenleme/silme
- Arama özelliği
- Kategori sistemi

### Bilinen Sınırlamalar
- Veriler sadece tarayıcıda saklanır
- Gerçek kullanıcı authentication yok
- Şifreler hash'lenmez (sadece demo için)

## 📄 Lisans

Bu proje MIT lisansı altında yayınlanmıştır.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit yapın (`git commit -m 'Add some AmazingFeature'`)
4. Push yapın (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📞 İletişim

Proje Sahibi: Lukha
- GitHub: [@lukha](https://github.com/lukha)
- Website: [lukha.io](https://lukha.io)

---

**"Kontrol bir yanılsama. Güç halka aittir."** - fsociety