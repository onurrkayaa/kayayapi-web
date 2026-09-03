import { contactEmail, type ProjectId } from "../data/site";

export type Locale = "tr" | "en";

type NavLink = { label: string; href: string };
type Titled = { title: string; description: string };
type Stat = { value: string; label: string };
type StripItem = { name: string; type: string };
type DesignStep = { title: string; description: string };

type ProjectCopy = {
  name: string;
  category: string;
  /** Kart altindaki tek satirlik ozet. */
  summary: string;
  /** Detay sayfasi giris cumlesi. */
  intro: string;
  /** Detay sayfasi metni: saglamlik, guvenlik ve talebe gore duzenleme. */
  body: string[];
  scope: string;
  status: string;
  scale: string;
  /** Galeri gorsellerinin altindaki gorunum etiketleri. */
  views: string[];
};

type OfficeCopy = { label: string; value: string };

type LegalSection = { heading: string; body: string[] };

type LegalDoc = {
  breadcrumb: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export type Dictionary = {
  nav: {
    links: NavLink[];
    contact: string;
    menuLabel: string;
    closeLabel: string;
    home: string;
  };
  hero: {
    eyebrow: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    description: string;
    imageAlt: string;
  };
  strip: {
    items: StripItem[];
  };
  manifesto: {
    text: string;
  };
  stats: {
    label: string;
    items: Stat[];
  };
  services: {
    eyebrow: string;
    title: string;
    items: Titled[];
  };
  advantages: {
    title: string;
    items: Titled[];
  };
  map: {
    eyebrow: string;
    title: string;
    description: string;
    activeCountLabel: string;
    officesTitle: string;
    offices: Record<string, OfficeCopy>;
    soonNote: string;
  };
  projects: {
    eyebrow: string;
    title: string;
    description: string;
    breadcrumb: string;
    detailScopeLabel: string;
    detailStatusLabel: string;
    detailScaleLabel: string;
    galleryTitle: string;
    backToProjects: string;
    nextProject: string;
    items: Record<ProjectId, ProjectCopy>;
  };
  about: {
    breadcrumb: string;
    heroTitle: string;
    eyebrow: string;
    title: string;
    paragraphs: string[];
    valuesTitle: string;
    values: Titled[];
  };
  design: {
    breadcrumb: string;
    heroTitle: string;
    eyebrow: string;
    title: string;
    description: string;
    steps: DesignStep[];
  };
  contact: {
    breadcrumb: string;
    heroTitle: string;
    detailsTitle: string;
    detailsDescription: string;
    addressLabel: string;
    addressValue: string;
    addressNote: string;
    emailLabel: string;
    formTitle: string;
    formDescription: string;
    nameLabel: string;
    phoneFieldLabel: string;
    subjectLabel: string;
    messageLabel: string;
    submit: string;
    submitting: string;
    success: string;
  };
  cta: {
    title: string;
    description: string;
    button: string;
    imageAlt: string;
  };
  assistant: {
    eyebrow: string;
    title: string;
    description: string;
    privacyNote: string;
    placeholder: string;
    sendLabel: string;
    clearLabel: string;
    emptyHint: string;
    suggestions: string[];
    thinking: string;
    errors: {
      invalid_request: string;
      forbidden: string;
      too_large: string;
      rate_limited: string;
      unavailable: string;
      network: string;
      turnstile: string;
    };
  };
  legal: {
    notice: LegalDoc;
    privacy: LegalDoc;
    kvkk: LegalDoc;
  };
  footer: {
    tagline: string;
    email: string;
    servicesTitle: string;
    companyTitle: string;
    regionsTitle: string;
    company: NavLink[];
    rights: string;
    legal: NavLink[];
  };
};

export const dictionary = {
  tr: {
    nav: {
      links: [
        { label: "Hakkımızda", href: "/hakkimizda" },
        { label: "Projeler", href: "/projeler" },
        { label: "Tasarım ve İnovasyon", href: "/tasarim-ve-inovasyon" },
        { label: "Bölgeler", href: "/#bolgeler" },
      ],
      contact: "İletişim",
      menuLabel: "Menüyü aç",
      closeLabel: "Menüyü kapat",
      home: "Anasayfa",
    },
    hero: {
      eyebrow: "İnşaat · Mimari · Taahhüt",
      titleLine1: "Sağlam",
      titleLine2: "Yapılar,",
      titleLine3: "Kalıcı Değer.",
      description:
        "Konut ve iş binalarından müstakil evlere, peyzaj düzenlemesinden anahtar teslim taahhüde kadar; projeyi ilk çizgisinden son detayına biz üstleniyoruz.",
      imageAlt: "Akşam ışığında modern iş binası cephesi",
    },
    strip: {
      items: [
        { name: "Müstakil Aile Evi", type: "Konsept çalışması" },
        { name: "İş Merkezi", type: "Ofis yapısı" },
        { name: "Konut Bloğu", type: "Yaşam binası" },
        { name: "Bahçe Aksı", type: "Peyzaj" },
        { name: "Bahçeli Ev", type: "Müstakil yapı" },
        { name: "Ofis Katları", type: "Ticari yapı" },
        { name: "Balkonlu Cephe", type: "Konut" },
        { name: "Teras Düzeni", type: "Dış mekân" },
      ],
    },
    manifesto: {
      text:
        "İşimiz yapı kurmak; sözümüz onu ayakta tutmak. Her projeyi kendi evimizmiş gibi planlar, malzemeyi ve işçiliği pazarlık konusu yapmayız. Zamanında teslim, şeffaf bütçe ve arkasında durduğumuz bir garanti: Kaya Yapı'nın tamamı bu üç cümleden ibarettir.",
    },
    stats: {
      label: "Kaya Yapı rakamlarla",
      items: [
        { value: "25", label: "yıllık saha deneyimi" },
        { value: "180+", label: "tamamlanan proje" },
        { value: "420.000", label: "m² inşa edilen alan" },
        { value: "10", label: "yıl yapı garantisi" },
      ],
    },
    services: {
      eyebrow: "Uzmanlık",
      title: "Ne yapıyoruz",
      items: [
        {
          title: "Konut & Yaşam Binaları",
          description:
            "Ailelerin gerçekten yaşadığı binalar tasarlıyoruz: doğru yönlenmiş daireler, kullanılabilir balkonlar, gösterişten çok konfor. Ruhsattan iskâna kadar süreç tek elden yürür.",
        },
        {
          title: "Ofis & İş Merkezleri",
          description:
            "Zemin katta ticaret, üst katlarda bağımsız ofis kurgusu. Esnek bölünebilen katlar, güçlü altyapı ve işletme maliyetini düşüren cephe detayları.",
        },
        {
          title: "Müstakil Ev & Villa",
          description:
            "Tek parsellik işlerde arazi, yön ve bütçe birlikte çözülür. Havuz, sauna ve spa uygulamaları da isteğe bağlı olarak aynı sözleşmeye dahil edilir.",
        },
        {
          title: "Peyzaj & Dış Mekân",
          description:
            "Bahçe, teras ve yaklaşım aksını yapının bir parçası olarak ele alıyoruz. Bitkilendirme, sert zemin, aydınlatma ve sulama tek projede çözülür.",
        },
        {
          title: "Taahhüt & Mühendislik",
          description:
            "Anahtar teslim taahhüt, altyapı ve güçlendirme işleri. Sabit bütçe, net iş programı ve haftalık ilerleme raporuyla çalışırız.",
        },
      ],
    },
    advantages: {
      title: "Bizimle çalışınca kazandığınız",
      items: [
        {
          title: "Tek muhatap",
          description:
            "Proje boyunca tek bir şantiye şefiyle konuşursunuz. Taşeron kalabalığı sizin sorununuz olmaz.",
        },
        {
          title: "Sabit bütçe",
          description:
            "Kalem kalem açılmış, sonradan sürpriz çıkmayan bir keşif ve sözleşmeye bağlanmış fiyat.",
        },
        {
          title: "Zamanında teslim",
          description:
            "İş programı sözleşmenin eki; gecikme halinde yaptırımı da biz kabul ederiz.",
        },
        {
          title: "Deprem odaklı statik",
          description:
            "Her proje güncel deprem yönetmeliğine göre bağımsız kontrol mühendisiyle iki kez hesaplanır.",
        },
        {
          title: "Malzemede şeffaflık",
          description:
            "Kullanılan her ürünün markası ve sınıfı sözleşmede yazar; muadili ancak onayınızla değişir.",
        },
        {
          title: "Teslim sonrası servis",
          description:
            "İskân sonrası 10 yıl yapı garantisi ve ilk yıl ücretsiz bakım ziyaretleri.",
        },
      ],
    },
    map: {
      eyebrow: "Bölgeler",
      title: "Türkiye'de nerelerdeyiz",
      description:
        "Beş ilde aktif şantiye ve teknik ekip; diğer illerde bayilik ve proje ortaklıklarıyla yakında.",
      activeCountLabel: "Aktif il",
      officesTitle: "Ofisler",
      offices: {
        istanbul: { label: "Çok yakında merkez ofis", value: "Ataşehir, İstanbul" },
        adiyaman: { label: "Ofis", value: "Adıyaman" },
        tekirdag: { label: "Planlanan ofis", value: "Tekirdağ" },
        mugla: { label: "Planlanan ofis", value: "Muğla" },
        antalya: { label: "Planlanan ofis", value: "Antalya" },
      },
      soonNote: "Ofisi olmayan illerde işi kendi ekibimiz yürütüyor; açılış planı devam ediyor.",
    },
    projects: {
      eyebrow: "Seçilmiş işler",
      title: "Projeler",
      description:
        "Tasarım arşivimizden dört çalışma. Her biri farklı bir ölçeği ve farklı bir yaşama biçimini anlatıyor.",
      breadcrumb: "Projeler",
      detailScopeLabel: "Proje tipi",
      detailStatusLabel: "Durum",
      detailScaleLabel: "Ölçek",
      galleryTitle: "Görünümler",
      backToProjects: "Tüm projeler",
      nextProject: "Sonraki proje",
      items: {
        ofis: {
          name: "Meydan İş Merkezi",
          category: "Ofis & İş Merkezi",
          summary: "Zemin katta ticaret, üstünde bağımsız ofis katları.",
          intro:
            "Şehir içinde, yürüme mesafesinde bir iş merkezi kurgusu: zemin katta ticaret, üzerinde bölünebilen ofis katları.",
          body: [
            "Taşıyıcı sistem güncel deprem yönetmeliğine göre, bağımsız kontrol mühendisiyle iki kez hesaplandı. Perde duvar düzeni katlar arasında kesintisiz sürüyor; bu yüzden bina hem yatay yükte hem de zaman içinde davranışını koruyor.",
            "Güvenlik tarafında yangın kaçış merdiveni, duman tahliyesi, kartlı geçiş ve kesintisiz kamera altyapısı proje aşamasında yerleştirildi; sonradan eklenen bir çözüm değil.",
            "Kat planları sabit değil. Bölme duvarlar taşıyıcıya bağlı olmadığı için bir katı tek firmaya da, dört ayrı ofise de bölebiliyoruz. İhtiyacınıza göre birlikte düzenliyoruz.",
          ],
          scope: "Ofis yapısı",
          status: "Konsept çalışması",
          scale: "7 kat · zemin ticaret",
          views: [
            "Genel perspektif",
            "Köşe görünümü",
            "Yan cephe",
            "Cephe detayı",
          ],
        },
        konut: {
          name: "Bahçeli Konut Bloğu",
          category: "Konut & Yaşam Binası",
          summary: "Ailelerin günlük hayatına göre kurgulanmış yaşam binası.",
          intro:
            "Gösterişten çok kullanıma çalışan bir yaşam binası: doğru yönlenmiş daireler, gerçekten kullanılan balkonlar, ortak bahçe.",
          body: [
            "Radye temel ve perde ağırlıklı taşıyıcı sistem, binayı deprem yönetmeliğinin istediği seviyenin üzerinde tutuyor. Beton sınıfı ve donatı detayları sözleşmenin ekinde açıkça yazılı.",
            "Girişte kapalı otopark bağlantısı, aydınlatılmış ortak alanlar ve her katta yangın algılama var. Çocuklu ailelerin oturduğu bir binada güvenliği sonradan düşünülecek bir başlık saymıyoruz.",
            "Daire tipleri esnek: 2+1 ve 3+1 kurguları arasında geçiş yapılabiliyor, ıslak hacim yerleri sabit kalmak kaydıyla iç planı isteğinize göre düzenliyoruz.",
          ],
          scope: "Yaşam binası",
          status: "Konsept çalışması",
          scale: "5 kat · 20 daire",
          views: ["Genel perspektif", "Balkon detayı", "Alt açı", "Çevre düzenlemesi"],
        },
        mustakil: {
          name: "Müstakil Aile Evi",
          category: "Müstakil Ev",
          summary: "Bahçesiyle birlikte tasarlanan iki katlı aile evi.",
          intro:
            "Villa gösterişine kaçmadan, bahçesiyle birlikte tasarlanmış iki katlı bir aile evi.",
          body: [
            "Tek parsellik işlerde en kritik konu zemin. Zemin etüdü sonrasında temel tipi seçiliyor, taşıyıcı sistem buna göre kuruluyor. Yalıtım ve su detayları ilk çizimde çözülüyor, şantiyede tartışılmıyor.",
            "Bahçe kapısından iç kapıya kadar tek sistem üzerinde çalışan aydınlatma, alarm ve kamera altyapısı standart. Ev boşken de kontrol edilebiliyor.",
            "Oda sayısından mutfak kurgusuna, teras derinliğinden cephe malzemesine kadar her başlık sizinle birlikte belirleniyor. İsteğinize göre düzenliyoruz; hazır bir tip proje dayatmıyoruz.",
          ],
          scope: "Müstakil yapı",
          status: "Konsept çalışması",
          scale: "2 kat · bahçeli",
          views: [
            "Giriş cephesi",
            "Bahçe cephesi",
            "Yaklaşım aksı",
            "Yan cephe",
          ],
        },
        peyzaj: {
          name: "Bahçe & Peyzaj Düzenlemesi",
          category: "Peyzaj & Dış Mekân",
          summary: "Yapıyla aynı dilde kurulan bahçe ve yaklaşım aksı.",
          intro:
            "Bahçeyi yapının devamı olarak ele alan bir düzenleme: yaklaşım aksı, teras, bitkilendirme ve aydınlatma tek projede.",
          body: [
            "Sert zeminler drenajıyla birlikte hesaplanıyor. Doğru eğim ve doğru alt tabaka olmadan hiçbir yürüyüş yolu ilk kıştan sağlam çıkmaz; bu yüzden görünmeyen kısma görünen kısım kadar zaman ayırıyoruz.",
            "Merdiven, istinat ve havuz kenarı gibi riskli noktalarda kaymaz yüzey, korkuluk yüksekliği ve gece aydınlatması standart olarak çözülüyor.",
            "Bitki seçimi iklime ve bakım isteğinize göre yapılıyor. Az bakım isteyen bir bahçe de, mevsimlik çiçeğiyle yaşayan bir bahçe de kurabiliriz; isteğinize göre düzenliyoruz.",
          ],
          scope: "Peyzaj uygulaması",
          status: "Konsept çalışması",
          scale: "Bahçe · teras · aydınlatma",
          views: [
            "Genel görünüm",
            "Avlu ve sert zemin",
            "Yürüyüş aksı",
            "Uygulama detayı",
          ],
        },
      },
    },
    about: {
      breadcrumb: "Hakkımızda",
      heroTitle: "Uzun bir yolculuk tek bir adımla başlar",
      eyebrow: "01 — Biz kimiz?",
      title: "Sağlam yapılar kuran bir ekibiz.",
      paragraphs: [
        "Kaya Yapı; konut, iş binası, müstakil ev ve peyzaj işlerini tek çatı altında yürüten bir inşaat ve mimarlık firmasıdır. En küçük alanı bile yaşanabilir, güvenli ve kalıcı bir mekâna dönüştürmeyi hedefliyoruz.",
        "Mimar, statikçi, mekanik ekip ve şantiye şefi aynı masada çalışır. Bu yüzden projede verilen söz sahada da aynı kalır.",
      ],
      valuesTitle: "Neye göre çalışıyoruz",
      values: [
        {
          title: "Sağlamlık",
          description:
            "Taşıyıcı sistem, güncel deprem yönetmeliğinin istediği seviyenin üzerinde kurulur.",
        },
        {
          title: "Şeffaflık",
          description:
            "Malzeme, süre ve fiyat sözleşmede yazılıdır; sonradan sürpriz çıkmaz.",
        },
        {
          title: "Süreklilik",
          description:
            "Teslimden sonra da aynı ekip arkasında durur: 10 yıl yapı garantisi.",
        },
      ],
    },
    design: {
      breadcrumb: "Tasarım ve İnovasyon",
      heroTitle: "Modern tasarım",
      eyebrow: "Tasarım ve İnovasyon",
      title: "Çizgiden sahaya dört adım",
      description:
        "Her projeyi aynı dört adımdan geçiriyoruz. Adımlardan biri atlandığında bedelini sahada ödediğimizi biliyoruz.",
      steps: [
        {
          title: "Tasarım",
          description:
            "Modern mimarinin gerekliliklerini ve değişen yaşam standartlarını gözeterek, uzun ömürlü mekânlar kuracak şekilde proje geliştiriyoruz.",
        },
        {
          title: "Analiz",
          description:
            "Fizibilite ve zemin çalışmalarıyla, yatırım veya yaşam alanı olarak tercih edilecek her alanda maksimum faydayı hesaplayan teknik raporlar hazırlıyoruz.",
        },
        {
          title: "Danışmanlık",
          description:
            "Sahada edindiğimiz tecrübeyi teknik verilerle destekleyerek yatırımcıya şeffaf bir yol haritası sunuyoruz.",
        },
        {
          title: "Uygulama",
          description:
            "Küçük ya da büyük, her yapının bir insan yaşam alanı olduğunu unutmadan; TSE ve ilgili yönetmeliklerin belirlediği standartların üzerinde inşa ediyoruz.",
        },
      ],
    },
    contact: {
      breadcrumb: "İletişim",
      heroTitle: "İletişim bilgileri",
      detailsTitle: "İletişim detayları",
      detailsDescription:
        "Herhangi bir yardıma ihtiyacınız olursa bizimle iletişime geçin. Bize bir e-posta gönderin ya da formu doldurun; aynı hafta içinde dönüş yapalım.",
      addressLabel: "Adres",
      addressValue: "Ataşehir, İstanbul",
      addressNote: "Tam konum yakında paylaşılacak.",
      emailLabel: "E-posta",
      formTitle: "İletişim formu",
      formDescription:
        "Herhangi bir sorunuz varsa bize mesaj gönderebilirsiniz. 2 iş günü içinde sizi arayacağız.",
      nameLabel: "Adınız Soyadınız",
      phoneFieldLabel: "Telefon Numaranız",
      subjectLabel: "Konu",
      messageLabel: "Mesaj",
      submit: "Gönder",
      submitting: "Gönderiliyor…",
      success: "Mesajınız alındı. En kısa sürede size dönüş yapacağız.",
    },
    cta: {
      title: "Aklınızda bir proje mi var?",
      description:
        "Arsanızı, ihtiyacınızı ve bütçenizi anlatın; 5 iş günü içinde bir yol haritasıyla dönelim.",
      button: "İletişime geçin",
      imageAlt: "Gün ışığında iş binası cephesi",
    },
    assistant: {
      eyebrow: "Yapay zekâ asistanı",
      title: "Soru sorun",
      description:
        "Kaya Yapı'nın çalışma biçimi, hizmetleri ve projeleri hakkında aklınıza takılan her şeyi buraya yazabilirsiniz. Asistan yalnızca kurumsal bilgilerimize dayanarak yanıt verir.",
      privacyNote:
        "Yanıtlar yapay zekâ tarafından üretilir ve bağlayıcı değildir. Mesajlarınız kaydedilmez; lütfen kişisel verilerinizi paylaşmayın.",
      placeholder: "Sorunuzu yazın…",
      sendLabel: "Gönder",
      clearLabel: "Sohbeti temizle",
      emptyHint: "Başlamak için bir soru seçin ya da kendi sorunuzu yazın.",
      suggestions: [
        "Anahtar teslim çalışıyor musunuz?",
        "Fiyat nasıl belirleniyor?",
        "Hangi illerde iş alıyorsunuz?",
        "Bir proje ne kadar sürer?",
      ],
      thinking: "Yazıyor…",
      errors: {
        invalid_request:
          "Sorunuzu işleyemedik. Lütfen daha kısa bir metinle tekrar deneyin.",
        forbidden:
          "İstek doğrulanamadı. Sayfayı yenileyip tekrar deneyin.",
        too_large: "Mesajınız çok uzun. Lütfen kısaltıp tekrar gönderin.",
        rate_limited:
          "Kısa sürede çok fazla soru gönderildi. Birkaç dakika sonra tekrar deneyin.",
        unavailable:
          "Asistan şu anda yanıt veremiyor. Kısa süre sonra tekrar deneyin ya da iletişim sayfasından bize yazın.",
        network:
          "Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.",
        turnstile:
          "Güvenlik doğrulaması tamamlanamadı. Sayfayı yenileyip tekrar deneyin.",
      },
    },
    legal: {
      notice: {
        breadcrumb: "Yasal Uyarı",
        title: "Yasal Uyarı",
        updated: "Son güncelleme: Eylül 2026",
        intro:
          "Bu internet sitesi Kaya Yapı tarafından işletilir. Siteyi kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.",
        sections: [
          {
            heading: "Sitenin amacı",
            body: [
              "Site, Kaya Yapı'nın hizmetlerini ve çalışma biçimini tanıtmak amacıyla yayımlanır. Sitedeki hiçbir içerik teklif, taahhüt ya da sözleşme yerine geçmez.",
              "Taraflar arasında bağlayıcı olan tek belge, karşılıklı imzalanan yazılı sözleşme ve ekleridir.",
            ],
          },
          {
            heading: "Görseller ve proje içerikleri",
            body: [
              "Projeler bölümündeki çalışmalar konsept niteliğindedir. Görseller temsilidir; tamamlanmış bir yapının birebir kaydı değildir.",
              "Kat adedi, metrekare ve süre gibi değerler örnek niteliğinde olup her projede ayrıca belirlenir.",
            ],
          },
          {
            heading: "Fikri mülkiyet hakları",
            body: [
              "Sitedeki metinler, marka adı, logo ve sayfa düzeni Kaya Yapı'ya aittir. İzin alınmadan kopyalanamaz, çoğaltılamaz veya ticari amaçla kullanılamaz.",
              "Sitede kullanılan fotoğraflar Unsplash lisansı kapsamındadır ve ilgili lisans koşullarına tabidir.",
            ],
          },
          {
            heading: "Sorumluluğun sınırlandırılması",
            body: [
              "İçerik özenle hazırlanır; ancak güncelliği, doğruluğu ve eksiksizliği konusunda koşulsuz bir garanti verilmez.",
              "Sitenin kullanımından ya da kullanılamamasından doğabilecek dolaylı zararlardan Kaya Yapı sorumlu tutulamaz.",
            ],
          },
          {
            heading: "Dış bağlantılar",
            body: [
              "Site üzerinden üçüncü taraf sitelere bağlantı verilmesi halinde, bu sitelerin içeriğinden ve gizlilik uygulamalarından Kaya Yapı sorumlu değildir.",
            ],
          },
          {
            heading: "Değişiklik hakkı",
            body: [
              "Kaya Yapı, sitedeki içeriği ve bu metni önceden bildirimde bulunmaksızın değiştirme hakkını saklı tutar. Güncel sürüm her zaman bu sayfada yayımlanır.",
            ],
          },
          {
            heading: "Uygulanacak hukuk",
            body: [
              "Bu metne ve sitenin kullanımına Türk hukuku uygulanır. Doğabilecek uyuşmazlıklarda İstanbul Anadolu Mahkemeleri ve İcra Daireleri yetkilidir.",
            ],
          },
          {
            heading: "İletişim",
            body: [
              `Bu metinle ilgili sorularınızı ${contactEmail} adresine iletebilirsiniz.`,
            ],
          },
        ],
      },
      privacy: {
        breadcrumb: "Gizlilik Politikası",
        title: "Gizlilik Politikası",
        updated: "Son güncelleme: Eylül 2026",
        intro:
          "Kaya Yapı olarak yalnızca ihtiyacımız olan veriyi topluyoruz. Bu metin, sitede hangi verinin neden işlendiğini sade bir dille açıklar.",
        sections: [
          {
            heading: "Hangi verileri topluyoruz",
            body: [
              "Yalnızca iletişim formuna kendi girdiğiniz bilgiler: ad soyad, telefon numarası, konu başlığı ve mesaj metni.",
              "Form dışında sizden veri istemiyoruz. Üyelik, hesap açma veya ödeme alma gibi bir işlem sitede bulunmuyor.",
            ],
          },
          {
            heading: "Neden işliyoruz",
            body: [
              "Talebinizi değerlendirmek, size dönüş yapmak ve görüşmenin gerektirdiği ön çalışmayı hazırlamak için.",
              "İzniniz olmadan pazarlama iletisi göndermiyor, verilerinizi satmıyor veya reklam amacıyla paylaşmıyoruz.",
            ],
          },
          {
            heading: "Çerezler",
            body: [
              "Sitede reklam, profilleme veya üçüncü taraf izleme çerezi kullanılmaz.",
              "Seçtiğiniz dil yalnızca açık olan sekmede tutulur; tarayıcınıza kalıcı olarak yazılmaz.",
            ],
          },
          {
            heading: "Üçüncü taraf servisleri",
            body: [
              "Sayfalardaki fotoğraflar Unsplash içerik ağı (images.unsplash.com) üzerinden yüklenir. Bu istek sırasında tarayıcınızın IP adresi ilgili servise iletilir.",
              "Yazı tipleri sitenin kendi sunucusundan servis edilir; bu nedenle yazı tipi için dışarıya istek gönderilmez.",
            ],
          },
          {
            heading: "Saklama süresi",
            body: [
              "Form aracılığıyla ilettiğiniz mesajlar, talebin sonuçlanmasından itibaren en fazla iki yıl saklanır ve sürenin sonunda silinir.",
              "Daha erken silinmesini isterseniz talebiniz üzerine kaydınız kaldırılır.",
            ],
          },
          {
            heading: "Güvenlik",
            body: [
              "Site HTTPS üzerinden yayımlanır. Toplanan veriye yalnızca talebi yürüten ekip erişebilir.",
            ],
          },
          {
            heading: "Sorularınız için",
            body: [
              `Gizlilikle ilgili her konuda ${contactEmail} adresinden bize ulaşabilirsiniz.`,
            ],
          },
          {
            heading: "Yapay zekâ asistanı",
            body: [
              "Sitedeki soru-cevap asistanı, sorularınızı yanıtlamak için Google'ın Gemini modelini kullanır. Yazdığınız metin, yalnızca yanıt üretilmesi amacıyla Google'a iletilir.",
              "Mesajlarınız tarafımızca kaydedilmez veya saklanmaz; sohbet yalnızca tarayıcınızın belleğinde durur ve sayfayı yenilediğinizde silinir. Bu nedenle asistana kimlik, iletişim veya finansal bilgi gibi kişisel veriler yazmamanızı rica ederiz.",
              "Asistanın verdiği yanıtlar bilgilendirme amaçlıdır; teklif, taahhüt ya da sözleşme yerine geçmez.",
            ],
          },
        ],
      },
      kvkk: {
        breadcrumb: "KVKK Aydınlatma Metni",
        title: "KVKK Aydınlatma Metni",
        updated: "Son güncelleme: Eylül 2026",
        intro:
          "6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 10. maddesi uyarınca, kişisel verilerinizin nasıl işlendiğine dair aydınlatma metnidir.",
        sections: [
          {
            heading: "Veri sorumlusu",
            body: [
              `Veri sorumlusu Kaya Yapı'dır. Merkez adresi Ataşehir, İstanbul'dur; başvurularınızı ${contactEmail} adresine iletebilirsiniz.`,
            ],
          },
          {
            heading: "İşlenen kişisel veriler",
            body: [
              "Kimlik bilgisi: ad ve soyad.",
              "İletişim bilgisi: telefon numarası ve varsa e-posta adresi.",
              "Talep bilgisi: iletişim formunda paylaştığınız konu başlığı ve mesaj içeriği.",
            ],
          },
          {
            heading: "İşleme amaçları",
            body: [
              "Talebinizin karşılanması ve size geri dönüş yapılması.",
              "Sözleşme öncesi görüşmelerin yürütülmesi ve ön çalışmanın hazırlanması.",
              "Hukuki yükümlülüklerimizin yerine getirilmesi.",
            ],
          },
          {
            heading: "Hukuki sebep",
            body: [
              "Verileriniz, Kanun'un 5/2-c maddesi (sözleşmenin kurulması veya ifasıyla doğrudan ilgili olma) ve 5/2-f maddesi (meşru menfaat) kapsamında işlenir.",
              "Bu kapsam dışında kalan işlemeler için ayrıca açık rızanız alınır.",
            ],
          },
          {
            heading: "Toplama yöntemi",
            body: [
              "Kişisel verileriniz, sitedeki iletişim formu ve e-posta yazışmaları aracılığıyla elektronik ortamda toplanır.",
            ],
          },
          {
            heading: "Aktarım",
            body: [
              "Kişisel verileriniz yurt dışına aktarılmaz.",
              "Yalnızca mevzuatın zorunlu kıldığı hallerde, talep üzerine yetkili kamu kurum ve kuruluşlarıyla paylaşılabilir.",
            ],
          },
          {
            heading: "Kanun'un 11. maddesi kapsamındaki haklarınız",
            body: [
              "Kişisel verinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme.",
              "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme.",
              "Eksik veya yanlış işlenmişse düzeltilmesini isteme.",
              "Kanun'daki şartlar çerçevesinde silinmesini veya yok edilmesini isteme.",
              "Düzeltme, silme ve yok etme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme.",
              "İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç ortaya çıkmasına itiraz etme.",
              "Kanuna aykırı işleme sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme.",
            ],
          },
          {
            heading: "Başvuru",
            body: [
              `Haklarınıza ilişkin taleplerinizi kimliğinizi tevsik edici bilgilerle birlikte ${contactEmail} adresine iletebilirsiniz.`,
              "Başvurunuz, talebin niteliğine göre en geç otuz gün içinde ücretsiz olarak sonuçlandırılır.",
            ],
          },
          {
            heading: "Yapay zekâ asistanı ve yurt dışına aktarım",
            body: [
              "Sitedeki asistana yazdığınız metin, yalnızca yanıt üretilmesi amacıyla yurt dışında yerleşik Google LLC'nin Gemini servisine aktarılır. Bu aktarım, hizmetin sunulabilmesi için zorunludur.",
              "Asistan üzerinden iletilen mesajlar tarafımızca kaydedilmediği için bu kanalda tutulan bir kişisel veri kaydı bulunmaz. Kişisel verilerinizi paylaşmanız gereken durumlarda iletişim sayfasındaki formu kullanmanızı öneririz.",
            ],
          },
        ],
      },
    },
    footer: {
      tagline: "Sağlam yapılar, kalıcı değer.",
      email: contactEmail,
      servicesTitle: "Hizmetler",
      companyTitle: "Kurumsal",
      regionsTitle: "Bölgeler",
      company: [
        { label: "Hakkımızda", href: "/hakkimizda" },
        { label: "Projeler", href: "/projeler" },
        { label: "Tasarım ve İnovasyon", href: "/tasarim-ve-inovasyon" },
        { label: "Bölgeler", href: "/#bolgeler" },
        { label: "İletişim", href: "/iletisim" },
      ],
      rights: "© 2026 Kaya Yapı. Tüm hakları saklıdır.",
      legal: [
        { label: "Yasal Uyarı", href: "/yasal-uyari" },
        { label: "Gizlilik Politikası", href: "/gizlilik-politikasi" },
        { label: "KVKK", href: "/kvkk" },
      ],
    },
  },
  en: {
    nav: {
      links: [
        { label: "About", href: "/hakkimizda" },
        { label: "Projects", href: "/projeler" },
        { label: "Design & Innovation", href: "/tasarim-ve-inovasyon" },
        { label: "Regions", href: "/#bolgeler" },
      ],
      contact: "Contact",
      menuLabel: "Open menu",
      closeLabel: "Close menu",
      home: "Home",
    },
    hero: {
      eyebrow: "Construction · Architecture · Contracting",
      titleLine1: "Solid",
      titleLine2: "Structures,",
      titleLine3: "Lasting Value.",
      description:
        "From housing and office buildings to detached homes, landscaping and turnkey contracting — we own the project from the first line to the final detail.",
      imageAlt: "Modern office building facade in evening light",
    },
    strip: {
      items: [
        { name: "Detached Family House", type: "Concept study" },
        { name: "Business Centre", type: "Office building" },
        { name: "Residential Block", type: "Living building" },
        { name: "Garden Axis", type: "Landscape" },
        { name: "House with Garden", type: "Detached build" },
        { name: "Office Floors", type: "Commercial build" },
        { name: "Balcony Facade", type: "Housing" },
        { name: "Terrace Layout", type: "Outdoor" },
      ],
    },
    manifesto: {
      text:
        "Our job is to build; our word is to keep it standing. We plan every project as if it were our own home and never negotiate on materials or workmanship. On-time delivery, a transparent budget and a guarantee we stand behind: all of Kaya Yapı fits into those three sentences.",
    },
    stats: {
      label: "Kaya Yapı in numbers",
      items: [
        { value: "25", label: "years on site" },
        { value: "180+", label: "completed projects" },
        { value: "420,000", label: "m² of area built" },
        { value: "10", label: "year structural warranty" },
      ],
    },
    services: {
      eyebrow: "Expertise",
      title: "What we do",
      items: [
        {
          title: "Housing & Living Buildings",
          description:
            "Buildings families actually live in: well-oriented flats, balconies people use, comfort over display. Permit to occupancy is handled end to end.",
        },
        {
          title: "Offices & Business Centres",
          description:
            "Retail at street level, independent office floors above. Flexible floor plates, strong infrastructure and facade details that keep running costs down.",
        },
        {
          title: "Detached Houses & Villas",
          description:
            "On single-plot work, site, orientation and budget are solved together. Pools, saunas and spa installations can be included in the same contract.",
        },
        {
          title: "Landscaping & Outdoor",
          description:
            "Gardens, terraces and approach paths treated as part of the building. Planting, hardscape, lighting and irrigation are solved in a single project.",
        },
        {
          title: "Contracting & Engineering",
          description:
            "Turnkey contracting, infrastructure and structural strengthening. We work with a fixed budget, a clear schedule and weekly progress reports.",
        },
      ],
    },
    advantages: {
      title: "What you gain by working with us",
      items: [
        {
          title: "One point of contact",
          description:
            "You speak with a single site manager throughout the project. The crowd of subcontractors never becomes your problem.",
        },
        {
          title: "Fixed budget",
          description:
            "An itemised estimate with no later surprises, and a price locked into the contract.",
        },
        {
          title: "On-time delivery",
          description:
            "The schedule is an annex to the contract, and we accept the penalty if we fall behind.",
        },
        {
          title: "Earthquake-first engineering",
          description:
            "Every project is calculated twice against the current seismic code, with an independent checking engineer.",
        },
        {
          title: "Transparency in materials",
          description:
            "The brand and class of every product is written into the contract; equivalents are swapped only with your approval.",
        },
        {
          title: "Service after handover",
          description:
            "A 10-year structural warranty and free maintenance visits during the first year.",
        },
      ],
    },
    map: {
      eyebrow: "Regions",
      title: "Where we work in Türkiye",
      description:
        "Active sites and technical teams in five provinces; other provinces are coming soon through partnerships.",
      activeCountLabel: "Active provinces",
      officesTitle: "Offices",
      offices: {
        istanbul: { label: "Head office opening very soon", value: "Ataşehir, Istanbul" },
        adiyaman: { label: "Office", value: "Adıyaman" },
        tekirdag: { label: "Planned office", value: "Tekirdağ" },
        mugla: { label: "Planned office", value: "Muğla" },
        antalya: { label: "Planned office", value: "Antalya" },
      },
      soonNote: "In provinces without an office the work is run by our own teams; openings are being planned.",
    },
    projects: {
      eyebrow: "Selected work",
      title: "Projects",
      description:
        "Four studies from our design archive. Each one describes a different scale and a different way of living.",
      breadcrumb: "Projects",
      detailScopeLabel: "Project type",
      detailStatusLabel: "Status",
      detailScaleLabel: "Scale",
      galleryTitle: "Views",
      backToProjects: "All projects",
      nextProject: "Next project",
      items: {
        ofis: {
          name: "Meydan Business Centre",
          category: "Office & Business Centre",
          summary: "Retail at street level, independent office floors above.",
          intro:
            "A business centre within walking distance of the city: retail on the ground floor, divisible office floors above it.",
          body: [
            "The structural system was calculated twice against the current seismic code, with an independent checking engineer. Shear walls run uninterrupted between floors, so the building holds its behaviour under lateral load and over time.",
            "On the safety side, the fire escape, smoke extraction, card access and continuous camera infrastructure were placed during design — not bolted on afterwards.",
            "Floor plans are not fixed. Because partitions are not tied to the structure, a floor can serve one company or be split into four separate offices. We adapt it with you, to your needs.",
          ],
          scope: "Office building",
          status: "Concept study",
          scale: "7 floors · ground-floor retail",
          views: ["General perspective", "Corner view", "Side elevation", "Facade detail"],
        },
        konut: {
          name: "Residential Block with Garden",
          category: "Housing & Living Building",
          summary: "A living building shaped around everyday family life.",
          intro:
            "A building that works for use rather than display: well-oriented flats, balconies people actually use, a shared garden.",
          body: [
            "A raft foundation and a shear-wall-led structural system keep the building above what the seismic code asks for. Concrete class and reinforcement details are written plainly into the contract annex.",
            "There is a covered car park connection at the entrance, lit common areas and fire detection on every floor. In a building where families with children live, safety is not an afterthought.",
            "Flat types are flexible: you can move between 2+1 and 3+1 layouts, and as long as the wet areas stay put, we adapt the interior plan to your needs.",
          ],
          scope: "Living building",
          status: "Concept study",
          scale: "5 floors · 20 flats",
          views: ["General perspective", "Balcony detail", "Low angle", "Setting and landscape"],
        },
        mustakil: {
          name: "Detached Family House",
          category: "Detached House",
          summary: "A two-storey family house designed together with its garden.",
          intro:
            "A two-storey family house designed together with its garden, without tipping into villa display.",
          body: [
            "On single-plot work the ground is the critical question. The foundation type is chosen after the soil survey and the structure follows from it. Insulation and water details are solved in the first drawing, not argued about on site.",
            "Lighting, alarm and camera infrastructure run on a single system from the garden gate to the front door. The house can be monitored while it stands empty.",
            "From the number of rooms to the kitchen layout, from terrace depth to facade material, every heading is decided with you. We adapt it to your needs; we do not impose a ready-made type plan.",
          ],
          scope: "Detached build",
          status: "Concept study",
          scale: "2 floors · with garden",
          views: ["Entrance elevation", "Garden elevation", "Approach axis", "Side elevation"],
        },
        peyzaj: {
          name: "Garden & Landscape Design",
          category: "Landscape & Outdoor",
          summary: "A garden and approach axis built in the same language as the building.",
          intro:
            "A scheme that treats the garden as a continuation of the building: approach axis, terrace, planting and lighting in one project.",
          body: [
            "Hard surfaces are calculated together with their drainage. Without the right fall and the right sub-base, no path survives its first winter — so we give the invisible part as much time as the visible one.",
            "At risky points such as steps, retaining walls and pool edges, non-slip surfaces, handrail heights and night lighting are solved as standard.",
            "Planting is chosen for the climate and for how much upkeep you want. We can build a low-maintenance garden or one that lives through its seasonal planting; we adapt it to your needs.",
          ],
          scope: "Landscape works",
          status: "Concept study",
          scale: "Garden · terrace · lighting",
          views: ["General view", "Courtyard and hardscape", "Walking axis", "Installation detail"],
        },
      },
    },
    about: {
      breadcrumb: "About",
      heroTitle: "A long journey begins with a single step",
      eyebrow: "01 — Who we are",
      title: "We are a team that builds solid structures.",
      paragraphs: [
        "Kaya Yapı is a construction and architecture firm that handles housing, office buildings, detached houses and landscaping under one roof. Our aim is to turn even the smallest area into a livable, safe and lasting space.",
        "The architect, the structural engineer, the mechanical team and the site manager sit at the same table. That is why the promise made in the drawing holds on site as well.",
      ],
      valuesTitle: "What we work by",
      values: [
        {
          title: "Strength",
          description:
            "The structural system is built above the level the current seismic code asks for.",
        },
        {
          title: "Transparency",
          description:
            "Materials, duration and price are written into the contract; nothing surprises you later.",
        },
        {
          title: "Continuity",
          description:
            "The same team stands behind the work after handover: a 10-year structural warranty.",
        },
      ],
    },
    design: {
      breadcrumb: "Design & Innovation",
      heroTitle: "Modern design",
      eyebrow: "Design & Innovation",
      title: "Four steps from line to site",
      description:
        "Every project goes through the same four steps. We know from experience that skipping one is paid for on site.",
      steps: [
        {
          title: "Design",
          description:
            "We develop projects that respect the demands of modern architecture and changing living standards, building spaces made to last.",
        },
        {
          title: "Analysis",
          description:
            "Through feasibility and soil studies we prepare technical reports that calculate maximum benefit for any area chosen as an investment or a home.",
        },
        {
          title: "Consulting",
          description:
            "We back the experience gained on site with technical data and give investors a transparent road map.",
        },
        {
          title: "Delivery",
          description:
            "Never forgetting that every building, small or large, is a place where people live, we build above the standards set by TSE and the relevant regulations.",
        },
      ],
    },
    contact: {
      breadcrumb: "Contact",
      heroTitle: "Contact details",
      detailsTitle: "Contact details",
      detailsDescription:
        "If you need any help, get in touch with us. Send an email or fill in the form and we will come back to you within the same week.",
      addressLabel: "Address",
      addressValue: "Ataşehir, Istanbul",
      addressNote: "The exact location will be shared soon.",
      emailLabel: "Email",
      formTitle: "Contact form",
      formDescription:
        "If you have any questions, you can send us a message. We will call you back within two business days.",
      nameLabel: "Your Full Name",
      phoneFieldLabel: "Your Phone Number",
      subjectLabel: "Subject",
      messageLabel: "Message",
      submit: "Send",
      submitting: "Sending…",
      success: "Your message has been received. We will get back to you shortly.",
    },
    cta: {
      title: "Have a project in mind?",
      description:
        "Tell us about your plot, your brief and your budget; we will come back within 5 working days with a road map.",
      button: "Get in touch",
      imageAlt: "Office building facade in daylight",
    },
    assistant: {
      eyebrow: "AI assistant",
      title: "Ask a question",
      description:
        "Ask anything about how Kaya Yapı works, what we build and the projects we have delivered. The assistant answers only from our own company information.",
      privacyNote:
        "Answers are generated by AI and are not binding. Your messages are not stored; please do not share personal data.",
      placeholder: "Type your question…",
      sendLabel: "Send",
      clearLabel: "Clear conversation",
      emptyHint: "Pick a question to start, or write your own.",
      suggestions: [
        "Do you work turnkey?",
        "How is the price determined?",
        "Which provinces do you take work in?",
        "How long does a project take?",
      ],
      thinking: "Typing…",
      errors: {
        invalid_request:
          "We could not process your question. Please try again with a shorter message.",
        forbidden: "The request could not be verified. Please refresh the page and try again.",
        too_large: "Your message is too long. Please shorten it and send again.",
        rate_limited:
          "Too many questions in a short time. Please try again in a few minutes.",
        unavailable:
          "The assistant cannot answer right now. Please try again shortly or reach us from the contact page.",
        network: "Could not connect. Please check your connection and try again.",
        turnstile: "Security verification could not be completed. Please refresh the page and try again.",
      },
    },
    legal: {
      notice: {
        breadcrumb: "Legal Notice",
        title: "Legal Notice",
        updated: "Last updated: September 2026",
        intro:
          "This website is operated by Kaya Yapı. By using the site you accept the terms set out below.",
        sections: [
          {
            heading: "Purpose of the site",
            body: [
              "The site exists to present Kaya Yapı's services and the way we work. Nothing on it constitutes an offer, an undertaking or a contract.",
              "The only binding document between the parties is the written contract signed by both sides, together with its annexes.",
            ],
          },
          {
            heading: "Images and project content",
            body: [
              "The work shown under Projects consists of concept studies. The images are representative and are not a record of a completed building.",
              "Figures such as floor counts, areas and durations are indicative and are agreed separately for each project.",
            ],
          },
          {
            heading: "Intellectual property",
            body: [
              "The texts, brand name, logo and page design on this site belong to Kaya Yapı. They may not be copied, reproduced or used commercially without permission.",
              "Photographs used on the site are covered by the Unsplash licence and remain subject to its terms.",
            ],
          },
          {
            heading: "Limitation of liability",
            body: [
              "Content is prepared with care, but no unconditional guarantee is given as to its currency, accuracy or completeness.",
              "Kaya Yapı cannot be held liable for indirect damages arising from the use of, or inability to use, the site.",
            ],
          },
          {
            heading: "External links",
            body: [
              "Where the site links to third-party websites, Kaya Yapı is not responsible for their content or privacy practices.",
            ],
          },
          {
            heading: "Right to amend",
            body: [
              "Kaya Yapı reserves the right to change the site's content and this notice without prior warning. The current version is always published on this page.",
            ],
          },
          {
            heading: "Governing law",
            body: [
              "Turkish law applies to this notice and to the use of the site. The Istanbul Anatolian Courts and Execution Offices have jurisdiction over any dispute.",
            ],
          },
          {
            heading: "Contact",
            body: [
              `Questions about this notice can be sent to ${contactEmail}.`,
            ],
          },
        ],
      },
      privacy: {
        breadcrumb: "Privacy Policy",
        title: "Privacy Policy",
        updated: "Last updated: September 2026",
        intro:
          "At Kaya Yapı we collect only the data we actually need. This page explains, in plain terms, what is processed on the site and why.",
        sections: [
          {
            heading: "What we collect",
            body: [
              "Only what you type into the contact form: your name, phone number, subject line and message.",
              "We ask for nothing else. The site has no accounts, no sign-up and no payments.",
            ],
          },
          {
            heading: "Why we process it",
            body: [
              "To assess your enquiry, get back to you, and prepare the preliminary work a conversation requires.",
              "We do not send marketing messages without your consent, and we never sell or share your data for advertising.",
            ],
          },
          {
            heading: "Cookies",
            body: [
              "The site uses no advertising, profiling or third-party tracking cookies.",
              "Your language choice is held only in the open tab; it is not written permanently to your browser.",
            ],
          },
          {
            heading: "Third-party services",
            body: [
              "Photographs are loaded through the Unsplash content network (images.unsplash.com). Your browser's IP address is passed to that service as part of the request.",
              "Fonts are served from our own server, so no font request leaves the site.",
            ],
          },
          {
            heading: "Retention",
            body: [
              "Messages sent through the form are kept for at most two years after the enquiry is closed, and are deleted at the end of that period.",
              "If you would like your record removed sooner, we will delete it on request.",
            ],
          },
          {
            heading: "Security",
            body: [
              "The site is served over HTTPS. Only the team handling your enquiry can access the data collected.",
            ],
          },
          {
            heading: "Questions",
            body: [
              `For anything to do with privacy, write to us at ${contactEmail}.`,
            ],
          },
          {
            heading: "AI assistant",
            body: [
              "The question-and-answer assistant on this site uses Google's Gemini model to answer your questions. The text you write is sent to Google solely for the purpose of generating a reply.",
              "We do not log or store your messages; the conversation lives only in your browser's memory and is discarded when you reload the page. For that reason, please do not enter personal data such as identity, contact or financial details.",
              "Answers from the assistant are informational only and do not constitute an offer, commitment or contract.",
            ],
          },
        ],
      },
      kvkk: {
        breadcrumb: "Data Protection Notice",
        title: "Data Protection Notice",
        updated: "Last updated: September 2026",
        intro:
          "This notice is issued under Article 10 of Turkish Law No. 6698 on the Protection of Personal Data and explains how your personal data is processed.",
        sections: [
          {
            heading: "Data controller",
            body: [
              `The data controller is Kaya Yapı, with its head office in Ataşehir, Istanbul. Requests can be sent to ${contactEmail}.`,
            ],
          },
          {
            heading: "Personal data processed",
            body: [
              "Identity data: first name and surname.",
              "Contact data: phone number and, where given, email address.",
              "Enquiry data: the subject line and message you share through the contact form.",
            ],
          },
          {
            heading: "Purposes of processing",
            body: [
              "Responding to your enquiry and getting back to you.",
              "Conducting pre-contractual discussions and preparing preliminary work.",
              "Meeting our legal obligations.",
            ],
          },
          {
            heading: "Legal basis",
            body: [
              "Your data is processed under Article 5/2-c (directly related to the conclusion or performance of a contract) and Article 5/2-f (legitimate interest) of the Law.",
              "Any processing beyond that scope is carried out only with your explicit consent.",
            ],
          },
          {
            heading: "Method of collection",
            body: [
              "Your personal data is collected electronically, through the contact form on the site and through email correspondence.",
            ],
          },
          {
            heading: "Transfers",
            body: [
              "Your personal data is not transferred abroad.",
              "It may be shared with authorised public bodies only where legislation requires it and upon request.",
            ],
          },
          {
            heading: "Your rights under Article 11",
            body: [
              "To learn whether your personal data is processed and, if so, to request information about it.",
              "To learn the purpose of processing and whether the data is used in line with that purpose.",
              "To request correction where the data is incomplete or inaccurate.",
              "To request erasure or destruction within the conditions set out in the Law.",
              "To request that correction, erasure and destruction be notified to third parties the data was transferred to.",
              "To object to a result against you produced solely by automated analysis of the data.",
              "To claim compensation for damage suffered due to unlawful processing.",
            ],
          },
          {
            heading: "How to apply",
            body: [
              `Send requests relating to your rights, together with information verifying your identity, to ${contactEmail}.`,
              "Your application is concluded free of charge within thirty days at the latest, depending on the nature of the request.",
            ],
          },
          {
            heading: "AI assistant and international transfer",
            body: [
              "Text you write to the assistant is transferred to Google LLC's Gemini service, located outside Türkiye, solely for the purpose of generating a reply. This transfer is required for the service to function.",
              "Because messages sent through the assistant are not logged by us, no personal data record is kept on this channel. If you need to share personal data, please use the form on the contact page.",
            ],
          },
        ],
      },
    },
    footer: {
      tagline: "Solid structures, lasting value.",
      email: contactEmail,
      servicesTitle: "Services",
      companyTitle: "Company",
      regionsTitle: "Regions",
      company: [
        { label: "About", href: "/hakkimizda" },
        { label: "Projects", href: "/projeler" },
        { label: "Design & Innovation", href: "/tasarim-ve-inovasyon" },
        { label: "Regions", href: "/#bolgeler" },
        { label: "Contact", href: "/iletisim" },
      ],
      rights: "© 2026 Kaya Yapı. All rights reserved.",
      legal: [
        { label: "Legal Notice", href: "/yasal-uyari" },
        { label: "Privacy Policy", href: "/gizlilik-politikasi" },
        { label: "Data Protection", href: "/kvkk" },
      ],
    },
  },
} as const satisfies Record<Locale, Dictionary>;
