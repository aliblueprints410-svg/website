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
    'stat.rating': { ar: 'متوسط تقييم التطبيقات', ckb: 'تێکڕای هەڵسەنگاندنی ئەپەکان', en: 'Overall App Rating', tr: 'Genel Uygulama Puanı' },
    'stat.likes': { ar: 'إعجاباً وتفاعلاً', ckb: 'دڵخواز و کارلێک', en: 'Likes & Reactions', tr: 'Beğeni ve Etkileşim' },
    'stat.comments': { ar: 'تعليقاً ومراجعة', ckb: 'بۆچوون و پێداچوونەوە', en: 'Comments & Reviews', tr: 'Yorum ve İnceleme' },
    'stat.downloads': { ar: 'عملية تحميل', ckb: 'داگرتن', en: 'Downloads', tr: 'İndirme' },
    'stat.followers': { ar: 'متابعاً', ckb: 'شوێنکەوتوو', en: 'Followers', tr: 'Takipçi' },
    'stat.posts': { ar: 'منشوراً وتحديثاً', ckb: 'پۆست و نوێکاری', en: 'Posts & Updates', tr: 'Gönderi ve Güncelleme' },
    'stat.platforms': { ar: 'منصات مدعومة', ckb: 'پلاتفۆرمی پاڵپشتیکراو', en: 'Supported Platforms', tr: 'Desteklenen Platform' },
    'stat.satisfaction': { ar: 'نسبة رضا المستخدمين', ckb: 'ڕێژەی ڕەزامەندی', en: 'Satisfaction Rate', tr: 'Memnuniyet Oranı' },

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
    'footer.built_with': { ar: 'صُنع بحب وإتقان', ckb: 'بە خۆشەویستی و وردکاری دروستکراوە', en: 'Crafted with care', tr: 'Özenle geliştirildi' },

    // Categories & Labels
    'apps.categories_label': { ar: 'الأصناف:', ckb: 'پۆلەکان:', en: 'Categories:', tr: 'Kategoriler:' },
    'category.all': { ar: 'الكل', ckb: 'هەمووی', en: 'All', tr: 'Tümü' },
    'category.أدوات': { ar: 'أدوات', ckb: 'ئامرازەکان', en: 'Tools', tr: 'Araçlar' },
    'category.تواصل اجتماعي': { ar: 'تواصل اجتماعي', ckb: 'تۆڕە کۆمەڵایەتییەکان', en: 'Social', tr: 'Sosyal' },
    'category.للأطفال': { ar: 'للأطفال', ckb: 'بۆ منداڵان', en: 'Kids', tr: 'Çocuklar' },
    'category.إنتاجية': { ar: 'إنتاجية', ckb: 'بەرهەمداری', en: 'Productivity', tr: 'Verimlilik' },
    'category.تعليم': { ar: 'تعليم', ckb: 'پەروەردە و فێرکاری', en: 'Education', tr: 'Eğitim' },
    'category.ألعاب': { ar: 'ألعاب', ckb: 'یارییەکان', en: 'Games', tr: 'Oyunlar' },
    'category.تصميم': { ar: 'تصميم', ckb: 'دیزاین', en: 'Design', tr: 'Tasarım' },
    'category.أعمال': { ar: 'أعمال', ckb: 'کار و بازرگانی', en: 'Business', tr: 'İş Dünyası' },
    'category.مال وأعمال': { ar: 'مال وأعمال', ckb: 'دارایی و بازرگانی', en: 'Finance & Business', tr: 'Finans ve İş' },
    'category.أخبار ومعلومات': { ar: 'أخبار ومعلومات', ckb: 'هەواڵ و زانیاری', en: 'News & Info', tr: 'Haber ve Bilgi' },
    'category.صحة ولياقة': { ar: 'صحة ولياقة', ckb: 'تەندروستی و لەشجوانی', en: 'Health & Fitness', tr: 'Sağlık ve Fitness' },
    'category.إسلامي': { ar: 'إسلامي', ckb: 'ئیسلامی', en: 'Islamic', tr: 'İslami' },
    'category.ترفيه': { ar: 'ترفيه', ckb: 'کات بەسەربردن', en: 'Entertainment', tr: 'Eğlence' },

    // App Card & Specifications
    'app.version_prefix': { ar: 'الإصدار', ckb: 'وەشان', en: 'Version', tr: 'Sürüm' },
    'app.view_details_label': { ar: 'عرض التفاصيل', ckb: 'پیشاندانی وردەکارییەکان', en: 'View Details', tr: 'Detayları Gör' },
    'app.details_and_dl': { ar: 'التفاصيل والتحميل', ckb: 'وردەکاری و داگرتن', en: 'Details & Download', tr: 'Detaylar ve İndir' },
    'app.download_btn': { ar: 'تحميل التطبيق', ckb: 'داگرتنی ئەپ', en: 'Download App', tr: 'Uygulamayı İndir' },
    'app.open_web': { ar: 'فتح التطبيق كمتصفح', ckb: 'کردنەوە لە وێبگەڕدا', en: 'Open in Browser', tr: 'Tarayıcıda Aç' },
    'app.privacy': { ar: 'الخصوصية', ckb: 'پاراستنی نهێنی', en: 'Privacy', tr: 'Gizlilik' },
    'app.platform': { ar: 'المنصة', ckb: 'پلاتفۆرم', en: 'Platform', tr: 'Platform' },
    'app.format': { ar: 'الصيغة', ckb: 'فۆرمات', en: 'Format', tr: 'Format' },
    'app.version': { ar: 'الإصدار', ckb: 'وەشان', en: 'Version', tr: 'Sürüm' },
    'app.size': { ar: 'الحجم', ckb: 'قەبارە', en: 'Size', tr: 'Boyut' },
    'app.price_free': { ar: 'مجاني', ckb: 'بێبەرامبەر', en: 'Free', tr: 'Ücretsiz' },
    'app.download_unavailable': { ar: 'الرابط غير متاح بعد', ckb: 'بەستەرەکە هێشتا بەردەست نییە', en: 'Link not available yet', tr: 'Bağlantı henüz mevcut değil' },

    // Reviews & Ratings
    'reviews.tag': { ar: 'آراء المستخدمين', ckb: 'بۆچوونی بەکارهێنەران', en: 'User Reviews', tr: 'Kullanıcı Yorumları' },
    'reviews.title': { ar: 'التقييمات والمراجعات', ckb: 'هەڵسەنگاندن و پێداچوونەوەکان', en: 'Ratings & Reviews', tr: 'Değerlendirmeler ve Yorumlar' },
    'reviews.interacting_as': { ar: 'تتفاعل بصفتك:', ckb: 'کارلێک دەکەیت وەک:', en: 'Interacting as:', tr: 'Olarak etkileşimdesiniz:' },
    'reviews.change_name': { ar: '(تغيير الاسم)', ckb: '(گۆڕینی ناو)', en: '(Change Name)', tr: '(İsmi Değiştir)' },
    'reviews.placeholder': { ar: 'اكتب رأيك أو تجربتك مع التطبيق...', ckb: 'ڕا یان ئەزموونی خۆت لەگەڵ ئەپەکە بنووسە...', en: 'Write your thoughts or review...', tr: 'Uygulama hakkındaki deneyiminizi yazın...' },
    'reviews.submit': { ar: 'إرسال التقييم', ckb: 'ناردنی هەڵسەنگاندن', en: 'Submit Review', tr: 'Değerlendirmeyi Gönder' },
    'reviews.submitting': { ar: 'جارٍ الإرسال... ⏳', ckb: 'دەنێردرێت... ⏳', en: 'Submitting... ⏳', tr: 'Gönderiliyor... ⏳' },
    'reviews.new_rating': { ar: '(تقييم جديد)', ckb: '(هەڵسەنگاندنی نوێ)', en: '(New rating)', tr: '(Yeni değerlendirme)' },
    'reviews.ratings_count': { ar: 'تقييم', ckb: 'هەڵسەنگاندن', en: 'reviews', tr: 'değerlendirme' },
    'reviews.no_reviews': { ar: 'لا توجد تقييمات بعد. كن أول من يقيّم هذا التطبيق! 🌟', ckb: 'هێشتا هیچ هەڵسەنگاندنێک نییە. یەکەم کەس بە کە هەڵسەنگاندن دەکات! 🌟', en: 'No reviews yet. Be the first to review! 🌟', tr: 'Henüz değerlendirme yok. İlk değerlendiren siz olun! 🌟' },

    // Posts & Feed
    'posts.filter_all': { ar: 'الكل', ckb: 'هەمووی', en: 'All', tr: 'Tümü' },
    'posts.sidebar_author_title': { ar: 'عن صاحب المساحة', ckb: 'دەربارەی خاوەنی ئەم شوێنە', en: 'About the Creator', tr: 'Alan Sahibi Hakkında' },
    'posts.sidebar_learn_more': { ar: 'تعرف عليّ أكثر ←', ckb: 'زیاتر لەسەرم بزانە ←', en: 'Learn more about me →', tr: 'Hakkımda daha fazlası →' },
    'posts.sidebar_portfolio_title': { ar: 'معرض الأعمال', ckb: 'پێشانگای کارەکان', en: 'Portfolio', tr: 'Portfolyo' },
    'posts.sidebar_portfolio_head': { ar: 'استكشف التطبيقات', ckb: 'ئەپەکان بدۆزەرەوە', en: 'Explore Apps', tr: 'Uygulamaları Keşfet' },
    'posts.sidebar_portfolio_desc': { ar: 'تصفح وحمل جميع التطبيقات والمشاريع البرمجية المتاحة لتجربتها مباشرة على مختلف المنصات.', ckb: 'سەردانی هەموو ئەپ و پڕۆژە نەرمەکاڵاییە بەردەستەکان بکە بۆ تاقیکردنەوەیان لەسەر پلاتفۆرمە جیاوازەکان.', en: 'Browse and download software projects built for various platforms.', tr: 'Farklı platformlar için geliştirilen yazılım projelerini keşfedin ve indirin.' },
    'posts.likes_label': { ar: 'إعجاباً', ckb: 'بەدڵبوون', en: 'likes', tr: 'beğeni' },
    'posts.comments_label': { ar: 'تعليق', ckb: 'لێدوان', en: 'comments', tr: 'yorum' },
    'posts.visitor_comment_prefix': { ar: 'اكتب تعليقاً بصفتك: ', ckb: 'لێدوانێک بنووسە وەک: ', en: 'Write a comment as: ', tr: 'Olarak yorum yazın: ' },
    'posts.send_btn': { ar: 'إرسال', ckb: 'ناردن', en: 'Send', tr: 'Gönder' },
    'posts.reply_btn': { ar: 'رد', ckb: 'وەڵام', en: 'Reply', tr: 'Yanıtla' },
    'posts.visitor_default': { ar: 'زائر', ckb: 'سەردانکەر', en: 'Visitor', tr: 'Ziyaretçi' },

    // Composer
    'composer.owner_head': { ar: 'كتابة ونشر تدوينة جديدة (خاص بالمالك)', ckb: 'نووسین و بڵاوکردنەوەی پۆستی نوێ (تایبەت بە خاوەن)', en: 'Write & Publish New Post (Owner Only)', tr: 'Yeni Gönderi Yaz ve Yayınla (Sadece Yönetici)' },
    'composer.title_ph': { ar: 'عنوان التدوينة أو الفكرة...', ckb: 'ناونیشانی پۆست یان بیرۆکە...', en: 'Post title or idea...', tr: 'Gönderi başlığı veya fikir...' },
    'composer.body_ph': { ar: 'اكتب تفاصيل التدوينة أو التحديث هنا...', ckb: 'وردەکاری پۆست یان نوێکاری لێرە بنووسە...', en: 'Write post details or updates here...', tr: 'Gönderi detaylarını buraya yazın...' },
    'composer.publish_btn': { ar: 'نشر التدوينة الآن 🚀', ckb: 'ئێستا پۆستەکە بڵاوبکەرەوە 🚀', en: 'Publish Post Now 🚀', tr: 'Gönderiyi Şimdi Yayınla 🚀' },

    // About Skills
    'about.skill_ee': { ar: 'هندسة كهربائية', ckb: 'ئەندازیاری کارەبا', en: 'Electrical Engineering', tr: 'Elektrik Mühendisliği' },
    'about.skill_ui': { ar: 'تطوير الواجهات', ckb: 'گەشەپێدانی ڕووکار', en: 'Frontend & UI', tr: 'Arayüz Geliştirme' },
    'about.skill_ai': { ar: 'الذكاء الاصطناعي', ckb: 'ژیریی دەستکرد', en: 'Artificial Intelligence', tr: 'Yapay Zeka' },

    // Page Titles
    'title.home': { ar: 'مساحة — علي محمد', ckb: 'مەودا — عەلی محەمەد', en: 'Space — Ali Muhammed', tr: 'Mesafe — Ali Muhammed' },
    'title.apps': { ar: 'معرض التطبيقات — مساحة', ckb: 'پێشانگای ئەپەکان — مەودا', en: 'App Directory — Space', tr: 'Uygulama Rehberi — Mesafe' },
    'title.posts': { ar: 'المنشورات والأفكار — مساحة', ckb: 'پۆستەکان و بیرۆکەکان — مەودا', en: 'Posts & Thoughts — Space', tr: 'Gönderiler ve Fikirler — Mesafe' },
    'title.about': { ar: 'عنّي — مساحة', ckb: 'دەربارەی من — مەودا', en: 'About Me — Space', tr: 'Hakkımda — Mesafe' },
    'title.contact': { ar: 'تواصل — مساحة', ckb: 'پەیوەندی — مەودا', en: 'Contact — Space', tr: 'İletişim — Mesafe' },
    'title.app_detail': { ar: 'تفاصيل التطبيق — مساحة', ckb: 'وردەکاری ئەپ — مەودا', en: 'App Details — Space', tr: 'Uygulama Detayları — Mesafe' },
    'crumb.details': { ar: 'التفاصيل', ckb: 'وردەکاری', en: 'Details', tr: 'Detaylar' }
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

    // Update document title based on current page
    const pathname = (location.pathname || '').toLowerCase();
    let titleKey = 'title.home';
    if (pathname.includes('apps.html')) titleKey = 'title.apps';
    else if (pathname.includes('posts.html')) titleKey = 'title.posts';
    else if (pathname.includes('about.html')) titleKey = 'title.about';
    else if (pathname.includes('contact.html')) titleKey = 'title.contact';
    else if (pathname.includes('app.html')) titleKey = 'title.app_detail';
    const translatedTitle = t(titleKey);
    if (translatedTitle && !location.search.includes('slug=') && !location.search.includes('app=')) {
      document.title = translatedTitle;
    }

    // Dispatch custom event for dynamic components to re-render
    document.dispatchEvent(new CustomEvent('site:languageChanged', {
      detail: { lang, dir: meta.dir, meta }
    }));
  }

  function translateCategory(cat) {
    if (!cat) return '';
    return t(`category.${cat}`, cat);
  }

  function translateAll(root = document) {
    if (!root) return;
    root.querySelectorAll('[data-i18n]').forEach(el => {
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
    translateCategory,
    translateAll,
    init
  };
})();
globalThis.I18N = I18N;

// Auto-init on script load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => I18N.init());
} else {
  I18N.init();
}
