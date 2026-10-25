# خارطة طريق: رئيسية لكل الجمهور + صفحة المتحدثين

> **للوكلاء الآليين (AI):** نفّذ مرحلة واحدة كاملة قبل التي تليها، باستخدام `superpowers:executing-plans`. الخطوات بصيغة `- [ ]`. اختبارات أساسية فقط (قرار المالك)، والاختبارات الشاملة بعد انتهاء كل المراحل.

**الهدف:** رئيسية محايدة لكل الجمهور، وصفحة `/speakers` بنموذج تقديم أو ترشيح، مع تعميم منظومة النماذج وجعل Turnstile اختياريًا.

**البنية:** منسّق عام `processSubmission` في `src/lib/submissions/` يخدم نموذجي الشركاء والمتحدثين؛ كل نموذج يقدّم «تعريفه» (التحليل، القيم، رابط البريد البديل) واعتمادياته (جدوله، نص إيميله). الواجهة تتشارك أجزاء النموذج من `src/components/forms/` وأقسام الصفحات من `src/components/shared/`.

**التقنيات:** نفس المشروع (Next.js 16.3.5، React 19، Tailwind v4، Zod 4، Neon، Resend، Vitest).

**وثيقة التصميم (ملزمة، وفيها النصوص المعتمدة C1–C4):** [`docs/superpowers/specs/2026-10-25-audiences-and-speakers-design.md`](superpowers/specs/2026-10-25-audiences-and-speakers-design.md)

## قواعد ثابتة
- كل قواعد [`docs/roadmap.md`](roadmap.md) سارية (اقرأ قبل أن تكتب، لا تخترع نصوصًا — انسخها من C1–C4 حرفيًا، lint/test/build قبل كل commit، تحقق بصري 375px و1440px، RTL، لا أسرار في ملفات متتبَّعة).
- اختبارات الشركاء الحالية (24) يجب أن تبقى ناجحة بعد كل مهمة.
- سلوك نموذج الشركاء للمستخدم لا يتغير (عدا Turnstile الاختياري).

## نقاط المراجعة الحرجة
1. **متحدث دولي** يكتب `+44 20 7946 0958` → يُقبل ويُحفظ `+442079460958`. (اختبار 2.1)
2. **ترشيح بلا بريد ولا جوال لكن برابط حساب** → يُقبل؛ و**تقديم ذاتي برابط فقط** → يُرفض برسالة «أضف بريدًا أو رقم جوال للتواصل». (اختبار 2.2)
3. **بيانات المُرشِّح في وضع `self`** (حقول مخفية بقيت بقيم من تبديل الوضع) → تُتجاهل ولا تُحفظ. (اختبار 2.2)
4. **Turnstile بلا مفاتيح على الخادم** → الطلب يمر ولا يُرفض. (اختبار 1.2)
5. **تبديل الوضع بعد تعبئة الحقول** → القيم المكتوبة تبقى. (تحقق يدوي 3.4)

---

## المرحلة 1: تعميم المنظومة وTurnstile الاختياري

### المهمة 1.1: المنسّق العام

**Files:**
- Create: `src/lib/submissions/types.ts`، `src/lib/submissions/process.ts`
- Modify: `src/lib/sponsor/process.ts` (يصبح غلافًا رقيقًا)، `src/lib/sponsor/types.ts`، `src/components/partners/SponsorForm.tsx` (أنواع فقط)

**Interfaces — Produces:**
```ts
// submissions/types.ts
export type FormValues = Record<string, string | string[] | undefined>;
export type SubmissionState =
  | { status: "idle" }
  | { status: "invalid"; fieldErrors: Record<string, string>; values: FormValues }
  | { status: "success"; email?: string }
  | { status: "error-verify"; mailto: string; values: FormValues }
  | { status: "rate-limited"; values: FormValues }
  | { status: "error-send"; mailto: string; values: FormValues };

// submissions/process.ts
export const RATE_LIMIT = { max: 5, windowMs: 3_600_000 } as const;
export interface SubmissionForm<T> {
  parse(fd: FormData): { ok: true; data: T } | { ok: false; fieldErrors: Record<string, string>; values: FormValues };
  readValues(fd: FormData): FormValues;
  buildMailto(values: FormValues, to: string): string;
  successEmail?(data: T): string | undefined;
}
export interface SubmissionDeps<T> {
  verifyCaptcha(token: string | null): Promise<boolean>;
  ipHash: string | null;
  countRecent(ipHash: string, since: Date): Promise<number>;
  save(data: T, ipHash: string | null): Promise<string>;
  markNotified(id: string): Promise<void>;
  notifyTeam(data: T): Promise<void>;
  now(): Date;
  logError(scope: string, error: unknown): void;
  contactEmail: string;
}
export async function processSubmission<T>(fd: FormData, form: SubmissionForm<T>, deps: SubmissionDeps<T>): Promise<SubmissionState>;
```
- `sponsor/process.ts`: `export type SponsorDeps = SubmissionDeps<SponsorRequest>`؛ `processSponsorRequest(fd, deps)` يستدعي `processSubmission` بتعريف الشركاء؛ يعيد تصدير `RATE_LIMIT`.
- `sponsor/types.ts`: `SponsorFormState = SubmissionState`؛ `SponsorFormValues = FormValues`.

