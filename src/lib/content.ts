import type { LucideIcon } from "lucide-react";
import {
  Landmark,
  Radio,
  LineChart,
  Lightbulb,
  Gamepad2,
  Presentation,
  HeartPulse,
  Cpu,
  Cog,
} from "lucide-react";
import { COLORS } from "./constants";

export type AccentColor = keyof typeof COLORS;

export const EVENT_FACTS = [
  { value: 3, unit: "", label: "أيام" },
  { value: 9, unit: "", label: "مسارات" },
  { value: 20000, unit: "+", label: "زائر متوقع" },
] as const;

export interface Track {
  number: string;
  title: string;
  description: string;
  accent: AccentColor;
  icon: LucideIcon;
  /** Industries a sponsor of this track would typically come from. */
  sectors: readonly string[];
}

export const TRACKS: Track[] = [
  {
    number: "01",
    title: "المتحف التاريخي",
    description:
      "رحلة زمنية تفاعلية توثّق مسيرة كرة القدم السعودية منذ بداياتها عام 1927، مرورًا بأبرز لحظاتها وتحولاتها، وصولًا إلى طموحات المملكة ومستقبلها الرياضي في 2034.",
    accent: "coral",
    icon: Landmark,
    sectors: ["الثقافة والتراث", "الأندية والاتحادات"],
  },
  {
    number: "02",
    title: "الإعلام",
    description:
      "مسار يكشف ما يحدث خلف الشاشات، ويعرّف الزائر برحلة المحتوى الرياضي من الملعب إلى الجمهور، عبر البث والمنصات الرقمية والبودكاست وصناعة المحتوى وبناء العلامات الإعلامية.",
    accent: "fuchsia",
    icon: Radio,
    sectors: ["القنوات والمنصات الرقمية", "الإنتاج والإعلان"],
  },
  {
    number: "03",
    title: "الاقتصاد والاستثمار",
    description:
      "مسار يوضّح الأثر الاقتصادي لصناعة كرة القدم، ويستعرض نماذج الاستثمار ومصادر الإيرادات والصفقات الرياضية، إلى جانب الفرص المتاحة أمام الشركات والمستثمرين في القطاع.",
    accent: "green",
    icon: LineChart,
    sectors: ["البنوك", "الاستثمار والتأمين"],
  },
  {
    number: "04",
    title: "ريادة الأعمال",
    description:
      "ركن يساعد الزائر على اكتشاف الفرص والمشكلات الموجودة في القطاع الرياضي، والتعرّف على كيفية تحويلها إلى مشاريع وحلول مبتكرة في التقنية والتجارة الإلكترونية وتحليل الأداء وتجربة الجماهير.",
    accent: "coral",
    icon: Lightbulb,
    sectors: ["حاضنات الأعمال", "رأس المال الجريء"],
  },
  {
    number: "05",
    title: "الركن الترفيهي",
    description:
      "تجربة تفاعلية تجمع بين المتعة والمعرفة من خلال تحديات كروية وتقنيات حديثة، مثل الواقع الافتراضي واختبارات المعلومات وتحليل ردة فعل الجماهير وتحديات المهارات والتسديد.",
    accent: "fuchsia",
    icon: Gamepad2,
    sectors: ["الألعاب والترفيه", "العلامات الاستهلاكية"],
  },
  {
    number: "06",
    title: "المسرح الرئيسي",
    description:
      "مساحة للحوار وتبادل الخبرات، تستضيف قادة الأندية والإعلاميين والمستثمرين والأكاديميين ورواد الأعمال لمناقشة واقع كرة القدم السعودية وفرصها ومستقبل صناعتها.",
    accent: "green",
    icon: Presentation,
    sectors: ["جميع القطاعات"],
  },
  {
    number: "07",
    title: "ركن الصحة",
    description:
      "مسار يستعرض دور العلوم الصحية في كرة القدم، من الطب الرياضي والوقاية من الإصابات والتأهيل، إلى التغذية والاستشفاء ورفع جاهزية اللاعبين وأدائهم.",
    accent: "coral",
    icon: HeartPulse,
    sectors: ["المستشفيات والعيادات", "التغذية والمكملات"],
  },
  {
    number: "08",
    title: "ركن التقنية",
    description:
      "مسار يكشف كيف غيّرت التقنية كرة القدم، من تحليل البيانات والإحصائيات والذكاء الاصطناعي، إلى تتبع أداء اللاعبين واكتشاف المواهب ودعم القرارات داخل وخارج الملعب.",
    accent: "fuchsia",
    icon: Cpu,
    sectors: ["الاتصالات", "التقنية والذكاء الاصطناعي"],
  },
  {
    number: "09",
    title: "ركن الهندسة",
    description:
      "مسار يعرّف الزائر بدور الهندسة خلف تجربة كرة القدم، من تصميم الملاعب وتجهيزها وتطوير بنيتها وتقنياتها، إلى هندسة المعدات والكرة وصناعة بيئة رياضية أكثر كفاءة وأمانًا.",
    accent: "green",
    icon: Cog,
    sectors: ["الإنشاءات والبنية التحتية", "الطاقة والصناعة"],
  },
];

