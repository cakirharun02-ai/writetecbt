import type { Lang } from "./i18n";

export type Localized = { tr: string; en: string };
export type LocalizedList = { tr: string[]; en: string[] };

export type SeminarSection = {
  heading: Localized;
  intro?: Localized;
  items?: LocalizedList;
};

export type Seminar = {
  slug: string;
  order: number;
  /**
   * Card visual. `null` renders an elegant blank placeholder so images can be
   * added later by dropping a file into `public/seminars/<slug>.jpg` and
   * setting this field to `/seminars/<slug>.jpg`.
   */
  image: string | null;
  category: Localized;
  title: Localized;
  /** Optional event date,  shown as a pill on the card and detail page when set. */
  date?: Localized;
  /** Optional event time. */
  time?: Localized;
  /** Optional event location (e.g. "Online", "İstanbul"). */
  location?: Localized;
  summary: Localized;
  /** Optional pricing, shown as an original crossed-out price next to a discounted price. */
  price?: { original: string; discounted: string; discountLabel: Localized };
  /** When true, the seminar is free and a "ÜCRETSİZ" badge is shown instead of pricing. */
  isFree?: boolean;
  sections: SeminarSection[];
};

const FAMILY: Localized = { tr: "Aile & Eğitim", en: "Family & Education" };
const BUSINESS: Localized = { tr: "İş & Kariyer", en: "Business & Career" };
const ACADEMY: Localized = { tr: "Akademi & Araştırma", en: "Academy & Research" };