- [ ] **الخطوة 1:** انقل منطق `processSponsorRequest` كما هو إلى `processSubmission` (نفس الترتيب ونفس `logError` scopes)، وhoneypot يُقرأ من الحقل `website` داخل المنسّق.
- [ ] **الخطوة 2:** `npm run test` ← 24/24 ناجحة بلا تعديل اختبارات الشركاء (عدا ما يفرضه تغيير الأنواع)؛ `npx tsc --noEmit` نظيف.
- [ ] **الخطوة 3:** commit `refactor(forms): extract generic submission pipeline`.

### المهمة 1.2: Turnstile اختياري

**Files:** Modify: `src/lib/sponsor/turnstile.ts` (يُنقل إلى `src/lib/submissions/turnstile.ts`)، `src/app/partners/actions.ts`؛ Test: `src/lib/submissions/turnstile.test.ts`

**Interfaces — Produces:** `export function captchaVerifier(secret: string | undefined, ip: string | null, fetchImpl?: typeof fetch): (token: string | null) => Promise<boolean>` — بلا `secret` تُرجع دالة تعطي `true` دائمًا؛ وإلا تستدعي `verifyTurnstile`.

- [ ] **الخطوة 1: اختبار فاشل:** `captchaVerifier(undefined, null)("")` ← `true` ولم يُستدعَ `fetchImpl`؛ `captchaVerifier("s", null, fake{success:false})("tok")` ← `false`.
- [ ] **الخطوة 2:** فشل ← **الخطوة 3:** نفّذ وانقل الملف (حدّث المستوردين) ← **الخطوة 4:** نجاح.
- [ ] **الخطوة 5:** `actions.ts` يستخدم `captchaVerifier(process.env.TURNSTILE_SECRET_KEY, ip)`.
- [ ] **الخطوة 6:** lint/test/build ثم commit `feat(forms): make turnstile optional`.

### المهمة 1.3: مستلمو التنبيه المشتركون

**Files:** Create: `src/lib/submissions/recipients.ts`؛ Modify: `src/app/partners/actions.ts`

**Interfaces — Produces:** `export function notifyRecipients(...candidates: (string | undefined)[]): string[]` — أول قائمة غير فارغة (فواصل، قص)، وإلا `[CONTACT_EMAIL]`.

- [ ] **الخطوة 1:** انقل `notifyRecipients` من `actions.ts` إلى الملف الجديد بالتوقيع أعلاه؛ الشركاء: `notifyRecipients(process.env.SPONSOR_NOTIFY_TO)`.
- [ ] **الخطوة 2:** lint/test/build ثم commit `refactor(forms): share notify recipient parsing`.

---

## المرحلة 2: خلفية المتحدثين

### المهمة 2.1: الجوال الدولي

**Files:** Modify: `src/lib/sponsor/phone.ts`، `src/lib/sponsor/phone.test.ts`

**Interfaces — Produces:** `export function normalizeAnyPhone(raw: string): string | null` — سعودي أولًا (`normalizeSaudiPhone`)، وإلا بعد التنظيف نفسه وتحويل `00` في البداية إلى `+`: يطابق `^\+\d{8,15}$` ويُرجع القيمة.

- [ ] **الخطوة 1: اختبار فاشل:** `"+44 20 7946 0958"` ← `"+442079460958"`؛ `"0044 20 7946 0958"` ← `"+442079460958"`؛ `"0512345678"` ← `"+966512345678"`؛ `"12345"` ← `null`.
- [ ] **الخطوة 2–4:** فشل ← نفّذ ← نجاح.
- [ ] **الخطوة 5:** commit `feat(forms): accept international phone numbers`.

### المهمة 2.2: محتوى ومخطط المتحدثين