export interface Person {
  role: string;
  name: string;
}

export type TeamAudience = "male" | "female";

export interface TeamUnit {
  slug: string;
  title: string;
  description: string;
  skills: readonly string[];
  audience?: TeamAudience;
  leader?: Person;
}

export interface Department {
  slug: string;
  title: string;
  short: string;
  lead: string;
  accent: AccentColor;
  manager: Person;
  teams: readonly TeamUnit[];
}

export const DEPARTMENTS: readonly Department[] = [
  {
    slug: "event-design",
    title: "إدارة تصميم الحدث",
    short: "تصميم الحدث",
    lead: "تحوّل مسارات كورة إلى مكان يُزار: توزيع الأركان، سرد المتحف، ومسار الزائر.",
    accent: "coral",
    manager: { role: "مدير الإدارة", name: "أحمد بخاري" },
    teams: [
      {
        slug: "exhibition-design",
        title: "فريق تصميم المعرض",
        description:
          "يحوّل أفكار مسارات كورة إلى تجربة مكانية متكاملة، من توزيع الأركان ومسار الزائر إلى اللوحات والعناصر البصرية والتنسيق مع الفرق التنفيذية.",
        skills: ["التصميم المكاني", "النمذجة ثلاثية الأبعاد", "تجربة الزائر", "التفكير البصري"],
        audience: "male",
        leader: { role: "قائد الفريق", name: "مهند الرحيلي" },
      },
      {
        slug: "museum-design",
        title: "فريق تصميم المتحف",
        description:
          "يبني تجربة المعرض التاريخي التي تروي تطور كرة القدم السعودية، وينظم عرض المحطات والمواد التاريخية والعناصر التفاعلية بأسلوب مترابط.",
        skills: ["البحث", "السرد القصصي", "تنظيم المعارض", "التصميم البصري"],
        audience: "female",
        leader: { role: "قائدة الفريق", name: "زهرة الحداد" },
      },
    ],
  },
  {
    slug: "marketing",
    title: "إدارة التسويق",
    short: "التسويق",
    lead: "ثلاثة فرق تمسك الهوية والمحتوى والحضور الميداني، قبل الحدث وأثناءه.",
    accent: "fuchsia",
    manager: { role: "مدير الإدارة", name: "طارق الحربي" },
    teams: [
      {
        slug: "graphic-design",
        title: "فريق التصميم",
        description:
          "يصمم المواد الرقمية والمطبوعة والحملات الإعلامية وفق هوية كورة، ويحافظ على اتساق العلامة عبر جميع نقاط التواصل.",
        skills: ["التصميم الجرافيكي", "الموشن", "الهوية البصرية", "تصميم المحتوى"],
        audience: "female",
        leader: { role: "قائدة الفريق", name: "فاطمة الأمير" },
      },
      {
        slug: "digital-marketing",
        title: "فريق التسويق الرقمي",
        description:
          "يبحث ويكتب ويخطط للمحتوى، ويساهم في إنتاج وتغطية المواد الإعلامية عبر المنصات الرقمية قبل الحدث وأثناءه.",
        skills: ["الكتابة", "البحث", "صناعة المحتوى", "التصوير والتحرير"],
        audience: "male",
        leader: { role: "قائد الفريق", name: "خالد المسلم" },
      },
      {
        slug: "field-marketing",
        title: "فريق التسويق الميداني",
        description:
          "ينفذ الحملات والأنشطة التعريفية داخل الجامعة، ويتواصل مباشرة مع الجمهور لزيادة الوعي بالحدث وتحفيز الحضور.",
        skills: ["التواصل", "العمل الميداني", "تنظيم الحملات", "التفاعل مع الجمهور"],
        audience: "female",
        leader: { role: "قائدة الفريق", name: "دنيا الغميجان" },
      },
    ],
  },
  {
    slug: "project",
    title: "إدارة المشاريع",
    short: "المشاريع",
    lead: "تحويل الخطط إلى أعمال واضحة وقابلة للتنفيذ، من خلال تنظيم المهام وتحديد الأولويات والمواعيد، والتنسيق بين الأطراف، ومتابعة سير العمل والإنجاز، وتوثيق التقدم ومعالجة التحديات لضمان اكتمال المشاريع وفق المسار المحدد.",
    accent: "green",
    manager: { role: "مدير الإدارة", name: "عمار الهذلي" },
    teams: [
      
  
    ],
  },
  {
    slug: "operations",
    title: "إدارة العمليات واللوجستيات",
    short: "العمليات",
    lead: "جاهزية الموقع، الجداول، وحركة المواد والفرق يوم التنفيذ.",
    accent: "coral",
    manager: { role: "مدير الإدارة", name: "محمد العوفي" },
    teams: [
          {
          slug: "operations-male",
          title: "فريق العمليات",
          description:
            "مسؤول عن تشغيل الفعاليات ميدانيًا، ومتابعة جاهزية المواقع، وتنظيم سير العمل، والتنسيق بين الفرق لضمان تنفيذ الخطط بكفاءة ومعالجة الاحتياجات والتحديات أثناء الفعالية.",
          skills: ["إدارة العمليات", "التنظيم الميداني", "حل المشكلات", "التنسيق بين الفرق"],
          audience: "male",
          leader: { role: "قائد الفريق", name: "سليمان الحزيمي" },
        },
        {
          slug: "operations-female",
          title: "فريق العمليات",
          description:
            "مسؤول عن تشغيل الفعاليات ميدانيًا، ومتابعة جاهزية المواقع، وتنظيم سير العمل، والتنسيق بين الفرق لضمان تنفيذ الخطط بكفاءة ومعالجة الاحتياجات والتحديات أثناء الفعالية.",
          skills: ["إدارة العمليات", "التنظيم الميداني", "حل المشكلات", "التنسيق بين الفرق"],
          audience: "female",
          leader: { role: "قائدة الفريق", name: "" },
        },
        {
          slug: "logistics-male",
          title: "فريق اللوجستيات",
          description:
            "مسؤول عن تجهيز ونقل وتوزيع المعدات والمواد، ومتابعة المخزون والاحتياجات اللوجستية، وضمان وصول الموارد المطلوبة إلى المكان والوقت المناسب لدعم تشغيل الفعاليات.",
          skills: ["إدارة اللوجستيات", "إدارة المخزون", "تنظيم المعدات", "التخطيط والتنسيق"],
          audience: "male",
          leader: { role: "قائد الفريق", name: "عبدالله اليامي" },
        },
    ],
  },
  {
    slug: "relations",
    title: "إدارة العلاقات والشراكات والمالية",
    short: "العلاقات",
    lead: "الضيوف، الشركاء، والميزانية: واجهة كورة الرسمية ومواردها.",
    accent: "fuchsia",
    manager: { role: "مدير الإدارة", name: "خالد النجدي" },
    teams: [
      {
        slug: "relations-team",
        title: "فريق العلاقات",
        description:
          "تدير التواصل الرسمي وتنسيق الضيوف والمتحدثين والمراسلات والبروتوكول، وتضمن تجربة مهنية للأطراف الخارجية.",
        skills: ["التواصل الرسمي", "التنسيق", "البروتوكول", "إدارة الضيوف"],
        audience: "male",
        leader: { role: "قائد الفريق", name: "نايف المسعد" },
      },
      {
        slug: "partnerships",
        title: "فريق الشراكات",
        description:
          "تبحث عن جهات متوافقة مع كورة، وتعد عروض الشراكة، وتتابع التواصل والالتزامات بين الحدث وشركائه.",
        skills: ["التفاوض", "إعداد العروض", "بناء العلاقات", "المتابعة"],
        audience: "female",
        leader: { role: "قائدة الفريق", name: "شوق الغامدي" },
      },
      {
        slug: "finance",
        title: "فريق المالية",
        description:
          "تتابع الميزانية والمصروفات والمستندات المالية، وتساعد على اتخاذ قرارات دقيقة تحافظ على موارد المشروع.",
        skills: ["الدقة", "Excel", "إعداد الميزانيات", "التوثيق"],
        audience: "male",
        leader: { role: "قائد الفريق", name: "سعيد العيد" },
      },
    ],
  },
  {
    slug: "tech",
    title: "إدارة التقنية",
    short: "التقنية",
    lead: "المنصات والأنظمة والتجارب الرقمية التي تشغّل الحدث أمام الزائر وخلف الكواليس.",
    accent: "green",
    manager: { role: "مدير الإدارة", name: "أسامة الغامدي" },
    teams: [
      {
        slug: "tech-team",
        title: "فريق التقنية",
        description:
          "يبني ويدير الحلول التقنية للحدث، من المنصات الرقمية والأنظمة التشغيلية إلى التجارب التفاعلية ودعم الفرق أثناء التنفيذ.",
        skills: ["التطوير", "الأنظمة", "التجارب الرقمية", "الدعم التقني"],
        audience: "male",
        leader: { role: "قائد الفريق", name: "محمد يار" },
      },
    ],
  },
];