const ALL_SEMINARS: Seminar[] = [
  {
    slug: "cost-semineri",
    order: 1,
    image: "/seminars/cost-semineri.jpg",
    category: ACADEMY,
    title: {
      tr: "COST Semineri",
      en: "COST Seminar",
    },
    date: {
      tr: "29-30 Eylül 2026",
      en: "29-30 September 2026",
    },
    time: {
      tr: "20.30",
      en: "20.30",
    },
    location: {
      tr: "ONLINE",
      en: "ONLINE",
    },
    summary: {
      tr: "COST (Avrupa Bilim ve Teknoloji İş Birliği), araştırmacıları tüm Avrupa'daki bilimsel ağlara bağlayan, düşük bütçeli ama yüksek etkili bir iş birliği programı. COST'un ne olduğunu, neyi fonladığını ve uluslararası akademik ağlara nasıl dahil olabileceğinizi ele alan bir seminer.",
      en: "COST (European Cooperation in Science and Technology) is a low-cost, high-impact program that connects researchers to scientific networks across Europe. A seminar on what COST is, what it funds, and how you can join international academic networks.",
    },
    price: {
      original: "6.000₺",
      discounted: "4.000₺",
      discountLabel: { tr: "%33 İndirim", en: "33% Off" },
    },
    sections: [
      {
        heading: { tr: "COST Nedir?", en: "What Is COST?" },
        intro: {
          tr: "COST, araştırma ve inovasyon ağlarını (COST Action) destekleyen bir Avrupa fonlama kuruluşudur. Belirli bir konu dayatmaz; fikirler aşağıdan yukarıya, araştırmacıların kendi önerileriyle şekillenir. Türkiye COST'a tam üyedir.",
          en: "COST is a European funding organisation that supports research and innovation networks called COST Actions. It imposes no predefined themes; ideas are bottom-up, shaped by researchers' own proposals. Türkiye is a full member of COST.",
        },
      },
      {
        heading: { tr: "COST Neyi Fonlar?", en: "What Does COST Fund?" },
        intro: {
          tr: "COST araştırmanın kendisini değil, ağ kurma faaliyetlerini fonlar:",
          en: "COST funds networking activities rather than the research itself:",
        },
        items: {
          tr: [
            "Toplantılar, çalıştaylar ve konferanslar",
            "Eğitim okulları (training schools)",
            "Kısa Süreli Bilimsel Görevler (STSM)",
            "Sanal hareketlilik ve dijital iş birliği",
            "Yayım, iletişim ve sonuçların yaygınlaştırılması",
          ],
          en: [
            "Meetings, workshops and conferences",
            "Training schools",
            "Short-Term Scientific Missions (STSMs)",
            "Virtual mobility and digital collaboration",
            "Dissemination and communication of results",
          ],
        },
      },
      {
        heading: { tr: "Kimler Katılabilir?", en: "Who Can Take Part?" },
        intro: {
          tr: "Her bilim alanından ve her kariyer aşamasından araştırmacılar COST Action'lara katılabilir. Program özellikle genç araştırmacılara ve gelişmekte olan ülkelere kapısını açar.",
          en: "Researchers from all scientific fields and career stages can join COST Actions. The program is especially open to young researchers and to widening countries.",
        },
        items: {
          tr: [
            "Akademisyenler ve doktora öğrencileri",
            "Genç araştırmacılar ve yenilikçiler",
            "Üniversiteler, KOBİ'ler ve kamu kurumları",
            "Tüm disiplinler (açık çağrı, konu serbest)",
          ],
          en: [
            "Academics and PhD students",
            "Young researchers and innovators",
            "Universities, SMEs and public institutions",
            "All disciplines (open call, no fixed theme)",
          ],
        },
      },
      {
        heading: { tr: "Neden COST?", en: "Why COST?" },
        items: {
          tr: [
            "Uluslararası iş birliği ağına erişim",
            "Akademik görünürlük ve yeni proje ortaklıkları",
            "WoS ve Scopus indeksli dergilerde yayın imkânları",
            "İtibarlı yayınevlerinin kitap çalışmalarına katılım imkânı",
            "Hareketlilik ve uluslararası deneyim",
            "Kariyer gelişimi ve mentorluk fırsatları",
            "Daha büyük AB projelerine (Horizon Europe) zemin",
          ],
          en: [
            "Access to an international collaboration network",
            "Academic visibility and new project partnerships",
            "Publication opportunities in WoS- and Scopus-indexed journals",
            "Participation in book projects of reputable publishers",
            "Mobility and international experience",
            "Career development and mentoring opportunities",
            "A stepping stone to larger EU projects (Horizon Europe)",
          ],
        },
      },
      {
        heading: { tr: "İlk Seminerin Ardından", en: "After the First Seminar" },
        intro: {
          tr: "İlk seminerimizin ardından pek çok akademisyenimiz, kendi alanlarına uygun farklı COST Action'larına araştırmacı olarak dâhil oldu. Bu seminer de aynı şekilde sizi uygun ağlarla buluşturmayı hedefliyor.",
          en: "Following our first seminar, many of our academics joined various COST Actions as researchers in their own fields. This seminar likewise aims to connect you with the networks that fit you.",
        },
      },
      {
        heading: { tr: "İlk Adımlar", en: "First Steps" },
        intro: {
          tr: "Mevcut bir COST Action'a katılabilir ya da yeni bir Action önerisi geliştirebilirsiniz. Seminer, ilgi alanınıza uygun ağı bulmaktan başvuru sürecine kadar yol haritasını ele alır.",
          en: "You can join an existing COST Action or develop a proposal for a new one. The seminar covers the roadmap from finding the right network for your field to the application process.",
        },
      },
    ],
  },
  {
    slug: "yapay-zeka-caginda-kariyer-ve-yabanci-dil",
    order: 2,
    image: "/seminars/yapay-zeka-caginda-kariyer-ve-yabanci-dil.jpg",
    category: FAMILY,
    title: {
      tr: "Yapay Zeka Çağında Kariyer ve Yabancı Dilin Geleceği",
      en: "Career and the Future of Foreign Languages in the Age of AI",
    },
    date: {
      tr: "6 Temmuz 2026",
      en: "6 July 2026",
    },
    time: {
      tr: "20.30",
      en: "20.30",
    },
    summary: {
      tr: "Yapay zeka iş dünyasını dönüştürürken hangi meslekler öne çıkıyor, İngilizce neden hâlâ en kritik kariyer becerilerinden biri ve yapay zekayı kullanan bireyler nasıl avantaj sağlıyor? Geleceğe hazırlanmak isteyenler için bütünsel bir bakış.",
      en: "As AI transforms the world of work, which professions are rising, why is English still one of the most critical career skills, and how do people who use AI gain an edge? A holistic look for those preparing for the future.",
    },
    sections: [
      {
        heading: { tr: "Dünya Değişiyor", en: "The World Is Changing" },
        intro: {
          tr: "Yapay zeka insanların yerini almıyor; yapay zekayı kullanan insanlar, kullanmayanların yerini alıyor. ChatGPT, Gemini, Copilot ve Claude gibi araçlar günlük işlerin önemli bir bölümünü dönüştürüyor.",
          en: "AI is not replacing people; people who use AI are replacing those who don't. Tools like ChatGPT, Gemini, Copilot and Claude are reshaping a significant part of daily work.",
        },
      },
      {
        heading: { tr: "Geleceğin Meslekleri", en: "The Professions of the Future" },
        intro: {
          tr: "Önümüzdeki on yılda değer kazanacak alanların ortak paydası teknoloji, güçlü iletişim ve İngilizce olacak.",
          en: "The common denominator of the fields gaining value over the next decade will be technology, strong communication and English.",
        },
        items: {
          tr: [
            "Yapay zeka uzmanlığı",
            "Veri analistliği",
            "Dijital pazarlama",
            "Siber güvenlik",
            "Yazılım geliştirme",
            "Eğitim teknolojileri uzmanlığı",
            "Uluslararası ticaret uzmanlığı",
            "Sağlık teknolojileri uzmanlığı",
          ],
          en: [
            "Artificial intelligence expertise",
            "Data analysis",
            "Digital marketing",
            "Cyber security",
            "Software development",
            "Educational technology expertise",
            "International trade expertise",
            "Health technology expertise",
          ],
        },
      },
      {
        heading: {
          tr: "İngilizce Neden Hâlâ Çok Önemli?",
          en: "Why Is English Still So Important?",
        },
        intro: {
          tr: "Yapay zeka araçları Türkçe bilse de bilgiye ulaşmanın ve fırsat yakalamanın dili büyük ölçüde İngilizce olmaya devam ediyor.",
          en: "Even though AI tools understand Turkish, the language of accessing knowledge and seizing opportunities is still largely English.",
        },
        items: {
          tr: [
            "Bilimsel yayınların büyük bölümü İngilizce yazılıyor",
            "Yapay zeka araçlarının ilk çıktıları İngilizce üretiliyor",
            "Uluslararası iş ilanlarının çoğu İngilizce",
            "Akademik kariyer, yüksek lisans ve doktora için gerekli",
            "İnternet içeriğinin büyük bölümü İngilizce üretiliyor",
          ],
          en: [
            "The majority of scientific publications are written in English",
            "AI tools produce their first outputs in English",
            "Most international job postings are in English",
            "Required for academic careers, master's and doctoral study",
            "A large share of internet content is produced in English",
          ],
        },
      },
      {
        heading: {
          tr: "Yapay Zeka ve İngilizceyi Birlikte Kullanmak",
          en: "Using AI and English Together",
        },
        intro: {
          tr: "Bir öğrenci, akademisyen, mühendis ya da iş insanı; doğru komutlarla yapay zekadan çok daha verimli sonuçlar alır. Anahtar, soruyu doğru sormaktan geçiyor.",
          en: "A student, academic, engineer or professional gets far more from AI with the right prompts. The key is asking the question correctly.",
        },
      },
      {
        heading: { tr: "Geleceğin Başarı Formülü", en: "The Success Formula of the Future" },
        intro: {
          tr: "Uzmanlık + İngilizce + Yapay Zeka Kullanımı = Küresel Kariyer. Aynı bilgiye herkesin ulaştığı bir çağda farkı yaratan; bilgiyi yorumlamak, üretmek ve dünyaya sunabilmektir.",
          en: "Expertise + English + AI fluency = a global career. In an age where everyone can reach the same information, what makes the difference is interpreting, producing and presenting knowledge to the world.",
        },
      },
    ],
  },
  {
    slug: "akran-zorbaligina-karsi-koruyucu-yaklasimlar",
    order: 3,
    image: "/seminars/akran-zorbaligina-karsi-koruyucu-yaklasimlar.jpg",
    category: FAMILY,
    title: {
      tr: "Akran Zorbalığına Karşı Koruyucu Yaklaşımlar",
      en: "Protective Approaches Against Peer Bullying",
    },
    summary: {
      tr: "Çocuğunuz zorbalığa uğrasa size anlatır mı? Zorbalığın türlerini, çocukta görülen belirtileri ve ailenin koruyucu rolünü ele alan, fark etmeyi ve doğru yaklaşmayı öğreten bir seminer.",
      en: "Would your child tell you if they were bullied? A seminar on the types of bullying, the signs to watch for in children, and the protective role of the family — learning to notice and respond correctly.",
    },
    sections: [
      {
        heading: { tr: "Zorbalık Türleri", en: "Types of Bullying" },
        items: {
          tr: ["Fiziksel zorbalık", "Sözel zorbalık", "Sosyal dışlama", "Siber zorbalık"],
          en: ["Physical bullying", "Verbal bullying", "Social exclusion", "Cyberbullying"],
        },
      },
      {
        heading: {
          tr: "Zorbalığa Uğrayan Çocukta Görülen Belirtiler",
          en: "Signs Seen in a Bullied Child",
        },
        items: {
          tr: [
            "Okula gitmek istememe",
            "İçe kapanma",
            "Sık karın ağrısı şikâyetleri",
            "Özgüven kaybı",
          ],
          en: [
            "Reluctance to go to school",
            "Withdrawal",
            "Frequent complaints of stomach aches",
            "Loss of self-confidence",
          ],
        },
      },
      {
        heading: { tr: "Ailenin Rolü", en: "The Role of the Family" },
        items: {
          tr: ["Dinlemek", "Yargılamamak", "Güven vermek"],
          en: ["Listening", "Not judging", "Building trust"],
        },
      },
      {
        heading: { tr: "Destekleyici Programlar", en: "Supporting Programs" },
        items: {
          tr: [
            "Sosyal beceri atölyeleri",
            "Drama çalışmaları",
            "İletişim eğitimleri",
            "Liderlik programları",
          ],
          en: [
            "Social skills workshops",
            "Drama activities",
            "Communication training",
            "Leadership programs",
          ],
        },
      },
    ],
  },
  {
    slug: "ustun-yetenekli-cocuklarin-kesfi",
    order: 4,
    image: "/seminars/ustun-yetenekli-cocuklarin-kesfi.jpg",
    category: FAMILY,
    title: {
      tr: "Anne Gözünden Üstün Yetenekli Çocukların Keşfi ve Desteklenmesi",
      en: "Discovering and Supporting Gifted Children, Through a Parent's Eyes",
    },
    summary: {
      tr: "Üstün yetenek sadece yüksek not almak değildir. Üstün yeteneğin belirtilerini, ailelerin sık yaptığı hataları ve doğru desteklemenin yollarını velilerin gözünden ele alan bir seminer.",
      en: "Giftedness is not just about high grades. A seminar that explores the signs of giftedness, the mistakes families often make, and the right ways to support — from a parent's perspective.",
    },
    sections: [
      {
        heading: { tr: "Belirtiler", en: "Signs" },
        items: {
          tr: [
            "Çok soru sorma",
            "Güçlü merak",
            "Hızlı öğrenme",
            "Farklı düşünme",
            "Güçlü hayal gücü",
          ],
          en: [
            "Asking many questions",
            "Strong curiosity",
            "Fast learning",
            "Thinking differently",
            "A powerful imagination",
          ],
        },
      },
      {
        heading: { tr: "Sık Yapılan Hatalar", en: "Common Mistakes" },
        items: {
          tr: [
            "Sürekli ders yüklemek",
            "Her alanda başarılı olmasını beklemek",
            "Çocukluğu unutturmak",
          ],
          en: [
            "Constantly piling on lessons",
            "Expecting success in every field",
            "Robbing them of childhood",
          ],
        },
      },
      {
        heading: { tr: "Doğru Destek Yolları", en: "The Right Ways to Support" },
        items: {
          tr: [
            "Bireysel değerlendirme",
            "Zekâ testleri",
            "STEM programları",
            "Bilim kampları",
          ],
          en: [
            "Individual assessment",
            "Intelligence tests",
            "STEM programs",
            "Science camps",
          ],
        },
      },
    ],
  },
  {
    slug: "cocugunuzun-gelecegi-icin-5-kritik-beceri",
    order: 5,
    image: "/seminars/cocugunuzun-gelecegi-icin-5-kritik-beceri.jpg",
    category: FAMILY,
    title: {
      tr: "Çocuğunuzun Geleceği İçin 5 Kritik Beceri",
      en: "5 Critical Skills for Your Child's Future",
    },
    summary: {
      tr: "Çocuğunuz 20 yıl sonra nasıl bir yetişkin olacak? Bugün okullarda öğretilenler 2040'ın dünyasına ne kadar hazırlıyor? Çocukları geleceğe hazırlayan beş temel beceriyi ele alan bir seminer.",
      en: "What kind of adult will your child be in 20 years? How well does today's schooling prepare them for the world of 2040? A seminar on the five core skills that ready children for the future.",
    },
    sections: [
      {
        heading: { tr: "1. İngilizce", en: "1. English" },
        intro: {
          tr: "Bilgiye, yapay zeka araçlarına, yurt dışı eğitime ve uluslararası kariyere açılan kapının dili hâlâ büyük ölçüde İngilizce. İngilizce artık bir avantaj değil, temel ihtiyaç.",
          en: "The language of access to knowledge, AI tools, study abroad and an international career is still largely English. English is no longer an advantage — it is a basic need.",
        },
      },
      {
        heading: { tr: "2. Yapay Zekâ Okuryazarlığı", en: "2. AI Literacy" },
        intro: {
          tr: "Önemli olan çocukların yapay zekayı tüketen değil, üreten bireyler olması. Doğru soru sormayı, bilgiyi doğrulamayı ve dijital etiği öğrenmeleri gerekiyor.",
          en: "What matters is that children become producers, not just consumers of AI. They need to learn how to ask the right questions, verify information and practice digital ethics.",
        },
      },
      {
        heading: { tr: "3. Problem Çözme", en: "3. Problem Solving" },
        intro: {
          tr: "Gelecekte bilgi ezberleyen değil, problem çözen bireyler öne çıkacak. Karar vermek, analiz yapmak ve çözüm üretmek insana ait. Mantık soruları, strateji oyunları, STEM ve bilim çalışmaları bu beceriyi güçlendirir.",
          en: "In the future, problem solvers — not memorizers — will stand out. Deciding, analyzing and producing solutions belong to humans. Logic problems, strategy games, STEM and science activities strengthen this skill.",
        },
      },
      {
        heading: { tr: "4. İletişim", en: "4. Communication" },
        intro: {
          tr: "Teknik bilgi kadar iletişim de önemli. Kendini ifade edemeyen, topluluk önünde konuşamayan ya da takım çalışmasına uyum sağlayamayan bir çocuk, çok başarılı olsa bile zorlanabilir. Çocuklara fikirlerini anlatma fırsatı verin, soru sormalarını teşvik edin, hata yapmalarına izin verin.",
          en: "Communication matters as much as technical knowledge. A child who can't express themselves, speak in public or work in a team may struggle even if highly capable. Give children the chance to share their ideas, encourage questions, and allow them to make mistakes.",
        },
      },
      {
        heading: { tr: "5. Girişimcilik", en: "5. Entrepreneurship" },
        intro: {
          tr: "Girişimcilik yalnızca şirket kurmak değildir; fikir üretmek, sorumluluk almak, riski değerlendirmek ve çözüm geliştirmektir. \"Mahallendeki bir sorunu çözmek istesen ne yapardın?\" sorusu bile girişimci düşünceyi başlatır.",
          en: "Entrepreneurship isn't only about starting a company; it's generating ideas, taking responsibility, weighing risk and developing solutions. Even the question \"What would you do to solve a problem in your neighborhood?\" sparks an entrepreneurial mindset.",
        },
      },
      {
        heading: { tr: "Geleceğin Çocuğu", en: "The Child of the Future" },
        intro: {
          tr: "İngilizce bilen, teknolojiyi kullanan, yapay zekayı anlayan, iletişimi güçlü, çözüm üreten ve girişimci düşünebilen bir birey. Çocuklarımızı yalnızca sınavlara değil, hayata hazırlamamız gerekiyor.",
          en: "An individual who knows English, uses technology, understands AI, communicates well, produces solutions and thinks entrepreneurially. We must prepare our children not just for exams, but for life.",
        },
      },
    ],
  },
  {
    slug: "cocuklarda-kariyer-farkindaligi",
    order: 6,
    image: "/seminars/cocuklarda-kariyer-farkindaligi.jpg",
    category: FAMILY,
    title: {
      tr: "Çocuklarda Kariyer Farkındalığı",
      en: "Career Awareness in Children",
    },
    summary: {
      tr: "Çocuğunuzun hangi mesleği seçeceğini değil, hangi problemleri çözebileceğini konuşmalıyız. Kariyer farkındalığının ne zaman ve nasıl başladığını, çocuğun kendini keşfetmesini ele alan bir seminer.",
      en: "We should talk not about which profession your child will choose, but which problems they can solve. A seminar on when and how career awareness begins, and how a child discovers themselves.",
    },
    sections: [
      {
        heading: {
          tr: "Kariyer Planlaması Kaç Yaşında Başlar?",
          en: "At What Age Does Career Planning Begin?",
        },
        intro: {
          tr: "Meslek seçimi değil, kendini tanıma süreci okul öncesinde başlar. Erken farkındalık, doğru tercihlerin temelini atar.",
          en: "It is not choosing a profession but the process of self-discovery that begins before school. Early awareness lays the foundation for the right choices.",
        },
      },
      {
        heading: {
          tr: "Çocuk Kendini Nasıl Keşfeder?",
          en: "How Does a Child Discover Themselves?",
        },
        items: {
          tr: ["İlgi alanları", "Güçlü yönleri", "Değerleri", "Hayalleri"],
          en: ["Interests", "Strengths", "Values", "Dreams"],
        },
      },
      {
        heading: {
          tr: "Ailelerin En Büyük Hatası",
          en: "The Biggest Mistake Families Make",
        },
        intro: {
          tr: "Kendi gerçekleşmemiş hayallerini ya da aile geleneklerini çocuğa dayatmak. Çocuğun kendi ilgi ve yeteneklerine alan açmak çok daha sağlıklıdır.",
          en: "Imposing their own unrealized dreams or family traditions on the child. Making room for the child's own interests and talents is far healthier.",
        },
      },
      {
        heading: { tr: "Geleceğin Meslekleri", en: "The Professions of the Future" },
        items: {
          tr: [
            "Yapay zeka uzmanı",
            "Veri analisti",
            "Oyun tasarımcısı",
            "Siber güvenlik uzmanı",
            "Dijital içerik üreticisi",
            "Eğitim teknolojileri uzmanı",
          ],
          en: [
            "AI specialist",
            "Data analyst",
            "Game designer",
            "Cyber security specialist",
            "Digital content creator",
            "Educational technology specialist",
          ],
        },
      },
    ],
  },
  {
    slug: "dijital-bagimlilik-ve-aileye-etkileri",
    order: 7,
    image: "/seminars/dijital-bagimlilik-ve-aileye-etkileri.jpg",
    category: FAMILY,
    title: {
      tr: "Dijital Bağımlılık ve Aileye Etkileri",
      en: "Digital Addiction and Its Effects on the Family",
    },
    summary: {
      tr: "Çocuğunuz günde kaç saat ekran karşısında? Peki ya siz? Dijital bağımlılığın belirtilerini, ailelerin farkında olmadan yaptığı hataları ve sağlıklı bir denge için çözümleri ele alan bir seminer.",
      en: "How many hours a day is your child in front of a screen? And you? A seminar on the signs of digital addiction, the mistakes families unknowingly make, and solutions for a healthy balance.",
    },
    sections: [
      {
        heading: {
          tr: "Dijital Bağımlılık Belirtileri",
          en: "Signs of Digital Addiction",
        },
        items: {
          tr: [
            "Sürekli telefon kontrolü",
            "Öfke nöbetleri",
            "Uyku bozukluğu",
            "Sosyal geri çekilme",
            "Ders başarısında düşüş",
          ],
          en: [
            "Constantly checking the phone",
            "Angry outbursts",
            "Sleep disturbances",
            "Social withdrawal",
            "Declining school performance",
          ],
        },
      },
      {
        heading: { tr: "Aile Hataları", en: "Family Mistakes" },
        items: {
          tr: [
            "Telefonu susturucu olarak kullanmak",
            "Sınırsız ekran süresi vermek",
            "Kendisi ekran başındayken çocuğa yasak koymak",
          ],
          en: [
            "Using the phone as a pacifier",
            "Allowing unlimited screen time",
            "Banning screens for the child while being on screens themselves",
          ],
        },
      },
      {
        heading: { tr: "Çözüm", en: "The Solution" },
        items: {
          tr: ["Dijital sözleşme", "Aile etkinlikleri", "Ortak zaman planlama"],
          en: ["A digital agreement", "Family activities", "Planning shared time"],
        },
      },
      {
        heading: { tr: "Destekleyici Programlar", en: "Supporting Programs" },
        items: {
          tr: ["Yaz kampı", "Spor programları", "Akıl oyunları", "STEM atölyeleri"],
          en: ["Summer camp", "Sports programs", "Mind games", "STEM workshops"],
        },
      },
    ],
  },
  {
    slug: "turkiye-yuzyili-maarif-modeli",
    order: 8,
    image: "/seminars/turkiye-yuzyili-maarif-modeli.jpg",
    category: FAMILY,
    title: {
      tr: "Türkiye Yüzyılı Maarif Modeli ve Geleceğin Becerileri",
      en: "The Türkiye Century Education Model and the Skills of the Future",
    },
    summary: {
      tr: "Artık sadece akademik başarı yeterli değil. Okul yöneticileri ve öğretmenler için, geleceğin becerilerini ve çocukları hayata hazırlamanın yollarını ele alan bir seminer.",
      en: "Academic success alone is no longer enough. A seminar for school leaders and teachers on the skills of the future and how to prepare children for life.",
    },
    sections: [
      {
        heading: { tr: "Geleceğin Becerileri", en: "The Skills of the Future" },
        items: {
          tr: [
            "Eleştirel düşünme",
            "Problem çözme",
            "İletişim",
            "İş birliği",
            "Dijital okuryazarlık",
            "Girişimcilik",
          ],
          en: [
            "Critical thinking",
            "Problem solving",
            "Communication",
            "Collaboration",
            "Digital literacy",
            "Entrepreneurship",
          ],
        },
      },
      {
        heading: { tr: "Velilere Mesaj", en: "A Message to Parents" },
        intro: {
          tr: "Çocuklarımızı sınava değil, hayata hazırlamalıyız. Akademik bilgiyi geleceğin becerileriyle birleştiren bir yaklaşım, kalıcı başarının anahtarı.",
          en: "We must prepare our children for life, not just for exams. An approach that combines academic knowledge with future skills is the key to lasting success.",
        },
      },
      {
        heading: { tr: "Destekleyici Programlar", en: "Supporting Programs" },
        items: {
          tr: [
            "Mantık ve problem çözme",
            "İngilizce programları",
            "Girişimcilik atölyeleri",
            "Yapay zeka eğitimleri",
          ],
          en: [
            "Logic and problem solving",
            "English programs",
            "Entrepreneurship workshops",
            "AI training",
          ],
        },
      },
    ],
  },
  {
    slug: "yapay-zeka-caginda-cocuk-yetistirmek",
    order: 9,
    image: "/seminars/yapay-zeka-caginda-cocuk-yetistirmek.jpg",
    category: FAMILY,
    title: {
      tr: "Yapay Zeka Çağında Çocuk Yetiştirmek",
      en: "Raising Children in the Age of AI",
    },
    summary: {
      tr: "Çocuğunuzun mesleği henüz icat edilmemiş olabilir. Yapay zekayla büyüyen bir kuşağı yetiştirirken yapay zekanın neleri değiştirdiğini ve ailelerin nasıl rehberlik edebileceğini ele alan bir seminer.",
      en: "Your child's profession may not have been invented yet. A seminar on what AI is changing and how families can guide a generation growing up with it.",
    },
    sections: [
      {
        heading: {
          tr: "Yapay Zekâ Neleri Değiştiriyor?",
          en: "What Is AI Changing?",
        },
        items: {
          tr: ["Eğitim", "Meslekler", "İletişim", "Öğrenme biçimleri"],
          en: ["Education", "Professions", "Communication", "Ways of learning"],
        },
      },
      {
        heading: { tr: "Sormamız Gereken Sorular", en: "The Questions We Must Ask" },
        intro: {
          tr: "Bugünün çocukları bilgiye saniyeler içinde ulaşıyor. Ama doğru bilgiye ulaşabiliyor mu, üretebiliyor mu, eleştirel düşünebiliyor mu? Asıl mesele bu.",
          en: "Today's children reach information in seconds. But can they reach the right information, produce it, and think critically? That is the real question.",
        },
      },
      {
        heading: { tr: "Aileler Ne Yapmalı?", en: "What Should Families Do?" },
        items: {
          tr: [
            "Yasaklamak yerine öğretmek",
            "Kontrol etmek yerine rehberlik etmek",
            "Teknolojiyi tüketmek yerine üretmek",
          ],
          en: [
            "Teach instead of forbidding",
            "Guide instead of controlling",
            "Produce with technology instead of just consuming it",
          ],
        },
      },
      {
        heading: { tr: "Destekleyici Programlar", en: "Supporting Programs" },
        items: {
          tr: [
            "Yapay zeka okuryazarlığı atölyesi",
            "Kodlama atölyeleri",
            "İngilizce programları",
            "Yaz kampı",
          ],
          en: [
            "AI literacy workshop",
            "Coding workshops",
            "English programs",
            "Summer camp",
          ],
        },
      },
    ],
  },
  {
    slug: "borsada-bilincli-yatirimin-ilk-adimlari",
    order: 10,
    image: "/seminars/borsada-bilincli-yatirimin-ilk-adimlari.jpg",
    category: BUSINESS,
    title: {
      tr: "Borsada Bilinçli Yatırımın İlk Adımları",
      en: "First Steps to Informed Investing in the Stock Market",
    },
    summary: {
      tr: "Borsanın nasıl işlediğini, yatırımcıların en sık yaptığı hataları ve bilinçli yatırımın temellerini ele alan bir tanıtım semineri. Finans sektöründe profesyonel kariyer hedefleyenler için bir başlangıç.",
      en: "An introductory seminar on how the stock market works, the most common mistakes investors make, and the fundamentals of informed investing — a starting point for those aiming for a professional career in finance.",
    },
    sections: [
      {
        heading: { tr: "Seminer İçeriği", en: "Seminar Content" },
        items: {
          tr: [
            "Borsa nedir?",
            "Hisse senedi nasıl çalışır?",
            "Yatırımcıların yaptığı hatalar",
            "SPK lisansı neden önemlidir?",
          ],
          en: [
            "What is the stock market?",
            "How do stocks work?",
            "The mistakes investors make",
            "Why a capital markets (SPK) license matters",
          ],
        },
      },
    ],
  },
  {
    slug: "para-yonetimi-bilmeyen-sirketler",
    order: 11,
    image: "/seminars/para-yonetimi-bilmeyen-sirketler.jpg",
    category: BUSINESS,
    title: {
      tr: "Para Yönetimi Bilmeyen Şirketler Neden Batar?",
      en: "Why Do Companies That Can't Manage Money Fail?",
    },
    summary: {
      tr: "Nakit akışı, kârlılık ve finansal planlamanın bir şirketin geleceğini nasıl belirlediğini ele alan bir seminer. Finansal yönetimi profesyonel olarak öğrenmek isteyenler için temel bir bakış.",
      en: "A seminar on how cash flow, profitability and financial planning shape a company's future — an essential overview for those who want to learn financial management professionally.",
    },
    sections: [
      {
        heading: { tr: "Seminer İçeriği", en: "Seminar Content" },
        items: {
          tr: [
            "Nakit akışı",
            "Kârlılık",
            "Finansal planlama",
            "Şirketlerde yapılan mali hatalar",
          ],
          en: [
            "Cash flow",
            "Profitability",
            "Financial planning",
            "Common financial mistakes in companies",
          ],
        },
      },
    ],
  },
  {
    slug: "ise-alimda-en-cok-yapilan-10-hata",
    order: 12,
    image: "/seminars/ise-alimda-en-cok-yapilan-10-hata.jpg",
    category: BUSINESS,
    title: {
      tr: "İşe Alımda En Çok Yapılan 10 Hata",
      en: "The 10 Most Common Hiring Mistakes",
    },
    summary: {
      tr: "CV değerlendirmeden mülakat tekniklerine, yetkinlik bazlı seçimden insan kaynaklarında yapay zekaya kadar doğru işe alımın inceliklerini ele alan bir seminer.",
      en: "A seminar on the essentials of effective hiring — from CV screening and interview techniques to competency-based selection and the use of AI in human resources.",
    },
    sections: [
      {
        heading: { tr: "Seminer İçeriği", en: "Seminar Content" },
        items: {
          tr: [
            "CV değerlendirme",
            "Mülakat teknikleri",
            "Yetkinlik bazlı seçim",
            "İnsan kaynaklarında yapay zekâ",
          ],
          en: [
            "CV screening",
            "Interview techniques",
            "Competency-based selection",
            "AI in human resources",
          ],
        },
      },
    ],
  },
  {
    slug: "ise-alim-surecinde-yasal-riskler",
    order: 13,
    image: "/seminars/ise-alim-surecinde-yasal-riskler.jpg",
    category: BUSINESS,
    title: {
      tr: "İşe Alım Sürecinde Yasal Riskler",
      en: "Legal Risks in the Hiring Process",
    },
    summary: {
      tr: "İş Kanunu ve KVKK çerçevesinde işe alım sürecinin hukuki yönlerini, mülakatlarda dikkat edilmesi gerekenleri ve işverenin sorumluluklarını ele alan bir seminer.",
      en: "A seminar on the legal dimensions of hiring under labor law and data protection (KVKK), what to watch for in interviews, and the employer's responsibilities.",
    },
    sections: [
      {
        heading: { tr: "Seminer İçeriği", en: "Seminar Content" },
        items: {
          tr: [
            "İş Kanunu",
            "KVKK",
            "Mülakatlarda dikkat edilmesi gerekenler",
            "Hukuki sorumluluklar",
          ],
          en: [
            "Labor law",
            "Personal data protection (KVKK)",
            "What to watch for in interviews",
            "Legal responsibilities",
          ],
        },
      },
    ],
  },
  {
    slug: "ab-hibeleri-ile-proje-yazmak",
    order: 14,
    image: "/seminars/ab-hibeleri-ile-proje-yazmak.jpg",
    category: BUSINESS,
    title: {
      tr: "AB Hibeleri ile Proje Yazmadan Para Bulmak Mümkün mü?",
      en: "Can You Find Funding Through EU Grants Without Writing a Project?",
    },
    summary: {
      tr: "Erasmus+, Horizon Europe, TÜBİTAK ve KOSGEB gibi hibe programlarını ve başarılı proje örneklerini ele alan bir seminer. Proje döngüsü yönetimine ilgi duyanlar için güçlü bir giriş.",
      en: "A seminar on grant programs such as Erasmus+, Horizon Europe, TÜBİTAK and KOSGEB, with successful project examples — a strong introduction for those interested in project cycle management.",
    },
    sections: [
      {
        heading: { tr: "Seminer İçeriği", en: "Seminar Content" },
        items: {
          tr: [
            "Erasmus+",
            "Horizon Europe",
            "TÜBİTAK",
            "KOSGEB",
            "Başarılı proje örnekleri",
          ],
          en: [
            "Erasmus+",
            "Horizon Europe",
            "TÜBİTAK",
            "KOSGEB",
            "Successful project examples",
          ],
        },
      },
    ],
  },
  {
    slug: "temel-hukuk-bilgileri",
    order: 15,
    image: "/seminars/temel-hukuk-bilgileri.jpg",
    category: BUSINESS,
    title: {
      tr: "Herkesin Bilmesi Gereken Temel Hukuk Bilgileri",
      en: "Basic Legal Knowledge Everyone Should Have",
    },
    summary: {
      tr: "Haklardan sözleşmelere, tüketici hukukundan günlük yaşamda karşılaşılan hukuki durumlara kadar herkesin bilmesi gereken temel hukuk bilgilerini ele alan bir seminer.",
      en: "A seminar on the basic legal knowledge everyone should have — from rights and contracts to consumer law and the legal situations we encounter in daily life.",
    },
    sections: [
      {
        heading: { tr: "Seminer İçeriği", en: "Seminar Content" },
        items: {
          tr: ["Haklar", "Sözleşmeler", "Tüketici hukuku", "Günlük yaşamda hukuk"],
          en: ["Rights", "Contracts", "Consumer law", "Law in everyday life"],
        },
      },
    ],
  },
  {
    slug: "anayasa-haklarimiz",
    order: 16,
    image: "/seminars/anayasa-haklarimiz.jpg",
    category: BUSINESS,
    title: {
      tr: "Vatandaş Olarak Haklarımızı Ne Kadar Biliyoruz?",
      en: "How Well Do We Know Our Rights as Citizens?",
    },
    summary: {
      tr: "Temel haklar, özgürlükler ve anayasal güvenceleri ele alan bir seminer. Anayasa hukukunun günlük hayattaki yansımalarını anlamak isteyenler için.",
      en: "A seminar on fundamental rights, freedoms and constitutional guarantees — for those who want to understand how constitutional law reflects in daily life.",
    },
    sections: [
      {
        heading: { tr: "Seminer İçeriği", en: "Seminar Content" },
        items: {
          tr: ["Temel haklar", "Özgürlükler", "Anayasal güvence"],
          en: ["Fundamental rights", "Freedoms", "Constitutional guarantees"],
        },
      },
    ],
  },
  {
    slug: "devletle-is-yaparken-haklarimiz",
    order: 17,
    image: "/seminars/devletle-is-yaparken-haklarimiz.jpg",
    category: BUSINESS,
    title: {
      tr: "Devletle İş Yaparken Haklarınızı Biliyor musunuz?",
      en: "Do You Know Your Rights When Dealing With the State?",
    },
    summary: {
      tr: "İdari işlemler, dava süreçleri ve itiraz yollarını ele alan bir seminer. Kamu kurumlarıyla ilişkilerde haklarını bilmek isteyen herkes için.",
      en: "A seminar on administrative acts, litigation processes and avenues of appeal — for anyone who wants to know their rights in dealings with public institutions.",
    },
    sections: [
      {
        heading: { tr: "Seminer İçeriği", en: "Seminar Content" },
        items: {
          tr: ["İdari işlemler", "Dava süreçleri", "İtiraz yolları"],
          en: ["Administrative acts", "Litigation processes", "Avenues of appeal"],
        },
      },
    ],
  },
  {
    slug: "sirket-kurarken-hukuki-hatalar",
    order: 18,
    image: "/seminars/sirket-kurarken-hukuki-hatalar.jpg",
    category: BUSINESS,
    title: {
      tr: "Şirket Kurarken Yapılan Hukuki Hatalar",
      en: "Legal Mistakes Made When Founding a Company",
    },
    summary: {
      tr: "Şirket türleri, ortaklık yapıları ve sözleşmeler etrafında, girişimcilerin şirket kurarken en sık düştüğü hukuki hataları ele alan bir seminer.",
      en: "A seminar on the legal mistakes entrepreneurs most often make when founding a company, covering company types, partnership structures and contracts.",
    },
    sections: [
      {
        heading: { tr: "Seminer İçeriği", en: "Seminar Content" },
        items: {
          tr: ["Şirket türleri", "Ortaklık yapıları", "Sözleşmeler"],
          en: ["Company types", "Partnership structures", "Contracts"],
        },
      },
    ],
  },
  {
    slug: "muhasebe-bilmeyen-girisimci",
    order: 19,
    image: "/seminars/muhasebe-bilmeyen-girisimci.jpg",
    category: BUSINESS,
    title: {
      tr: "Muhasebe Bilmeyen Girişimci Para Kaybeder",
      en: "Entrepreneurs Who Don't Understand Accounting Lose Money",
    },
    summary: {
      tr: "Gelir-gider takibi, vergi ve bilanço okumanın bir işletmenin sağlığını nasıl belirlediğini ele alan bir seminer. Muhasebenin temellerini kavramak isteyen girişimciler için.",
      en: "A seminar on how income-expense tracking, taxes and reading a balance sheet determine a business's health — for entrepreneurs who want to grasp the fundamentals of accounting.",
    },
    sections: [
      {
        heading: { tr: "Seminer İçeriği", en: "Seminar Content" },
        items: {
          tr: ["Gelir-gider takibi", "Vergi", "Bilanço okuma"],
          en: ["Income-expense tracking", "Taxation", "Reading a balance sheet"],
        },
      },
    ],
  },
  {
    slug: "ekonomiyi-anlayan-kazanir",
    order: 20,
    image: "/seminars/ekonomiyi-anlayan-kazanir.jpg",
    category: BUSINESS,
    title: {
      tr: "Ekonomiyi Anlayan Kazanır: Türkiye ve Dünya Ekonomisini Okumak",
      en: "Those Who Understand the Economy Win: Reading the Turkish and Global Economy",
    },
    summary: {
      tr: "İktisadın temel kavramlarından Türkiye ve dünya ekonomisini okumaya uzanan, tek çatı altında bir seminer. Ekonomiyi daha iyi anlamak isteyen herkes için.",
      en: "A single umbrella seminar spanning the core concepts of economics to reading the Turkish and global economy — for anyone who wants to understand the economy better.",
    },
    sections: [
      {
        heading: { tr: "Kapsanan Alanlar", en: "Topics Covered" },
        items: {
          tr: [
            "İktisat",
            "İktisadi analiz",
            "Uluslararası iktisat",
            "Türkiye ekonomisi",
            "Maliye politikası",
          ],
          en: [
            "Economics",
            "Economic analysis",
            "International economics",
            "The Turkish economy",
            "Fiscal policy",
          ],
        },
      },
    ],
  },
  {
    slug: "yokdil-semineri",
    order: 21,
    image: "/seminars/yapay-zeka-caginda-kariyer-ve-yabanci-dil.jpg",
    category: ACADEMY,
    title: {
      tr: "YÖKDİL Semineri",
      en: "YOKDIL Seminar",
    },
    date: {
      tr: "4 ve 7 Ağustos 2026",
      en: "4 and 7 August 2026",
    },
    time: {
      tr: "20.30",
      en: "20.30",
    },
    location: {
      tr: "ONLINE",
      en: "ONLINE",
    },
    summary: {
      tr: "YÖKDİL (Yükseköğretim Kurumları Yabancı Dil Sınavı), akademik kariyer ve lisansüstü eğitim için kritik öneme sahip merkezi bir yabancı dil sınavıdır. Sınavın yapısını, stratejilerini ve başarı yollarını ele alan ücretsiz online seminerimize katılın.",
      en: "YOKDIL (Higher Education Institutions Foreign Language Exam) is a central foreign language exam critical for academic careers and postgraduate education. Join our free online seminar covering the exam structure, strategies and paths to success.",
    },
    isFree: true,
    sections: [
      {
        heading: { tr: "YÖKDİL Nedir?", en: "What Is YOKDIL?" },
        intro: {
          tr: "YÖKDİL, ÖSYM tarafından yılda iki kez düzenlenen, akademisyenlerin ve lisansüstü öğrencilerin yabancı dil yeterliliğini ölçen merkezi bir sınavdır. Sağlık Bilimleri, Sosyal Bilimler ve Fen Bilimleri olmak üzere üç alanda uygulanır.",
          en: "YOKDIL is a central exam administered twice a year by OSYM, measuring the foreign language proficiency of academics and postgraduate students. It is offered in three fields: Health Sciences, Social Sciences and Natural Sciences.",
        },
      },
      {
        heading: { tr: "Sınav Formatı", en: "Exam Format" },
        intro: {
          tr: "Sınav 80 sorudan oluşur ve 150 dakika sürer. Tamamen çoktan seçmeli olup akademik metinler üzerinden okuma ve anlama becerileri test edilir.",
          en: "The exam consists of 80 questions and lasts 150 minutes. It is entirely multiple-choice and tests reading comprehension skills based on academic texts.",
        },
        items: {
          tr: [
            "80 çoktan seçmeli soru",
            "150 dakika süre",
            "Akademik okuma ve anlama odaklı",
            "Alan bazlı kelime bilgisi",
            "Paragraf tamamlama ve çeviri soruları",
          ],
          en: [
            "80 multiple-choice questions",
            "150 minutes duration",
            "Focused on academic reading comprehension",
            "Field-specific vocabulary",
            "Paragraph completion and translation questions",
          ],
        },
      },
      {
        heading: { tr: "Kimler Girebilir?", en: "Who Can Take It?" },
        items: {
          tr: [
            "Yüksek lisans ve doktora öğrencileri",
            "Akademisyenler ve araştırma görevlileri",
            "Doçentlik başvurusu yapacak öğretim üyeleri",
            "Yabancı dil yeterliliği arayan tüm kamu personeli",
          ],
          en: [
            "Master's and doctoral students",
            "Academics and research assistants",
            "Faculty members applying for associate professorship",
            "All public sector employees seeking language proficiency",
          ],
        },
      },
      {
        heading: { tr: "YÖKDİL Neden Önemli?", en: "Why Is YOKDIL Important?" },
        items: {
          tr: [
            "Lisansüstü eğitime kabul için zorunlu",
            "Doçentlik başvurusunda yabancı dil şartı",
            "Akademik yükselmelerde puan avantajı",
            "Uluslararası yayın ve araştırma kapasitesini artırma",
            "Kamu kurumlarında yabancı dil tazminatı hakkı",
          ],
          en: [
            "Required for postgraduate admission",
            "Language requirement for associate professorship",
            "Score advantage in academic promotions",
            "Enhances international publication and research capacity",
            "Foreign language allowance in public institutions",
          ],
        },
      },
      {
        heading: { tr: "Seminerde Neler Ele Alınacak?", en: "What Will the Seminar Cover?" },
        items: {
          tr: [
            "Canlı anlatım ile sınav stratejileri",
            "Sınav taktikleri ve zaman yönetimi",
            "Soru tiplerinin detaylı analizi",
            "Örnek sorular ve çözüm yöntemleri",
            "Çıkmış soru analizleri",
          ],
          en: [
            "Live instruction on exam strategies",
            "Exam tactics and time management",
            "Detailed analysis of question types",
            "Sample questions and solution methods",
            "Analysis of past exam questions",
          ],
        },
      },
      {
        heading: { tr: "Hedefine Bir Adım Daha Yaklaş", en: "Get One Step Closer to Your Goal" },
        intro: {
          tr: "YÖKDİL sınavında başarılı olmak, akademik kariyerinizde yeni kapılar açar. Ücretsiz online seminerimiz, sınava en etkili şekilde hazırlanmanız için ihtiyacınız olan tüm stratejileri ve ipuçlarını sunuyor.",
          en: "Succeeding in the YOKDIL exam opens new doors in your academic career. Our free online seminar offers all the strategies and tips you need to prepare for the exam most effectively.",
        },
      },
    ],
  },
];

export const SEMINARS: Seminar[] = ALL_SEMINARS.filter(
  (seminar) => seminar.slug === "cost-semineri" || seminar.slug === "yokdil-semineri"
);

export function getSeminar(slug: string): Seminar | undefined {
  return SEMINARS.find((s) => s.slug === slug);
}

export function getLocalized(value: Localized, lang: Lang): string {
  return value[lang] ?? value.tr;
}

export function getLocalizedList(value: LocalizedList, lang: Lang): string[] {
  return value[lang] ?? value.tr;
}