**Files:**
- Modify: `src/lib/content.ts` (إضافة `SPEAKER_PROFILES`، `SPEAKER_FORMATS`، `SPEAKER_STEPS`، `PARTICIPATE_PATHS` من C2–C3؛ `NAV_LINKS` تضيف `/speakers` بعد `/partners`)
- Create: `src/lib/speakers/schema.ts`، Test: `src/lib/speakers/schema.test.ts`

**Interfaces — Produces:**
```ts
// content.ts
export type SpeakerFormatSlug = "panel" | "talk" | "workshop" | "meetup";
export const SPEAKER_FORMATS: readonly { slug: SpeakerFormatSlug; title: string; description: string }[];
export const SPEAKER_PROFILES: readonly string[];          // 6
export const SPEAKER_STEPS: readonly TitledItem[];          // 3
export const PARTICIPATE_PATHS: readonly { number: string; title: string; description: string; href?: string; cta?: string }[]; // 3 (الثالث بلا href)
// speakers/schema.ts
export type SpeakerMode = "self" | "nominate";
export type SpeakerRequest = {
  mode: SpeakerMode; name: string; role: string; bio: string;
  email?: string; phone?: string; link?: string; topic?: string; track?: string;
  formats: SpeakerFormatSlug[]; nominatorName?: string; nominatorContact?: string;
};
export const SPEAKER_LABELS: Record<string, string>;        // تسميات الإيميل/mailto (وضع nominate كما في C4، و«المُرشِّح» لحقلي المُرشِّح، «الوضع» للوضع)
export function readSpeakerValues(fd: FormData): FormValues;
export function parseSpeakerForm(fd: FormData):
  | { ok: true; data: SpeakerRequest } | { ok: false; fieldErrors: Record<string, string>; values: FormValues };
```
القيود والرسائل من الوثيقة §4 وC4 حرفيًا. في `self`: `nominatorName` و`nominatorContact` يُحذفان من `data` دائمًا. الجوال عبر `normalizeAnyPhone`. الرابط: `z.url({ protocol: /^https?$/ })` ≤ 300. خطأ قاعدة التواصل يوضع على المفتاح `email`.

- [ ] **الخطوة 1: اختبارات فاشلة** (`fd()` كما في اختبارات الشركاء):
  - `self` بالاسم والمنصب والنبذة والجوال فقط ← `ok` والجوال مطبَّع.
  - `self` برابط فقط ← `fieldErrors.email === "أضف بريدًا أو رقم جوال للتواصل"`.
  - `nominate` برابط فقط ← `ok`.
  - `nominate` بلا أي وسيلة ← `fieldErrors.email === "أضف بريد المتحدث أو جواله أو رابط حسابه"`.
  - `self` مع `nominatorName` ← `ok` و`data.nominatorName === undefined`.
  - نبذة من 5 أحرف ← `fieldErrors.bio === "اكتب نبذة قصيرة (10 أحرف على الأقل)"`؛ رابط `"ftp://x"` ← `fieldErrors.link === "اكتب رابطًا صحيحًا يبدأ بـ https://"`.
- [ ] **الخطوة 2–4:** فشل ← نفّذ ← نجاح.
- [ ] **الخطوة 5:** commit `feat(speakers): add content and form schema`.

### المهمة 2.3: الحفظ والإيميل والـAction

**Files:**
- Create: `db/002_speaker_requests.sql` (الأعمدة من §4، `formats text[] not null default '{}'`، `mode text not null`، فهرس `(ip_hash, created_at)`)
- Create: `src/lib/speakers/db.ts`، `src/lib/speakers/email.ts`، `src/lib/speakers/form.ts`، `src/app/speakers/actions.ts`
- Modify: `.env.example` (سطر `SPEAKERS_NOTIFY_TO=` مع تعليق: فارغ ← مستلمو الشركاء)