export const LEADERSHIP = {
  title: "قيادة كورة",
  people: [
    { role: "قائد كورة", name: "عمر الحربي", highlight: "كورة" },
    { role: "نائب القائد", name: "خالد الجهني" },
  ],
} as const;

export const NAV_LINKS = [
  { href: "/#about", label: "عن كورة" },
  { href: "/#tracks", label: "المسارات" },
  { href: "/teams", label: "الفريق" },
  { href: "/partners", label: "الشركاء" },
  { href: "/speakers", label: "المتحدثون" },
] as const;

export interface TitledItem {
  number: string;
  title: string;
  description: string;
}

/** Home-page "why sponsor KORA" teaser. */
export const SPONSOR_TEASER: readonly TitledItem[] = [
  {
    number: "01",
    title: "جمهور يصنع المستقبل",
    description: "أكثر من 20 ألف زائر متوقع من طلبة الجامعات والمهتمين بصناعة الرياضة.",
  },
  {
    number: "02",
    title: "في قلب طموحات 2034",
    description: "ارتبط بحدث يواكب طموحات المملكة الرياضية ومستقبل كرة القدم السعودية.",
  },
  {
    number: "03",
    title: "حضور في مسارك",
    description: "تسعة مسارات متخصصة تتيح لعلامتك الظهور حيث يلتقي قطاعك بجمهوره.",
  },
];

