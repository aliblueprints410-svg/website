/**
 * Space i18n Engine — نظام دعم اللغات الأربع
 * العربية (ar) | English (en) | کوردی سۆرانی (ckb) | Türkçe (tr)
 */
const I18N = (() => {
  const STORAGE_KEY = 'space-lang';
  const SUPPORTED_LANGS = {
    ar: { name: 'العربية', dir: 'rtl', code: 'ar' },
    ckb: { name: 'کوردی', dir: 'rtl', code: 'ckb' },
    en: { name: 'English', dir: 'ltr', code: 'en' },
    tr: { name: 'Türkçe', dir: 'ltr', code: 'tr' }
  };

  const DICTIONARY = {
    // Navigation
    'nav.home': { ar: 'الرئيسية', ckb: 'سەرەکی', en: 'Home', tr: 'Ana Sayfa' },
    'nav.apps': { ar: 'التطبيقات', ckb: 'ئەپەکان', en: 'Apps', tr: 'Uygulamalar' },
    'nav.posts': { ar: 'المنشورات', ckb: 'پۆستەکان', en: 'Posts', tr: 'Gönderiler' },
    'nav.about': { ar: 'عنّي', ckb: 'دەربارە', en: 'About', tr: 'Hakkımda' },
    'nav.contact': { ar: 'تواصل', ckb: 'پەیوەندی', en: 'Contact', tr: 'İletişim' },
    'nav.owner': { ar: 'لوحة الإدارة', ckb: 'بەڕێوەبردن', en: 'Admin Panel', tr: 'Yönetim Paneli' },
    'nav.signin': { ar: 'تسجيل الدخول', ckb: 'چوونەژوورەوە', en: 'Sign In', tr: 'Giriş Yap' },
    'nav.signout': { ar: 'تسجيل الخروج', ckb: 'دەرچوون', en: 'Sign Out', tr: 'Çıkış Yap' },
    'nav.menu': { ar: 'القائمة', ckb: 'مێنۆ', en: 'Menu', tr: 'Menü' },
    'nav.toggle_theme': { ar: 'تبديل المظهر', ckb: 'گۆڕینی ڕووکار', en: 'Toggle Theme', tr: 'Temayı Değiştir' },

    // Site Identity
    'site.owner_name': { ar: 'علي محمد', ckb: 'عەلی محەمەد', en: 'Ali Muhammed', tr: 'Ali Muhammed' },

    // Hero & Home
    'hero.eyebrow': { ar: 'مكاني على الإنترنت', ckb: 'شوێنی من لەسەر ئینتەرنێت', en: 'My Space on the Web', tr: 'İnternetteki Alanım' },
    'hero.greeting_prefix': { ar: 'أهلاً، أنا ', ckb: 'سڵاو، من ', en: 'Hello, I am ', tr: 'Merhaba, ben ' },
    'hero.bio': {
      ar: 'طالب شغوف بهندسة الكهرباء والبرمجة وكل ما يتعلق بالتكنولوجيا، أتعلم بالتجربة والتدريب وأبني أدوات برمجية تسعى لصنع الفارق.',
      ckb: 'خوێندکارێکی شەیدای ئەندازیاری کارەبا و پڕۆگرامسازی و هەموو بوارەکانی تەکنەلۆژیا، بە ئەزموون و مەشق فێر دەبم و ئامرازی نەرمەکاڵا دروست دەکەم.',
      en: 'Electrical Engineering student passionate about programming and tech. Learning through practice and building tools that make a difference.',
      tr: 'Elektrik Mühendisliği öğrencisi; yazılım ve teknoloji tutkunu. Deneyerek ve uygulayarak öğreniyor, fark yaratan dijital araçlar geliştiriyorum.'
    },
    'hero.btn_apps': { ar: 'اكتشف تطبيقاتي ←', ckb: 'ئەپەکانم ببینە ←', en: 'Explore My Apps →', tr: 'Uygulamalarımı Keşfet →' },
    'hero.btn_posts': { ar: 'اقرأ منشوراتي', ckb: 'پۆستەکانم بخوێنەرەوە', en: 'Read My Posts', tr: 'Gönderilerimi Oku' },
    'hero.art_badge': { ar: 'مساحة للتجربة والإبداع', ckb: 'شوێنێک بۆ تاقیکردنەوە و داهێنان', en: 'A space for craft & experiments', tr: 'Deney ve üretim için bir alan' },
    'hero.art_title': { ar: 'أفكار صغيرة،<br>تصنع فرقاً.', ckb: 'بیرۆکەی بچووک،<br>جیاوازی دروست دەکات.', en: 'Small ideas,<br>shaping impact.', tr: 'Küçük fikirler,<br>büyük farklar.' },
    'hero.art_sub': { ar: 'تطبيقات · كتابة · تجارب', ckb: 'ئەپەکان · نووسین · تاقیکاری', en: 'Apps · Writing · Experiments', tr: 'Uygulamalar · Yazılar · Deneyler' },

    // Stats
    'stat.apps': { ar: 'تطبيقاً ومشروعاً', ckb: 'ئەپ و پڕۆژە', en: 'Apps & Projects', tr: 'Uygulama ve Proje' },
    'stat.downloads': { ar: 'عملية تحميل', ckb: 'داگرتن', en: 'Downloads', tr: 'İndirme' },
    'stat.followers': { ar: 'متابعاً', ckb: 'شوێنکەوتوو', en: 'Followers', tr: 'Takipçi' },

    // Sections
    'home.featured_apps_tag': { ar: 'من مكتب التطوير', ckb: 'لە مێزی گەشەپێدانەوە', en: 'From the Workshop', tr: 'Geliştirme Masasından' },
    'home.featured_apps_title': { ar: 'أحدث التطبيقات', ckb: 'نوێترین ئەپەکان', en: 'Latest Apps', tr: 'En Yeni Uygulamalar' },
    'home.featured_apps_desc': { ar: 'أدوات أنشأتها لتجعل المهام اليومية أسهل.', ckb: 'ئامرازگەلێک دروستم کردوون بۆ ئاسانکردنی ئەرکە ڕۆژانەییەکان.', en: 'Tools crafted to make daily routines smoother.', tr: 'Günlük işleri kolaylaştırmak için geliştirdiğim araçlar.' },
    'home.all_apps': { ar: 'كل التطبيقات ←', ckb: 'هەموو ئەپەکان ←', en: 'All Apps →', tr: 'Tüm Uygulamalar →' },

    'home.posts_tag': { ar: 'ملاحظات وتحديثات', ckb: 'تێبینی و نوێکارییەکان', en: 'Notes & Updates', tr: 'Notlar ve Güncellemeler' },
    'home.posts_title': { ar: 'منشورات من المساحة', ckb: 'پۆستەکانی ئەم شوێنە', en: 'Notes from My Space', tr: 'Alandan Notlar' },
    'home.posts_desc': { ar: 'آخر ما أعمل عليه وأفكر فيه.', ckb: 'دواین ئەو شتانەی کاریان لەسەر دەکەم و بیریان لێ دەکەمەوە.', en: 'What I am currently building and reflecting on.', tr: 'Üzerinde çalıştığım ve düşündüğüm son şeyler.' },
    'home.all_posts': { ar: 'كل المنشورات ←', ckb: 'هەموو پۆستەکان ←', en: 'All Posts →', tr: 'Tüm Gönderiler →' },

    'home.social_tag': { ar: 'خارج مساحة', ckb: 'لە دەرەوەی ئەم شوێنە', en: 'Beyond This Space', tr: 'Bu Alanın Ötesinde' },
    'home.social_title': { ar: 'نتواصل على المنصات', ckb: 'لەتۆڕە کۆمەڵایەتییەکان لەپەیوەندیدابین', en: 'Let’s Connect', tr: 'Sosyal Ağlarda Buluşalım' },
    'home.social_desc': { ar: 'تابعني لتصلك التحديثات والأفكار الجديدة.', ckb: 'شوێنم بکەوە بۆ وەرگرتنی نوێترین پەرەپێدان و بیرۆکەکان.', en: 'Follow along for new project drops and reflections.', tr: 'Yeni güncellemeler ve fikirler için takip edin.' },
    'home.social_btn': { ar: 'اعثر على حساباتي ←', ckb: 'هەژمارەکانم بدۆزەرەوە ←', en: 'Find My Profiles →', tr: 'Hesaplarımı Gör →' },

    // Apps Page
    'apps.title': { ar: 'معرض التطبيقات', ckb: 'پێشانگای ئەپەکان', en: 'App Directory', tr: 'Uygulama Rehberi' },
    'apps.desc': { ar: 'تطبيقات للأندرويد، الويندوز، وأدوات ويب تفاعلية صممتها بحرص.', ckb: 'ئەپ بۆ ئەندرۆید، ویندۆز، و ئامرازی وێب کە بە وردی دروستکراون.', en: 'Android APKs, Windows executables, and interactive Web PWAs.', tr: 'Özenle hazırlanmış Android, Windows ve interaktif Web uygulamaları.' },
    'apps.filter_all': { ar: 'الكل', ckb: 'هەمووی', en: 'All', tr: 'Tümü' },
    'apps.filter_android': { ar: 'أندرويد (APK)', ckb: 'ئەندرۆید (APK)', en: 'Android (APK)', tr: 'Android (APK)' },
    'apps.filter_windows': { ar: 'ويندوز (EXE)', ckb: 'ویندۆز (EXE)', en: 'Windows (EXE)', tr: 'Windows (EXE)' },
    'apps.filter_web': { ar: 'ويب و PWA', ckb: 'وێب و PWA', en: 'Web & PWA', tr: 'Web ve PWA' },
    'apps.search_placeholder': { ar: 'ابحث عن تطبيق أو ميزة...', ckb: 'بگەڕێ بۆ ئەپ یان تایبەتمەندی...', en: 'Search apps or features...', tr: 'Uygulama veya özellik ara...' },
    'apps.empty': { ar: 'لا توجد تطبيقات مطابقة لبحثك.', ckb: 'هیچ ئەپێک نەدۆزرایەوە بەم گەڕانە.', en: 'No matching apps found.', tr: 'Aramanızla eşleşen uygulama bulunamadı.' },
    'apps.loading': { ar: 'جارٍ تحميل التطبيقات...', ckb: 'ئەپەکان باردەکرێن...', en: 'Loading apps...', tr: 'Uygulamalar yükleniyor...' },
    'apps.error': { ar: 'تعذّر تحميل التطبيقات. أعد المحاولة لاحقاً.', ckb: 'بارکردنی ئەپەکان سەرکەوتوو نەبوو. دواتر هەوڵ بدەرەوە.', en: 'Failed to load apps. Please try again later.', tr: 'Uygulamalar yüklenemedi. Lütfen tekrar deneyin.' },

    // App Detail Page
    'app.releases': { ar: 'الإصدارات والتحميل', ckb: 'وەشانەکان و داگرتن', en: 'Releases & Downloads', tr: 'Sürümler ve İndirme' },
    'app.try_online': { ar: 'جرّب الآن في المتصفح ↗', ckb: 'ئێستا لە وێبگەڕدا تاقی بکەرەوە ↗', en: 'Try Online in Browser ↗', tr: 'Tarayıcıda Çevrimiçi Dene ↗' },
    'app.download': { ar: 'تحميل الإصدار', ckb: 'داگرتنی وەشان', en: 'Download Release', tr: 'Sürümü İndir' },
    'app.changelog': { ar: 'سجل التغييرات', ckb: 'مێژووی گۆڕانکارییەکان', en: 'Changelog', tr: 'Değişiklik Günlüğü' },
    'app.screenshots': { ar: 'لقطات الشاشة', ckb: 'وێنەی ڕوونما', en: 'Screenshots', tr: 'Ekran Görüntüleri' },
    'app.checksum': { ar: 'رمز التحقق (SHA-256):', ckb: 'کۆدی دڵنیابوونەوە (SHA-256):', en: 'Checksum (SHA-256):', tr: 'Sağlama Kodu (SHA-256):' },
    'app.copy': { ar: 'نسخ', ckb: 'لەبەرگرتنەوە', en: 'Copy', tr: 'Kopyala' },
    'app.copied': { ar: 'تم النسخ!', ckb: 'لەبەرگیرایەوە!', en: 'Copied!', tr: 'Kopyalandı!' },
    'app.details': { ar: 'تفاصيل ومعلومات', ckb: 'وردەکاری و زانیاری', en: 'Details & Specs', tr: 'Ayrıntılar ve Bilgiler' },
    'app.category': { ar: 'التصنيف', ckb: 'پۆلێن', en: 'Category', tr: 'Kategori' },
    'app.license': { ar: 'الترخيص', ckb: 'مۆڵەت', en: 'License', tr: 'Lisans' },
    'app.status': { ar: 'الحالة', ckb: 'دۆخ', en: 'Status', tr: 'Durum' },
    'app.back': { ar: '← العودة للتطبيقات', ckb: '← گەڕانەوە بۆ ئەپەکان', en: '← Back to Apps', tr: '← Uygulamalara Dön' },

    // Posts Page
    'posts.title': { ar: 'المنشورات والأفكار', ckb: 'پۆستەکان و بیرۆکەکان', en: 'Posts & Reflections', tr: 'Gönderiler ve Fikirler' },
    'posts.desc': { ar: 'أشارك هنا مراحل بناء المشاريع، دروس برمجية، وتحديثات دورية.', ckb: 'لێرەدا قۆناغەکانی پەرەپێدانی پڕۆژەکان، وانەی پرۆگرامسازی، و نوێکاری دەنووسم.', en: 'Project postmortems, coding lessons, and regular engineering updates.', tr: 'Proje geliştirme süreçleri, yazılım notları ve düzenli güncellemeler.' },
    'posts.search_placeholder': { ar: 'ابحث في المنشورات...', ckb: 'بگەڕێ لە پۆستەکاندا...', en: 'Search posts...', tr: 'Gönderilerde ara...' },
    'posts.like': { ar: 'إعجاب', ckb: 'بەدڵبوون', en: 'Like', tr: 'Beğen' },
    'posts.comment': { ar: 'تعليق', ckb: 'لێدوان', en: 'Comment', tr: 'Yorum Yap' },
    'posts.share': { ar: 'مشاركة', ckb: 'هاوبەشی', en: 'Share', tr: 'Paylaş' },
    'posts.write_comment': { ar: 'اكتب تعليقاً...', ckb: 'لێدوانێک بنووسە...', en: 'Write a comment...', tr: 'Bir yorum yazın...' },
    'posts.publish_comment': { ar: 'نشر التعليق', ckb: 'بڵاوکردنەوەی لێدوان', en: 'Post Comment', tr: 'Yorum Gönder' },
    'posts.empty': { ar: 'لا توجد منشورات لعرضها الآن.', ckb: 'هیچ پۆستێک نییە بۆ پیشاندان ئێستا.', en: 'No posts to display right now.', tr: 'Şu anda görüntülenecek gönderi yok.' },
    'posts.loading': { ar: 'جارٍ تحميل المنشورات...', ckb: 'پۆستەکان باردەکرێن...', en: 'Loading posts...', tr: 'Gönderiler yükleniyor...' },
    'posts.read_time': { ar: 'قراءة', ckb: 'خوێندنەوە', en: 'read', tr: 'okuma' },
    'posts.minutes': { ar: 'دقائق', ckb: 'خولەک', en: 'min', tr: 'dk' },

    // About Page
    'about.title': { ar: 'عنّي وعن المساحة', ckb: 'دەربارەی من و ئەم شوێنە', en: 'About Me & My Space', tr: 'Hakkımda ve Alanım' },
    'about.intro': { ar: 'مرحباً، أشاركك هنا لمحة عن رحلتي واهتماماتي التقنية.', ckb: 'بەخێربێیت، لێرەدا کورتەیەک لە گەشت و خولیا تەکنیکییەکانم دەخەمە ڕوو.', en: 'Welcome, here is a glimpse into my technical journey and interests.', tr: 'Hoş geldiniz, burada teknik yolculuğum ve ilgi alanlarım hakkında bilgi bulabilirsiniz.' },
    'about.tagline': { ar: 'هندسة كهربائية · برمجة وتطوير', ckb: 'ئەندازیاری کارەبا · پڕۆگرامسازی و گەشەپێدان', en: 'Electrical Engineering · Software & Tech', tr: 'Elektrik Mühendisliği · Yazılım ve Teknoloji' },
    'about.skills_title': { ar: 'المهارات والتقنيات', ckb: 'شارەزایی و تەکنەلۆژیاکان', en: 'Skills & Tech Stack', tr: 'Yetenekler ve Teknolojiler' },
    'about.social_title': { ar: 'حسابات التواصل', ckb: 'هەژمارەکانی پەیوەندی', en: 'Social & Links', tr: 'Sosyal Ağlar ve Bağlantılar' },
    'about.philosophy': {
      ar: 'أجمع بين دراستي الهندسية والبرمجة، وأبني مشاريع تجريبية لأفهم كيف تُصمَّم الأدوات وتُختبر وتُحمى. أهتم بأن يكون ما أبنيه واضحاً وبسيطاً وآمناً.',
      ckb: 'خوێندنی ئەندازیاری و پرۆگرامسازی کۆدەکەمەوە، و پڕۆژەی تاقیکاری دروست دەکەم تا فێربم چۆن ئامرازەکان دیزاین و تاقی و پارێزراو دەکرێن. گرنگی بەوە دەدەم کە ئەوەی دروستی دەکەم ڕوون، سادە و پارێزراو بێت.',
      en: 'Bridging engineering rigor with software craft. I build experimental tools to master system design, reliability, and security. Focused on clarity and simplicity.',
      tr: 'Mühendislik disiplini ile yazılım sanatını birleştiriyorum. Sistem tasarımı, güvenilirlik ve güvenliği kavramak için araçlar geliştiriyor; sadelik ve netliğe odaklanıyorum.'
    },

    // Contact Page
    'contact.title': { ar: 'تواصل معي', ckb: 'پەیوەندیم پێوە بکە', en: 'Get In Touch', tr: 'İletişime Geçin' },
    'contact.desc': { ar: 'لديك فكرة تطبيق، سؤال تقني، أو اقتراح؟ يسعدني استقبال رسالتك.', ckb: 'بیرۆکەی ئەپێکت هەیە، پرسیاری تەکنیکی، یان پێشنیار؟ خۆشحاڵم بە وەرگرتنی پەیامەکەت.', en: 'Have an app idea, a technical inquiry, or feedback? I’d love to hear from you.', tr: 'Bir uygulama fikriniz, teknik bir sorunuz veya öneriniz mi var? Mesajınızı bekliyorum.' },
    'contact.name': { ar: 'الاسم الكريم', ckb: 'ناوی بەڕێز', en: 'Your Name', tr: 'Adınız' },
    'contact.contact_field': { ar: 'البريد أو وسيلة الرد', ckb: 'ئیمەیڵ یان ڕێگەی پەیوەندی', en: 'Email or handle for reply', tr: 'E-posta veya iletişim adresi' },
    'contact.subject': { ar: 'موضوع الرسالة', ckb: 'بابەتی پەیام', en: 'Subject', tr: 'Konu' },
    'contact.message': { ar: 'نص الرسالة', ckb: 'دەقی پەیام', en: 'Message', tr: 'Mesajınız' },
    'contact.send': { ar: 'إرسال الرسالة', ckb: 'ناردنی پەیام', en: 'Send Message', tr: 'Mesajı Gönder' },
    'contact.sending': { ar: 'جارٍ الإرسال...', ckb: 'پەیام دەنێردرێت...', en: 'Sending...', tr: 'Gönderiliyor...' },
    'contact.success': { ar: 'تم استلام رسالتك بنجاح! شكراً لتواصلك.', ckb: 'پەیامەکەت بەسەرکەوتوویی گەیشت! سوپاس بۆ پەیوەندیکردنت.', en: 'Message received successfully! Thank you for reaching out.', tr: 'Mesajınız başarıyla iletildi! İletişime geçtiğiniz için teşekkürler.' },

    // Visitor Auth Modal
    'auth.title': { ar: 'تسجيل دخول الزائر', ckb: 'چوونەژوورەوەی سەردانکەر', en: 'Visitor Sign In', tr: 'Ziyaretçi Girişi' },
    'auth.desc': { ar: 'سجّل الدخول للتفاعل مع المنشورات والتطبيقات وكتابة التعليقات.', ckb: 'بچۆ ژوورەوە بۆ ئەوەی کارلێک لەگەڵ پۆست و ئەپەکان بکەیت و لێدوان بنووسیت.', en: 'Sign in to interact with posts, star apps, and join the discussion.', tr: 'Gönderilerle etkileşime geçmek, uygulamaları değerlendirmek ve yorum yapmak için giriş yapın.' },
    'auth.google': { ar: 'المتابعة بحساب Google', ckb: 'بەردەوامبوون بە هەژماری Google', en: 'Continue with Google', tr: 'Google ile Devam Et' },
    'auth.or_email': { ar: 'أو باستخدام البريد الإلكتروني', ckb: 'یان لە ڕێگەی ئیمەیڵەوە', en: 'or continue with Email', tr: 'veya E-posta ile' },
    'auth.email_label': { ar: 'البريد الإلكتروني', ckb: 'ئیمەیڵ', en: 'Email address', tr: 'E-posta adresi' },
    'auth.password_label': { ar: 'كلمة المرور', ckb: 'تێپەڕەوشە', en: 'Password', tr: 'Şifre' },
    'auth.btn_login': { ar: 'دخول / إنشاء حساب', ckb: 'چوونەژوورەوە / دروستکردنی هەژمار', en: 'Sign In / Register', tr: 'Giriş Yap / Kaydol' },
    'auth.guest_continue': { ar: 'المتابعة كزائر بدون حساب', ckb: 'بەردەوامبوون وەک میوان', en: 'Continue as Guest', tr: 'Misafir Olarak Devam Et' },
    'auth.logged_in_as': { ar: 'مرحباً، ', ckb: 'بەخێربێیت، ', en: 'Welcome, ', tr: 'Hoş geldiniz, ' },

    // Web App Runner Modal
    'runner.title': { ar: 'تشغيل التطبيق مباشرة', ckb: 'کارپێکردنی ڕاستەوخۆی ئەپ', en: 'Live App Preview', tr: 'Canlı Uygulama Önizlemesi' },
    'runner.open_new_tab': { ar: 'فتح في نافذة جديدة ↗', ckb: 'کردنەوە لە پەڕەیەکی نوێدا ↗', en: 'Open in New Tab ↗', tr: 'Yeni Sekmede Aç ↗' },
    'runner.fullscreen': { ar: 'ملء الشاشة', ckb: 'تەواوی شاشە', en: 'Fullscreen', tr: 'Tam Ekran' },
    'runner.close': { ar: 'إغلاق المعاينة', ckb: 'داخستنی پێشبینین', en: 'Close Preview', tr: 'Önizlemeyi Kapat' },

    // Footer
    'footer.rights': { ar: 'جميع الحقوق محفوظة.', ckb: 'هەموو مافەکان پارێزراون.', en: 'All rights reserved.', tr: 'Tüm hakları saklıdır.' },
    'footer.owner_link': { ar: 'بوابة الإدارة', ckb: 'دەروازەی بەڕێوەبردن', en: 'Admin Access', tr: 'Yönetim Girişi' },
    'footer.built_with': { ar: 'صُنع بحب وإتقان', ckb: 'بە خۆشەویستی و وردکاری دروستکراوە', en: 'Crafted with care', tr: 'Özenle geliştirildi' }
  };

  function getSavedLang() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGS[saved]) return saved;
    } catch (e) {}
    return 'ar';
  }

  let currentLang = getSavedLang();

  function t(key, fallback = '') {
    const entry = DICTIONARY[key];
    if (!entry) return fallback || key;
    return entry[currentLang] || entry['ar'] || fallback || key;
  }

  function applyLanguage(lang) {
    if (!SUPPORTED_LANGS[lang]) lang = 'ar';
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}

    const meta = SUPPORTED_LANGS[lang];
    document.documentElement.lang = meta.code;
    document.documentElement.dir = meta.dir;

    // Update class on body for directional / font tuning
    document.body.classList.remove('lang-ar', 'lang-ckb', 'lang-en', 'lang-tr', 'dir-rtl', 'dir-ltr');
    document.body.classList.add(`lang-${lang}`, `dir-${meta.dir}`);

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = t(key);
      if (translation) {
        const attr = el.getAttribute('data-i18n-attr');
        if (attr) {
          el.setAttribute(attr, translation);
        } else {
          el.innerHTML = translation;
        }
      }
    });

    // Update active state in any language pickers
    document.querySelectorAll('[data-lang-picker] button, [data-lang-choice]').forEach(btn => {
      const target = btn.getAttribute('data-lang-choice');
      const isActive = target === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Dispatch custom event for dynamic components to re-render
    document.dispatchEvent(new CustomEvent('site:languageChanged', {
      detail: { lang, dir: meta.dir, meta }
    }));
  }

  function init() {
    applyLanguage(currentLang);
  }

  return {
    t,
    getLang: () => currentLang,
    getDir: () => SUPPORTED_LANGS[currentLang]?.dir || 'rtl',
    getSupported: () => SUPPORTED_LANGS,
    setLanguage: applyLanguage,
    init
  };
})();

// Auto-init on script load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => I18N.init());
} else {
  I18N.init();
}
