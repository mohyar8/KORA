export interface Person {
  readonly name: string;
  readonly role: string;
}

export interface Subteam {
  readonly id: string;
  readonly name: string;
  readonly teamId: string;
  readonly leader: Person;
  readonly members?: readonly string[];
}

export interface Department {
  readonly id: string;
  readonly name: string;
  readonly accent: "green" | "fuchsia" | "coral" | "navy";
  readonly manager: Person;
  readonly primaryTeamId?: string;
  readonly subteams: readonly Subteam[];
  readonly members?: readonly string[];
}

export const overallLeadership = [
  { role: "قائد كورة", name: "عمر الحربي" },
  { role: "نائب القائد", name: "خالد الجهني" },
] as const satisfies readonly Person[];

export const departments: readonly Department[] = [
  {
    id: "museum-design-department",
    name: "إدارة تصميم الحدث",
    accent: "green",
    manager: { role: "مدير الإدارة", name: "أحمد بخاري" },
    subteams: [
      {
        id: "exhibition-design-subteam",
        name: "فريق تصميم المعرض",
        teamId: "exhibition-design",
        leader: { role: "قائد الفريق", name: "مهند الرحيلي" },
        members: ["محمد بكر", "محمد أبو سمحة", "إلياس إلياس","عمر الذبياني"],
      },
      {
        id: "museum-design-subteam",
        name: "فريق تصميم المتحف",
        teamId: "museum-design",
        leader: { role: "قائدة الفريق", name: "زهرة الحداد" },
        members: ["أريام اليوسف"],
      },
    ],
  },
  {
    id: "marketing-department",
    name: "إدارة التسويق",
    accent: "fuchsia",
    manager: { role: "مدير الإدارة", name: "طارق الحربي" },
    subteams: [
      {
        id: "design-subteam",
        name: "فريق التصميم",
        teamId: "design",
        leader: { role: "قائدة الفريق", name: "فاطمة الأمير" },
        members: ["لجين العتيبي", "لمى النغموش", "دانة العلوان", "شهد العتيبي", "مجد الخليفة"],
      },
      {
        id: "media-subteam",
        name: "فريق التسويق الرقمي ",
        teamId: "media",
        leader: { role: "قائد الفريق", name: "خالد المسلم" },
        members: ["محمد سامي", "حسين اليامي", "عبدالرحمن الجفري", "مشاري الرماح", "محمد النجيمي"],
      },
      {
        id: "field-marketing-subteam",
        name: "فريق التسويق الميداني",
        teamId: "field-marketing",
        leader: { role: "قائدة الفريق", name: "دنيا الغميجان" },
        members: ["هند القاسم", "أروى العامودي", "جنى يعقوب", "فاطمة السبع", "سجايا الحربي", "هند الملحم"],
      },
    ],
  },
  {
    id: "project-management-department",
    name: "إدارة المشروع",
    accent: "green",
    manager: { role: "مدير الإدارة", name: "عمار الهذلي" },
    primaryTeamId: "project-management",
    subteams: [],
  },
  {
    id: "operations-department",
    name: "إدارة العمليات واللوجستيات",
    accent: "fuchsia",
    manager: { role: "مدير الإدارة", name: "أحمد المحمدي" },
    primaryTeamId: "operations-logistics",
    subteams: [],
    members: ["محمد الصقور"],
  },
  {
    id: "relations-resources-department",
    name: "إدارة العلاقات والشراكات والمالية",
    accent: "navy",
    manager: { role: "مدير الإدارة", name: "خالد النجدي" },
    subteams: [
      {
        id: "relations-subteam",
        name: "فريق العلاقات",
        teamId: "relations",
        leader: { role: "قائد الفريق", name: "عبدالله الحوطي" },
        members: ["عبدالله القرني",],
      },
      {
        id: "partnerships-subteam",
        name: "فريق الشراكات",
        teamId: "partnerships",
        leader: { role: "قائدة الفريق", name: "شوق الغامدي" },
        members: ["فاطمة السني","نورة العباد"],
      },
      {
        id: "finance-subteam",
        name: "فريق المالية",
        teamId: "finance",
        leader: { role: "قائد الفريق", name: "سعيد العيد" },
      },
    ],
  },
  {
    id: "technology-department",
    name: "إدارة التقنية",
    accent: "coral",
    manager: { role: "مدير الإدارة", name: "أسامة الغامدي" },
    primaryTeamId: "technical-team",
    subteams: [],
    members: ["محمد يار", "فيصل باعشن", "عمر سليق"],
  },
] as const;