export const SPONSOR_REASONS: readonly Omit<TitledItem, "number">[] = [
  {
    title: "جمهور جامعي شاب",
    description:
      "طلبة اليوم هم كفاءات القطاع الرياضي وقادته غدًا، وكورة تضع علامتك أمامهم مباشرة.",
  },
  {
    title: "متصل بطموحات 2034",
    description: "حدث يواكب تحوّل الرياضة السعودية وطموحات المملكة نحو 2034.",
  },
  {
    title: "منصة مستمرة",
    description:
      "رسالة كورة لا تنتهي بانتهاء الحدث؛ المحتوى الإعلامي والمعرفي يستمر ويستمر معه حضور شركائنا.",
  },
  {
    title: "حضور يناسب قطاعك",
    description:
      "اختر المسار الأقرب لنشاطك، من التقنية والإعلام إلى الصحة والاستثمار والهندسة.",
  },
];

export type PartnershipFormSlug = "track" | "main-stage" | "media" | "experience" | "in-kind";

export interface PartnershipForm {
  slug: PartnershipFormSlug;
  title: string;
  description: string;
}

/** General partnership shapes — never prices; packages are shared privately. */
export const PARTNERSHIP_FORMS: readonly PartnershipForm[] = [
  {
    slug: "track",
    title: "رعاية مسار أو ركن",
    description: "اربط اسم علامتك بأحد المسارات التسعة ومحتواه وتجربة زواره.",
  },
  {
    slug: "main-stage",
    title: "رعاية المسرح الرئيسي",
    description: "حضور على المنصة التي تجمع قادة الأندية والإعلاميين والمستثمرين.",
  },
  {
    slug: "media",
    title: "شراكة إعلامية ومحتوى",
    description: "ظهور في محتوى كورة الرقمي قبل الحدث وأثناءه وبعده.",
  },
  {
    slug: "experience",
    title: "تجربة تفاعلية",
    description: "صمّم تجربة لعلامتك داخل الركن الترفيهي يعيشها الزوار بأنفسهم.",
  },
  {
    slug: "in-kind",
    title: "شراكة عينية",
    description: "ادعم الحدث بمنتجاتك أو خدماتك مقابل حضور يناسب مساهمتك.",
  },
];