**Interfaces — Produces:**
```ts
// speakers/form.ts
export const speakerForm: SubmissionForm<SpeakerRequest>;   // buildMailto بموضوع «طلب متحدث — {name}» أو «ترشيح متحدث — {name}»
// speakers/db.ts
export function createSpeakerDbDeps(url: string | undefined): Pick<SubmissionDeps<SpeakerRequest>, "save" | "countRecent" | "markNotified">;
// speakers/email.ts
export function renderSpeakerEmail(req: SpeakerRequest): { subject: string; text: string };
export function speakerReplyTo(req: SpeakerRequest): string | undefined;   // قاعدة §4
export function createSpeakerEmailDeps(cfg: { apiKey?: string; from?: string; teamTo: string[] }): Pick<SubmissionDeps<SpeakerRequest>, "notifyTeam">;
// app/speakers/actions.ts ("use server")
export async function submitSpeakerRequest(prev: SubmissionState, fd: FormData): Promise<SubmissionState>;
```
- عمّم `send` من `sponsor/email.ts` إلى `src/lib/submissions/email.ts`: `createTeamMailer(cfg) => (msg: { subject; text; replyTo? }) => Promise<void>`، واستخدمه في الشركاء والمتحدثين.
- المستلمون: `notifyRecipients(process.env.SPEAKERS_NOTIFY_TO, process.env.SPONSOR_NOTIFY_TO)`.

- [ ] **الخطوة 1:** نفّذ الملفات أعلاه.
- [ ] **الخطوة 2:** `npx tsc --noEmit` نظيف؛ lint/test/build.
- [ ] **الخطوة 3:** commit `feat(speakers): add storage, team email and server action`.

---

## المرحلة 3: الواجهة المشتركة وصفحة المتحدثين

### المهمة 3.1: استخراج أجزاء النماذج

**Files:**
- Create: `src/components/forms/FormParts.tsx` (`Field`، `FieldError`، `Optional`، `describedBy`، `StatusMessage`)، `src/components/forms/useSubmission.ts`
- Modify: `src/components/partners/SponsorForm.tsx`

**Interfaces — Produces:**
```ts
export function useSubmission(action: (prev: SubmissionState, fd: FormData) => Promise<SubmissionState>,
  readValues: (fd: FormData) => FormValues, buildMailto: (v: FormValues, to: string) => string):
  { state: SubmissionState & { nonce: number }; formAction: (fd: FormData) => void; pending: boolean;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void };
```
(يجمع `nonce` والتقاط الخطأ وحارس الإرسال المزدوج الموجودة اليوم في `SponsorForm`.) `Field` يأخذ `name: string`.

- [ ] **الخطوة 1:** استخرج وأعد بناء `SponsorForm` عليها بلا تغيير سلوك أو مظهر.
- [ ] **الخطوة 2:** تحقق يدوي سريع: إرسال `/partners` بحقول فارغة (noValidate) ← نفس رسائل الخطأ.
- [ ] **الخطوة 3:** lint/test/build ثم commit `refactor(forms): share form parts and submission hook`.

### المهمة 3.2: أقسام الصفحات المشتركة

**Files:**
- Create: `src/components/shared/PageHero.tsx`، `src/components/shared/StepsSection.tsx`
- Move: `PartnersStats` ← `src/components/shared/EventStats.tsx`، `DirectContact` ← `src/components/shared/DirectContact.tsx`
- Modify: `PartnersHero.tsx` (يستخدم `PageHero`)، `PartnershipSteps.tsx` (يستخدم `StepsSection`)، `src/app/partners/page.tsx`

**Interfaces — Produces:**
```tsx
PageHero({ id, label, title, body, ctaHref, ctaLabel }: {...all string})
StepsSection({ id, title, steps }: { id: string; title: string; steps: readonly TitledItem[] })
EventStats()   DirectContact()
```
- [ ] **الخطوة 1:** نفّذ النقل بلا تغيير مظهر `/partners` (تحقق بصري 375px).
- [ ] **الخطوة 2:** lint/build ثم commit `refactor(pages): share hero, stats, steps and contact sections`.

### المهمة 3.3: صفحة `/speakers` الثابتة

**Files:** Create: `src/app/speakers/page.tsx`، `src/components/speakers/SpeakerProfiles.tsx`، `src/components/speakers/SpeakerFormats.tsx`؛ Modify: `src/app/sitemap.ts` (priority 0.9)

- [ ] **الخطوة 1:** الترتيب: `PageHero` (C3، `ctaHref="#speaker-request"`) · `EventStats` · `SpeakerProfiles` («من نبحث عنه؟»، شبكة 6 بطاقات بنتاغون ملوّن بالتناوب) · `SpeakerFormats` («أشكال المشاركة»، نفس شكل «أشكال الشراكة») · `StepsSection` («كيف تتم المشاركة؟»، `SPEAKER_STEPS`) · `SpeakerFormSection` (3.4) · `DirectContact`. `metadata` من C3.
- [ ] **الخطوة 2:** تحقق بصري 375 و1440.
- [ ] **الخطوة 3:** lint/build ثم commit `feat(speakers): add speakers page`.