export const PARTNERSHIP_STEPS: readonly TitledItem[] = [
  {
    number: "01",
    title: "أرسل طلبك",
    description: "عبّئ النموذج في أقل من دقيقة؛ اسم الشركة والبريد يكفيان.",
  },
  {
    number: "02",
    title: "نتواصل معك",
    description: "يتواصل معك فريق الشراكات ويرسل لك ملف الرعاية الكامل.",
  },
  {
    number: "03",
    title: "نصمّم الشراكة معًا",
    description: "نختار معك شكل الحضور الأنسب لأهداف علامتك.",
  },
];

export const SECTORS = [
  "اتصالات وتقنية",
  "بنوك واستثمار",
  "صحة",
  "إعلام",
  "تجزئة",
  "طاقة",
  "أخرى",
] as const;

export interface Partner {
  name: string;
  /** Path under /public, e.g. "/assets/partners/acme.svg". */
  logo: string;
  href?: string;
}

/** Confirmed partners only. The "شركاؤنا" section stays hidden while empty. */
export const PARTNERS: readonly Partner[] = [];

/** Home-page "شارك في كورة" doors. The visitor path has no link: it shows the social icons. */
export const PARTICIPATE_PATHS: readonly {
  number: string;
  title: string;
  description: string;
  href?: string;
  cta?: string;
}[] = [
  {
    number: "01",
    title: "راعٍ أو شريك",
    description:
      "اربط علامتك بحدث يقدّم كرة القدم السعودية بوصفها صناعة، أمام جمهور جامعي واسع.",
    href: "/partners",
    cta: "اعرف أكثر عن الشراكة",
  },
  {
    number: "02",
    title: "متحدث",
    description: "شارك تجربتك على مسرح كورة، أو رشّح من يستحق أن يُسمع صوته.",
    href: "/speakers",
    cta: "قدّم أو رشّح متحدثًا",
  },
  {
    number: "03",
    title: "زائر ومهتم",
    description: "تابع كورة لتعرف كل جديد عن الحدث ومساراته وموعد التسجيل.",
  },
];

export const SPEAKER_PROFILES = [
  "قادة الأندية والاتحادات",
  "الإعلاميون وصنّاع المحتوى",
  "المستثمرون ورواد الأعمال",
  "الأكاديميون والباحثون",
  "المختصون في الطب وعلوم الرياضة",
  "اللاعبون والمدربون",
] as const;

export type SpeakerFormatSlug = "panel" | "talk" | "workshop" | "meetup";

export const SPEAKER_FORMATS: readonly { slug: SpeakerFormatSlug; title: string; description: string }[] = [
  {
    slug: "panel",
    title: "جلسة حوارية على المسرح الرئيسي",
    description: "نقاش مفتوح مع قادة القطاع أمام جمهور الحدث.",
  },
  {
    slug: "talk",
    title: "محاضرة في أحد المسارات",
    description: "حديث مركّز في المسار الأقرب لتخصصك.",
  },
  {
    slug: "workshop",
    title: "ورشة عمل",
    description: "تجربة تطبيقية يتعلّم فيها الحضور بالممارسة.",
  },
  {
    slug: "meetup",
    title: "لقاء مفتوح مع الجمهور",
    description: "حوار قريب وأسئلة مباشرة من الزوار.",
  },
];

export const SPEAKER_STEPS: readonly TitledItem[] = [
  {
    number: "01",
    title: "أرسل طلبك أو ترشيحك",
    description: "عبّئ النموذج؛ الاسم والمنصب والنبذة وطريقة تواصل واحدة تكفي.",
  },
  {
    number: "02",
    title: "يراجعه فريق البرنامج",
    description: "نقرأ كل طلب ونطابقه مع مسارات الحدث وجلساته.",
  },
  {
    number: "03",
    title: "نتواصل لتنسيق الجلسة",
    description: "نتفق معك أو مع المرشَّح على الموضوع والموعد وشكل المشاركة.",
  },
];