### المهمة 3.4: نموذج المتحدثين

**Files:** Create: `src/components/speakers/SpeakerForm.tsx`، `src/components/speakers/SpeakerFormSection.tsx`؛ Modify: `src/app/globals.css` (`.partners-mode` لزرّي الوضع فقط)

- [ ] **الخطوة 1:** `useSubmission(submitSpeakerRequest, readSpeakerValues, speakerForm.buildMailto)`. الوضع `radio` باسم `mode` بشكل زرّين (`partners-chip`)، حالته في `useState` لتبديل التسميات؛ الحقول تبقى مركّبة عند التبديل (تُخفى حقول المُرشِّح بـ `hidden` في `self`) فتبقى القيم. التسميات والرسائل من C4 والجدول §4. الجوال `dir="ltr"` بلا placeholder سعودي فقط: `+966 5X XXX XXXX`.
- [ ] **الخطوة 2:** النجاح: نص `self` أو `nominate` حسب `values.mode` المرسل (يحمله الغلاف من `fd`).
- [ ] **الخطوة 3: تحقق يدوي** (بدون مفاتيح Turnstile في `.env.local` لاختبار الاختياري): رسائل الأخطاء في الوضعين، تبديل الوضع يحفظ القيم، الإرسال المزدوج طلب واحد، 375 و1440 بلا تمرير أفقي.
- [ ] **الخطوة 4:** lint/test/build ثم commit `feat(speakers): add speaker application and nomination form`.

---

## المرحلة 4: رئيسية لكل الجمهور

### المهمة 4.1: الشريط العلوي والـHero

**Files:** Modify: `src/components/layout/Navbar.tsx`، `src/components/sections/Hero.tsx`، `src/app/globals.css`

- [ ] **الخطوة 1:** الزر «شارك معنا» ← `/#participate` (C1)، والروابط الخمسة من `NAV_LINKS`. تحت 440px: `.topbar-apply { display: none }` والروابط تأخذ العرض كاملًا.
- [ ] **الخطوة 2:** زر الـHero الأساسي «شارك معنا» ← `/#participate`.
- [ ] **الخطوة 3:** تحقق بصري 375 (الروابط الخمسة في سطر بلا قص) و1440.
- [ ] **الخطوة 4:** commit `feat(home): neutral nav and hero calls to action`.

### المهمة 4.2: قسم «شارك في كورة» والدعوة الختامية

**Files:** Create: `src/components/sections/Participate.tsx`؛ Delete: `src/components/sections/SponsorTeaser.tsx`؛ Modify: `src/app/page.tsx`، `src/components/sections/FinalCta.tsx`، `src/lib/content.ts` (حذف `SPONSOR_TEASER`)

- [ ] **الخطوة 1:** `Participate` (`id="participate"`، C2): ثلاث بطاقات من `PARTICIPATE_PATHS`؛ الأولى والثانية زر `Button` بـ `href/cta`، والثالثة `SocialPentagons`. نفس مظهر `SponsorTeaser` الحالي (خلفية `bg-navy-dark kora-grid`). `scroll-mt-20`.
- [ ] **الخطوة 2:** `page.tsx`: `Participate` مكان `SponsorTeaser`. `FinalCta` بنصوص الوثيقة §2.
- [ ] **الخطوة 3:** `grep -rn "SponsorTeaser\|SPONSOR_TEASER\|كن شريكًا" src` ← يظهر «كن شريكًا» فقط في `/partners` و`/teams` إن وُجد.
- [ ] **الخطوة 4:** تحقق بصري، lint/test/build، commit `feat(home): participate section for every audience`.

---

## المرحلة 5: التجربة الفعلية والتوثيق

- [ ] **5.1:** إنشاء جدول `speaker_requests` في Neon من `db/002_speaker_requests.sql`.
- [ ] **5.2:** تجربة واحدة لكل وضع محليًا مع `SPEAKERS_NOTIFY_TO` = إيميل المالك فقط: صف محفوظ، `notified = true`، بلا أخطاء؛ ثم حذف الصفوف التجريبية.
- [ ] **5.3:** تحديث «سجل التقدم» في `docs/roadmap.md` وهذا الملف، وإضافة `SPEAKERS_NOTIFY_TO` لقائمة متغيرات Vercel.

## سجل التقدم

| التاريخ | المرحلة | الحالة | ملاحظات |
|---|---|---|---|
| 2026-10-25 | التخطيط | ✅ | اعتماد الوثيقة وكتابة الخطة |
