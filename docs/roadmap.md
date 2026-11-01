# خارطة طريق كورة: موقع الرعاية والتعريف بالحدث

> **للوكلاء الآليين (AI):** نفّذ هذه الخطة مهمة بمهمة باستخدام `superpowers:subagent-driven-development` (موصى به) أو `superpowers:executing-plans`. الخطوات بصيغة `- [ ]` للتتبّع؛ علّم كل خطوة `- [x]` فور إنجازها وحدّث «سجل التقدم» في آخر الملف.

**الهدف:** تحويل موقع كورة من موقع توظيف أعضاء إلى موقع يقنع الشركات بالرعاية ويستقبل طلباتها، مع بقائه واضحًا للزوار.

**البنية:** الرئيسية `/` للزوار مع قسم يقود الشركات إلى صفحة جديدة `/partners` فيها العرض ونموذج الطلب. النموذج مكوّن عميل يستخدم `useActionState` مع Server Action؛ المنطق كله في دالة نقية `processSponsorRequest` تستقبل اعتماديات قابلة للاستبدال (قاعدة البيانات، الإيميل، Turnstile) لتُختبر بلا خدمات حقيقية.

**التقنيات:** Next.js 16.3.5 (App Router) · React 19.2.8 · Tailwind v4 · motion · Zod · Neon Postgres (`@neondatabase/serverless`) · Resend · Cloudflare Turnstile · Vitest · Vercel.

**وثيقة التصميم (المرجع الملزم):** [`docs/superpowers/specs/2026-10-25-sponsorship-site-design.md`](superpowers/specs/2026-10-25-sponsorship-site-design.md)

---

> **تحديث 2026-10-25 (قرار المالك):** أُلغي إيميل التأكيد للشركات (`confirmToSender` و`renderConfirmationEmail` حُذفا). الإيميل الوحيد هو تنبيه الفريق، ومستلمه `SPONSOR_NOTIFY_TO` إن وُجد وإلا `CONTACT_EMAIL`. بدون توثيق دومين يمكن الإرسال من `onboarding@resend.dev` إلى إيميل حساب Resend فقط. أي ذكر لإيميل الشركة في C9 و5.4 و5.6 و7.2 لم يعد ساريًا.

## قواعد العمل (لمنع الأخطاء والهلوسة)

1. **اقرأ قبل أن تكتب:** في بداية كل جلسة اقرأ هذا الملف، ثم وثيقة التصميم، ثم `AGENTS.md`. قبل كتابة أي كود خاص بـ Next.js اقرأ الدليل المناسب في `node_modules/next/dist/docs/` (للنماذج: `01-app/02-guides/forms.md`؛ للـ Server Actions: `01-app/02-guides/server-actions.md`). هذه النسخة تختلف عن بيانات تدريبك.
2. **لا تخترع محتوى:** كل نص عربي يظهر للمستخدم موجود حرفيًا في قسم «المحتوى المعتمد» أدناه. لا أرقام ولا أسماء شركاء ولا ادعاءات غير موجودة هناك. إن احتجت نصًا غير موجود: توقّف واسأل المالك.
3. **لا تخترع واجهات:** الأسماء والتواقيع في كتل «الواجهات» ملزمة. لا تُعِد تسمية دالة أو حقل.
4. **تحقّق من الواقع:** قبل تعديل ملف اقرأه. إن خالف الكودُ الخطةَ (ملف غير موجود، اسم مختلف) توقّف وأبلغ المالك بدل التخمين.
5. **مهمة واحدة = commit واحد**، وقبل كل commit يجب أن تنجح:
   ```bash
   npm run lint && npm run test && npm run build
   ```
   (قبل المهمة 0.2 لا يوجد `npm run test`؛ استخدم `npm run lint && npm run build`.)
6. **التحقق البصري إلزامي** لكل مهمة تغيّر الواجهة: شغّل `npm run dev`، وخذ لقطة شاشة على عرض 375px وعرض 1440px، وتأكد من عدم وجود تمرير أفقي ولا تداخل نصوص، ومن عدم وجود أخطاء في الـconsole.
7. **الهوية:** استخدم فقط ألوان `@theme` الموجودة في `src/app/globals.css` (`navy`، `navy-dark`، `ink`، `paper`، `coral`، `fuchsia`، `green`) والأنماط الموجودة (`kora-pentagon`، `kora-cut`، `kora-label`، `kora-grid`، `word-mark`). CSS الجديد يُضاف في `globals.css` ببادئة واضحة (`partners-`، `teaser-`، `hero-info`) على نمط الملف الحالي.
8. **RTL وإمكانية الوصول:** كل قسم له `aria-labelledby`، كل حقل له `<label>`، الرسائل الديناميكية داخل `aria-live="polite"`، ولا تكسر `prefers-reduced-motion`.
9. **لا تلمس** فرع `newV` ولا ملفات المعرض ثلاثي الأبعاد ولا مجلد `.serena/`.
10. **الأسرار** في `.env.local` فقط (متجاهل في git). لا تكتب مفتاحًا حقيقيًا في أي ملف متتبَّع.
11. **مهام المالك** (معلَّمة 👤) لا ينفّذها الـAI؛ يجهّز لها التعليمات وينتظر.

## الواجهات المشتركة (مرجع سريع)

| الرمز | الملف | المهمة المنشئة |
|---|---|---|
| `Mark` | `src/components/ui/Mark.tsx` | 1.3 |
| `SECTORS`، `PARTNERSHIP_FORMS`، `SPONSOR_TEASER`، `SPONSOR_REASONS`، `PARTNERSHIP_STEPS`، `PARTNERS`، `Track.sectors` | `src/lib/content.ts` | 1.4 |
| `normalizeSaudiPhone` | `src/lib/sponsor/phone.ts` | 5.1 |
| `parseSponsorForm`، `SponsorRequest`، `SponsorField` | `src/lib/sponsor/schema.ts` | 5.2 |
| `SponsorFormState`، `SponsorFormValues` | `src/lib/sponsor/types.ts` | 5.2 |
| `buildMailto` | `src/lib/sponsor/mailto.ts` | 5.3 |
| `renderTeamEmail`، `renderConfirmationEmail` | `src/lib/sponsor/email.ts` | 5.4 |
| `getClientIp`، `hashIp` | `src/lib/sponsor/ip.ts` | 5.5 |
| `verifyTurnstile` | `src/lib/sponsor/turnstile.ts` | 5.5 |
| `processSponsorRequest`، `SponsorDeps` | `src/lib/sponsor/process.ts` | 5.6 |
| `createDbDeps` | `src/lib/sponsor/db.ts` | 5.7 |
| `createEmailDeps` | `src/lib/sponsor/email.ts` | 5.7 |
| `submitSponsorRequest` | `src/app/partners/actions.ts` | 6.1 |

## نقاط المراجعة الحرجة (Review Focus)

حالات لا تذكرها الوثيقة صراحة لكنها الأرجح أن تؤذي مستخدمًا حقيقيًا. كل سطر له اختبار في المهمة المالكة:

1. **أرقام عربية-هندية في الجوال** (`٠٥١٢٣٤٥٦٧٨`) من لوحات المفاتيح العربية → تُقبل وتُطبَّع إلى `+966512345678`. (اختبار في 5.1)
2. **حقل ممتلئ بمسافات فقط** (اسم شركة `"   "`) → يُرفض كأنه فارغ؛ والبريد بأحرف كبيرة/مسافات → يُقص ويُحوَّل لأحرف صغيرة. (اختبار في 5.2)
3. **Turnstile لا يُحمَّل** (مانع إعلانات أو شبكة جامعية) → الخادم يرفض، لكن المستخدم يرى زر «أرسل عبر البريد» فلا يعلق. (اختبار في 5.6)
4. **مفتاح بيئة ناقص أو خدمة متوقفة** (لا `RESEND_API_KEY` أو Neon نائم) → فشل الاعتمادية يُعامل كفشل خطوة، لا كانهيار للصفحة، ويُطبَّق منطق «يكفي نجاح أحدهما». (اختبار في 5.6)
5. **إرسال مزدوج** (ضغط الزر مرتين) → الزر معطّل أثناء `pending`. (تحقق يدوي في 6.3)

---

## المحتوى المعتمد

كل النصوص التالية تُنسخ حرفيًا. الرموز `{...}` قيم تُستبدل من الكود.

### C1. الشريط العلوي
- `NAV_LINKS`: `{ href: "/#about", label: "عن كورة" }`، `{ href: "/#tracks", label: "المسارات" }`، `{ href: "/teams", label: "الفريق" }`، `{ href: "/partners", label: "الشركاء" }`.
- الزر: «كن شريكًا» ← `/partners`.

### C2. شريط معلومات الـHero
- العناصر: `{EVENT.dates}` · `{EVENT.venueShort}` · «9 مسارات».
- زر ثانوي: «اكتشف المسارات» ← `/#tracks`. زر أساسي: «كن شريكًا» ← `/partners`.

### C3. نص Manifesto الجديد
> تابع {Mark:كورة} واحضر حدثًا جامعيًا يعيد تقديم كرة القدم السعودية ك{Mark coral:صناعة} تجمع الإعلام والتقنية وريادة الأعمال والاستثمار والتجربة.

(العنوان الحالي «لا تكتفِ / بمشاهدة اللعبة. / كن جزءًا مما يصنعها.» يبقى كما هو.)

### C4. قسم «لماذا ترعى كورة» في الرئيسية (`SPONSOR_TEASER`)
- التسمية: «للشركات» · العنوان: «لماذا ترعى كورة؟» · الزر: «اعرف أكثر عن الشراكة» ← `/partners`.

| # | العنوان | الوصف |
|---|---|---|
| 01 | جمهور يصنع المستقبل | أكثر من 20 ألف زائر متوقع من طلبة الجامعات والمهتمين بصناعة الرياضة. |
| 02 | في قلب طموحات 2034 | ارتبط بحدث يواكب طموحات المملكة الرياضية ومستقبل كرة القدم السعودية. |
| 03 | حضور في مسارك | تسعة مسارات متخصصة تتيح لعلامتك الظهور حيث يلتقي قطاعك بجمهوره. |

### C5. الدعوة الختامية (FinalCta)
- العنوان: «كن جزءًا من الصناعة خلف اللعبة»
- النص: «تابع كورة لتعرف كل جديد عن الحدث، أو انضم إلينا شريكًا يصنع التجربة.»
- زر أساسي: «كن شريكًا» ← `/partners` · عنوان صف الأيقونات: «تابع كورة» (أيقونات `SOCIAL_NETWORKS`).

### C6. صفحة الفريق
- `depts-lead`: «تعرّف على الفريق الطلابي الذي يصنع كورة: إدارات وفرق تمسك المكان والتسويق والتخطيط والتشغيل والعلاقات والتقنية.»
- `depts-cta`: النص «تريد أن تكون علامتك جزءًا من كورة؟» والزر «كن شريكًا» ← `/partners`.

### C7. صفحة الشركاء
**metadata:** العنوان `الشراكات والرعاية | كورة`؛ الوصف: «كن شريكًا في كورة: حدث وطني جامعي في جامعة الملك فهد للبترول والمعادن يقدّم كرة القدم السعودية بوصفها صناعة. قدّم طلب شراكة وسيتواصل معك فريقنا.»

**الافتتاحية:** التسمية «الشراكات والرعاية» · العنوان (h1) «علامتك في قلب الصناعة خلف اللعبة» · النص: ««كورة» حدث وطني جامعي في جامعة الملك فهد للبترول والمعادن يقدّم كرة القدم السعودية بوصفها صناعة متكاملة. نبحث عن شركاء يؤمنون بهذه الصناعة ويريدون أن يكونوا جزءًا منها.» · الزر «قدّم طلب شراكة» ← `#request` · سطر صغير: `{EVENT.dates} · {EVENT.venueShort}`.

**بالأرقام:** عنوان القسم «كورة بالأرقام»؛ الخلايا: عناصر `EVENT_FACTS` الثلاثة + خلية نصية قيمتها «KFUPM» وتسميتها «جامعة الملك فهد للبترول والمعادن».

**لماذا كورة؟ (`SPONSOR_REASONS`)** — عنوان القسم «لماذا كورة؟»

| العنوان | الوصف |
|---|---|
| جمهور جامعي شاب | طلبة اليوم هم كفاءات القطاع الرياضي وقادته غدًا، وكورة تضع علامتك أمامهم مباشرة. |
| متصل بطموحات 2034 | حدث يواكب تحوّل الرياضة السعودية وطموحات المملكة نحو 2034. |
| منصة مستمرة | رسالة كورة لا تنتهي بانتهاء الحدث؛ المحتوى الإعلامي والمعرفي يستمر ويستمر معه حضور شركائنا. |
| حضور يناسب قطاعك | اختر المسار الأقرب لنشاطك، من التقنية والإعلام إلى الصحة والاستثمار والهندسة. |

**أين تظهر علامتك؟** — عنوان القسم «أين تظهر علامتك؟»، ونص تمهيدي: «تسعة مسارات، ولكل مسار جمهوره وقطاعاته.» ثم عنوان فرعي «أشكال الشراكة». قيم `Track.sectors` (بترتيب `TRACKS`):

| # | المسار | `sectors` |
|---|---|---|
| 01 | المتحف التاريخي | الثقافة والتراث · الأندية والاتحادات |
| 02 | الإعلام | القنوات والمنصات الرقمية · الإنتاج والإعلان |
| 03 | الاقتصاد والاستثمار | البنوك · الاستثمار والتأمين |
| 04 | ريادة الأعمال | حاضنات الأعمال · رأس المال الجريء |
| 05 | الركن الترفيهي | الألعاب والترفيه · العلامات الاستهلاكية |
| 06 | المسرح الرئيسي | جميع القطاعات |
| 07 | ركن الصحة | المستشفيات والعيادات · التغذية والمكملات |
| 08 | ركن التقنية | الاتصالات · التقنية والذكاء الاصطناعي |
| 09 | ركن الهندسة | الإنشاءات والبنية التحتية · الطاقة والصناعة |

`PARTNERSHIP_FORMS` (slug ثابت يُحفظ في القاعدة):

| slug | العنوان | الوصف |
|---|---|---|
| `track` | رعاية مسار أو ركن | اربط اسم علامتك بأحد المسارات التسعة ومحتواه وتجربة زواره. |
| `main-stage` | رعاية المسرح الرئيسي | حضور على المنصة التي تجمع قادة الأندية والإعلاميين والمستثمرين. |
| `media` | شراكة إعلامية ومحتوى | ظهور في محتوى كورة الرقمي قبل الحدث وأثناءه وبعده. |
| `experience` | تجربة تفاعلية | صمّم تجربة لعلامتك داخل الركن الترفيهي يعيشها الزوار بأنفسهم. |
| `in-kind` | شراكة عينية | ادعم الحدث بمنتجاتك أو خدماتك مقابل حضور يناسب مساهمتك. |

**كيف تتم الشراكة؟ (`PARTNERSHIP_STEPS`)** — عنوان القسم «كيف تتم الشراكة؟»

| # | العنوان | الوصف |
|---|---|---|
| 01 | أرسل طلبك | عبّئ النموذج في أقل من دقيقة؛ اسم الشركة والبريد يكفيان. |
| 02 | نتواصل معك | يتواصل معك فريق الشراكات ويرسل لك ملف الرعاية الكامل. |
| 03 | نصمّم الشراكة معًا | نختار معك شكل الحضور الأنسب لأهداف علامتك. |

**شركاؤنا:** عنوان القسم «شركاؤنا» (يُعرض فقط إذا `PARTNERS.length > 0`).

**تواصل مباشر:** «تفضّل البريد؟ راسلنا على» + رابط `mailto:{CONTACT_EMAIL}`.

### C8. النموذج
- عنوان القسم (`id="request"`): «قدّم طلب شراكة» · تمهيد: «اسم الشركة والبريد يكفيان، وبقية الحقول تساعدنا على تجهيز عرض يناسبكم.»
- `SECTORS`: «اتصالات وتقنية»، «بنوك واستثمار»، «صحة»، «إعلام»، «تجزئة»، «طاقة»، «أخرى».

| name | التسمية | إلزامي | نوع الإدخال |
|---|---|---|---|
| `company` | اسم الشركة | ✅ | `text`، `autocomplete="organization"` |
| `email` | البريد الإلكتروني | ✅ | `email`، `autocomplete="email"`، `dir="ltr"` |
| `contactName` | اسم ممثل الشركة | — | `text`، `autocomplete="name"` |
| `role` | المنصب | — | `text`، `autocomplete="organization-title"` |
| `phone` | رقم الجوال | — | `tel`، `autocomplete="tel"`، `dir="ltr"`، placeholder `05XXXXXXXX` |
| `sector` | القطاع | — | `select` من `SECTORS`، الخيار الأول فارغ «اختر القطاع» |
| `interests` | أشكال الشراكة التي تهمّكم | — | checkboxes من `PARTNERSHIP_FORMS` (القيمة = slug) |
| `track` | مسار مفضّل | — | `select` من `TRACKS` (القيمة = `number`، النص = `title`)، الخيار الأول فارغ «بدون تفضيل» |
| `message` | رسالة | — | `textarea`، 4 أسطر |
| `website` | (مخفي، honeypot) | — | `text`، `tabIndex={-1}`، `autoComplete="off"`، مخفي بصريًا و`aria-hidden` |

- وسم الحقول الاختيارية: «اختياري».
- الزر: «أرسل الطلب»؛ أثناء الإرسال: «جارٍ الإرسال…».
- سطر الخصوصية تحت الزر: «بإرسال الطلب توافق على تواصل فريق كورة معك بخصوص الشراكة، ولن نشارك بياناتك مع أي جهة.»

**رسائل التحقق (من `parseSponsorForm`):**
- `company` فارغ: «اكتب اسم الشركة»
- `email` غير صالح أو فارغ: «اكتب بريدًا إلكترونيًا صحيحًا»
- `phone` غير صالح: «اكتب رقم جوال سعودي صحيح مثل 0512345678»
- أي نص يتجاوز حده: «النص أطول من المسموح»

**حالات النتيجة:**
- نجاح: العنوان «وصلنا طلبك» والنص «شكرًا لاهتمامك بـ«كورة». سيتواصل معك فريق الشراكات قريبًا على {email}.»
- `error-verify`: «تعذّر التحقق من الطلب. أعد المحاولة، أو أرسله عبر البريد.» + زر «أرسل عبر البريد».
- `rate-limited`: «أرسلت عدة طلبات خلال وقت قصير. حاول بعد ساعة أو راسلنا على {CONTACT_EMAIL}.»
- `error-send`: «تعذّر إرسال الطلب الآن. يمكنك إرساله عبر البريد مباشرة وسيصلنا كاملًا.» + زر «أرسل عبر البريد».

### C9. الإيميلات (نص عادي)
- **للفريق:** الموضوع `طلب شراكة جديد — {company}`. الجسم: سطر لكل حقل غير فارغ بالصيغة `التسمية: القيمة` (التسميات من C8؛ `interests` تُعرض بعناوينها من `PARTNERSHIP_FORMS` مفصولة بـ «، »؛ `track` يُعرض `{number} {title}`)، ثم سطر فارغ، ثم `أُرسل من نموذج الشراكات في korakfupm.com`.
- **للشركة:** الموضوع `استلمنا طلب شراكتك مع كورة`. الجسم:
  ```
  مرحبًا {contactName أو "فريق " + company}،

  شكرًا لاهتمامكم بالشراكة مع «كورة – الصناعة خلف اللعبة». استلمنا طلبكم وسيتواصل معكم فريق الشراكات قريبًا.

  للتواصل المباشر: {CONTACT_EMAIL}

  فريق كورة
  ```

---

## المرحلة 0: التجهيز

### المهمة 0.1: فرع العمل وخط الأساس

**Files:** لا تغييرات في الكود.

- [ ] **الخطوة 1:** أنشئ فرع العمل من `V2`:
  ```bash
  git switch V2 && git switch -c sponsorship
  ```
- [ ] **الخطوة 2:** ثبّت الحزم وتأكد أن خط الأساس سليم:
  ```bash
  npm install && npm run lint && npm run build
  ```
  المتوقع: lint بلا أخطاء، والبناء ينتهي بـ `✓ Compiled` ويعرض المسارات `/` و`/teams`. سجّل أي تحذيرات موجودة مسبقًا في «سجل التقدم» حتى لا تُنسب لعملك لاحقًا.
- [ ] **الخطوة 3:** commit لوثائق التخطيط:
  ```bash
  git add docs/roadmap.md docs/superpowers/specs/2026-10-25-sponsorship-site-design.md
  git commit -m "docs: add sponsorship site design spec and roadmap"
  ```

### المهمة 0.2: إعداد Vitest

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/sanity.test.ts` (يُحذف في نهاية المهمة)
- Modify: `package.json` (سكربت `test`)

- [ ] **الخطوة 1:** ثبّت `npm install -D vitest`.
- [ ] **الخطوة 2:** أنشئ `vitest.config.ts` بـ `defineConfig` من `vitest/config`: `test.environment = "node"`، `test.include = ["src/**/*.test.ts"]`، و`resolve.alias` يربط `@` بالمسار المطلق لـ `./src` (عبر `fileURLToPath(new URL("./src", import.meta.url))`).
- [ ] **الخطوة 3:** أضف `"test": "vitest run"` إلى `scripts`.
- [ ] **الخطوة 4:** اختبار تحقق مؤقت `src/lib/sanity.test.ts`:
  ```ts
  import { BRAND } from "@/lib/constants";
  import { expect, test } from "vitest";
  test("alias resolves", () => expect(BRAND.nameAr).toBe("كورة"));
  ```
- [ ] **الخطوة 5:** `npm run test` ← المتوقع: `1 passed`. ثم احذف `sanity.test.ts`.
- [ ] **الخطوة 6:** `npm run lint && npm run build` ثم commit:
  ```bash
  git add vitest.config.ts package.json package-lock.json
  git commit -m "chore: set up vitest"
  ```

---

## المرحلة 1: التنظيف وتجهيز المحتوى

### المهمة 1.1: حذف الكود الميت

**Files:**
- Delete: `src/components/IntroLoader.tsx`، `src/components/ui/BallSegments.tsx`، `src/components/sections/TrackCard.tsx`، `src/components/ui/GeometricField.tsx`، `src/components/ui/PatternBand.tsx`، `src/components/ui/SectionHeading.tsx`
- Modify: `package.json` (إزالة `@splinetool/react-spline`)

- [ ] **الخطوة 1:** قبل الحذف تحقّق أن كل ملف غير مستورد من خارج مجموعة المحذوفات:
  ```bash
  grep -rnE "IntroLoader|BallSegments|TrackCard|GeometricField|PatternBand|SectionHeading" src
  ```
  المتوقع: النتائج داخل الملفات المحذوفة نفسها فقط. إن ظهر استيراد من ملف آخر: توقّف وأبلغ.
- [ ] **الخطوة 2:** احذف الملفات الستة.
- [ ] **الخطوة 3:** `grep -rn "splinetool" src` ← لا نتائج، ثم `npm uninstall @splinetool/react-spline`.
- [ ] **الخطوة 4:** إن أصبح `src/lib/hooks/useIsFinePointer.ts` أو أي ملف في `src/components/motion/` بلا مستورد (`grep` باسمه)، احذفه أيضًا وسجّل ذلك.
- [ ] **الخطوة 5:** `npm run lint && npm run test && npm run build` ثم:
  ```bash
  git add -A src package.json package-lock.json
  git commit -m "chore: remove unused components and spline dependency"
  ```

### المهمة 1.2: إزالة بقايا التوظيف من الثوابت

**Files:**
- Modify: `src/lib/constants.ts` (حذف `APPLY_URL`، `APPLICATION_DEADLINE`)
- Modify: `src/lib/content.ts` (حذف `BENEFITS`، `Benefit`، `ABOUT_PARAGRAPHS`)
- Modify مؤقتًا: `src/components/layout/Navbar.tsx`، `src/components/sections/FinalCta.tsx`، `src/components/sections/Departments.tsx`، `src/components/sections/WhyJoin.tsx`، `src/app/page.tsx`

هذه المهمة تزيل الثوابت وتستبدل كل مرجع لـ `APPLY_URL` بـ `"/partners"` مؤقتًا (الصفحة تُبنى في المرحلة 4؛ النصوص تُحدَّث في المرحلتين 2 و3).

- [ ] **الخطوة 1:** `grep -rnE "APPLY_URL|APPLICATION_DEADLINE|BENEFITS|ABOUT_PARAGRAPHS" src` وسجّل كل موضع.
- [ ] **الخطوة 2:** احذف `WhyJoin` من `src/app/page.tsx` واحذف الملف `src/components/sections/WhyJoin.tsx` (يُستبدل بـ `SponsorTeaser` في 2.3).
- [ ] **الخطوة 3:** في `FinalCta.tsx` احذف كتلة `<dl>` الخاصة بموعد التقديم واستيراد `CalendarClock` و`APPLICATION_DEADLINE`، واجعل `href="/partners"`.
- [ ] **الخطوة 4:** في `Navbar.tsx` و`Departments.tsx` استبدل `APPLY_URL` بـ `"/partners"` وأزل `target="_blank"` و`rel` من تلك الروابط (صارت داخلية)؛ استخدم `Link` من `next/link`.
- [ ] **الخطوة 5:** احذف الثوابت والأنواع من `constants.ts` و`content.ts`.
- [ ] **الخطوة 6:** `grep -rnE "APPLY_URL|APPLICATION_DEADLINE|BENEFITS|ABOUT_PARAGRAPHS|forms.cloud.microsoft" src` ← لا نتائج.
- [ ] **الخطوة 7:** احذف من `globals.css` قواعد `.why-join-section` كلها، ثم تحقّق `grep -rn "why-join" src` ← لا نتائج.
- [ ] **الخطوة 8:** `npm run lint && npm run test && npm run build` ثم commit `refactor: remove recruiting constants and why-join section`.

### المهمة 1.3: توحيد مكوّن `Mark`

**Files:**
- Create: `src/components/ui/Mark.tsx`
- Modify: `src/components/sections/About.tsx`، `src/components/sections/Manifesto.tsx`

**Interfaces — Produces:** `export function Mark({ children, tone = "green" }: { children: string; tone?: "green" | "coral" }): JSX.Element` يُرجع `<em className="word-mark">` أو `"word-mark word-mark-coral"` (نفس السلوك الحالي حرفيًا).

- [ ] **الخطوة 1:** أنشئ `Mark.tsx` بنقل التعريف الموجود في `About.tsx`.
- [ ] **الخطوة 2:** احذف التعريفين المحليين واستورد `Mark` من `@/components/ui/Mark` في الملفين.
- [ ] **الخطوة 3:** `grep -rn "function Mark" src` ← نتيجة واحدة فقط.
- [ ] **الخطوة 4:** تحقق بصري: قسما Manifesto وAbout مطابقان لما قبل التغيير.
- [ ] **الخطوة 5:** lint/test/build ثم commit `refactor: share Mark component`.

### المهمة 1.4: بيانات المحتوى الجديدة

**Files:**
- Modify: `src/lib/content.ts`
- Test: `src/lib/content.test.ts`

**Interfaces — Produces (في `content.ts`):**
```ts
export const SECTORS: readonly string[];                // C8، بالترتيب
export interface PartnershipForm { slug: PartnershipFormSlug; title: string; description: string }
export type PartnershipFormSlug = "track" | "main-stage" | "media" | "experience" | "in-kind";
export const PARTNERSHIP_FORMS: readonly PartnershipForm[];   // C7
export interface TitledItem { number: string; title: string; description: string }
export const SPONSOR_TEASER: readonly TitledItem[];     // C4
export const SPONSOR_REASONS: readonly Omit<TitledItem, "number">[]; // C7
export const PARTNERSHIP_STEPS: readonly TitledItem[];  // C7
export interface Partner { name: string; logo: string; href?: string }
export const PARTNERS: readonly Partner[] = [];
// Track: يُضاف الحقل  sectors: readonly string[]   (C7)
// NAV_LINKS: تُضاف { href: "/partners", label: "الشركاء" } في آخرها (C1)
```

- [ ] **الخطوة 1: اختبار فاشل** `src/lib/content.test.ts`:
  ```ts
  test("every track has at least one sector", () =>
    expect(TRACKS.every((t) => t.sectors.length > 0)).toBe(true));
  test("partnership form slugs are unique", () =>
    expect(new Set(PARTNERSHIP_FORMS.map((f) => f.slug)).size).toBe(5));
  test("sectors list matches spec", () =>
    expect(SECTORS).toEqual(["اتصالات وتقنية","بنوك واستثمار","صحة","إعلام","تجزئة","طاقة","أخرى"]));
  test("teaser, reasons and steps have the agreed counts", () => {
    expect(SPONSOR_TEASER).toHaveLength(3);
    expect(SPONSOR_REASONS).toHaveLength(4);
    expect(PARTNERSHIP_STEPS).toHaveLength(3);
  });
  test("partners start empty", () => expect(PARTNERS).toHaveLength(0));
  test("nav includes partners", () =>
    expect(NAV_LINKS.map((l) => l.href)).toContain("/partners"));
  ```
- [ ] **الخطوة 2:** `npm run test` ← فشل (الرموز غير معرّفة).
- [ ] **الخطوة 3:** أضف الرموز والنصوص حرفيًا من C1 وC4 وC7 وC8.
- [ ] **الخطوة 4:** `npm run test` ← كل الاختبارات تنجح.
- [ ] **الخطوة 5:** lint/build ثم commit `feat: add sponsorship content data`.

### المهمة 1.5: إصلاحات محتوى صغيرة

**Files:**
- Modify: `src/components/sections/Departments.tsx`، `src/components/sections/EventFacts.tsx`

- [ ] **الخطوة 1:** في `Departments.tsx` اعرض كتلة قائد الفريق فقط إذا `team.leader && team.leader.name.trim() !== ""` (قائدة فريق العمليات للطالبات اسمها فارغ حاليًا فتظهر كتلة فارغة).
- [ ] **الخطوة 2:** في `EventFacts.tsx` استبدل النص المكتوب يدويًا بـ `{EVENT.venueLong}`.
- [ ] **الخطوة 3:** تحقق بصري لصفحة `/teams` (تبويب العمليات) وقسم «حجم الحدث».
- [ ] **الخطوة 4:** lint/test/build ثم commit `fix: hide empty team leaders and reuse venue constant`.

---

## المرحلة 2: الصفحة الرئيسية

### المهمة 2.1: الشريط العلوي

**Files:** Modify: `src/components/layout/Navbar.tsx`، `src/app/globals.css`

- [ ] **الخطوة 1:** الزر `topbar-apply` يصبح `Link` بنص «كن شريكًا» ← `/partners` (C1). الروابط تأتي من `NAV_LINKS` (أربعة الآن).
- [ ] **الخطوة 2:** أداء: حدّث شريط التقدم عبر `ref` وتعديل `style.width` مباشرة داخل `requestAnimationFrame` بدل `useState`، حتى لا يعاد رسم المكوّن مع كل تمرير.
- [ ] **الخطوة 3:** في `@media (max-width: 820px)` اجعل `.topbar-links a { font-size: 11px; }` ليتسع للروابط الأربعة.
- [ ] **الخطوة 4:** تحقق بصري على 375px و1440px: الروابط الأربعة والزر في سطر واحد بلا قص. أثناء التمرير يتحرك شريط التقدم بسلاسة.
- [ ] **الخطوة 5:** lint/test/build ثم commit `feat(nav): add partners link and become-a-partner CTA`.

### المهمة 2.2: شريط معلومات الـHero

**Files:** Modify: `src/components/sections/Hero.tsx`، `src/app/globals.css`

- [ ] **الخطوة 1:** احذف من `globals.css` القواعد غير المستخدمة: `.hero-copy`، `.hero-lead`، `.hero-deck`، `.hero-scroll`، `.hero-facts`، `.hero-apply` (تحقّق أولًا `grep -rn "hero-copy\|hero-facts\|hero-lead\|hero-deck\|hero-scroll\|hero-apply" src/components` ← لا نتائج). انتبه: `.hero-scroll` و`.hero-facts span` مذكوران أيضًا في قاعدة الخط mono المجمّعة؛ احذفهما من المحدِّد فقط.
- [ ] **الخطوة 2:** أضف داخل `.hero-stage` عنصر `<div className="hero-info">` (بعد `hero-crest-anchor`) يحتوي `<p>` بالعناصر الثلاثة من C2 مفصولة بـ `·`، والزرين: `Button` بـ `variant="secondary"` لـ «اكتشف المسارات» و`variant="primary"` لـ «كن شريكًا».
- [ ] **الخطوة 3:** CSS `.hero-info`: `position: absolute; inset-inline: 0; bottom: 0; z-index: 5;` شبكة بعمودين (النص ثم الأزرار) على الحاسب وعمود واحد على الشاشات ≤ 820px، خلفية `rgb(14 20 53 / 82%)` مع `border-top: 1px solid rgb(236 239 245 / 18%)`، وحركة دخول `animation: hero-late-in .7s 4s cubic-bezier(.16,1,.3,1) both;` (نفس توقيت الشعار).
- [ ] **الخطوة 4:** تحقق بصري على 375×667 و375×812 و1440×900: الشريط لا يغطي الكلمة «كورة» ولا الكرة. إن غطّاها على 375×667 خفّض `.hero-crest-anchor` (عدّل `top` في media query الـportrait) وأعد التحقق.
- [ ] **الخطوة 5:** تحقق بـ `prefers-reduced-motion` (عبر DevTools ← Rendering): الشريط ظاهر فورًا.
- [ ] **الخطوة 6:** lint/test/build ثم commit `feat(hero): add visible event info bar with CTAs`.

### المهمة 2.3: Manifesto وقسم «لماذا ترعى كورة»

**Files:**
- Modify: `src/components/sections/Manifesto.tsx`
- Create: `src/components/sections/SponsorTeaser.tsx`
- Modify: `src/app/page.tsx`، `src/app/globals.css`

- [ ] **الخطوة 1:** استبدل نص `manifesto-body` بنص C3 مستخدمًا `Mark`.
- [ ] **الخطوة 2:** أنشئ `SponsorTeaser` (مكوّن خادم) يعرض C4 من `SPONSOR_TEASER`: `section` بـ `aria-labelledby="sponsor-teaser-heading"`، التسمية بـ `kora-label text-coral`، العنوان h2، قائمة `Stagger as="ul"` بثلاثة عناصر (الرقم، بنتاغون ملوّن بالتناوب coral/fuchsia/green، العنوان h3، الوصف)، ثم `Button href="/partners"`.
- [ ] **الخطوة 3:** الخلفية: `bg-navy-dark` مع `kora-grid` وحد علوي `border-paper/15` (قسم داكن بدل الفاتح القديم ليتسق مع الأقسام المجاورة).
- [ ] **الخطوة 4:** في `page.tsx` الترتيب: `Hero` · `Manifesto` · `About` · `Tracks` · `EventFacts` · `SponsorTeaser` · `FinalCta`.
- [ ] **الخطوة 5:** تحقق بصري على العرضين.
- [ ] **الخطوة 6:** lint/test/build ثم commit `feat(home): add sponsor teaser and update manifesto copy`.

### المهمة 2.4: الدعوة الختامية

**Files:** Modify: `src/components/sections/FinalCta.tsx`

- [ ] **الخطوة 1:** العنوان والنص والزر من C5.
- [ ] **الخطوة 2:** تحت الزر صف «تابع كورة» يعرض `SOCIAL_NETWORKS` بنفس أسلوب أيقونات `manifesto-social` (أعد استخدام الأصناف الموجودة؛ لا تكرر CSS).
- [ ] **الخطوة 3:** تحقق بصري، وأن روابط التواصل تفتح في تبويب جديد بـ `rel="noopener noreferrer"`.
- [ ] **الخطوة 4:** lint/test/build ثم commit `feat(home): rework final CTA for partners and followers`.

### المهمة 2.5: الـmetadata والتحليلات

**Files:** Modify: `src/app/layout.tsx`، `src/app/sitemap.ts`

- [ ] **الخطوة 1:** `description` في `layout.tsx`: «كورة: الصناعة خلف اللعبة. حدث وطني جامعي في جامعة الملك فهد للبترول والمعادن يستكشف كرة القدم السعودية بوصفها صناعة متكاملة، عبر تسعة مسارات من المتحف التاريخي إلى التقنية والاستثمار.»
- [ ] **الخطوة 2:** أضف `<Analytics />` من `@vercel/analytics/next` داخل `<body>` بعد `<Footer />`.
- [ ] **الخطوة 3:** أضف إلى `sitemap.ts` مدخل `${SITE_URL}/partners` بـ `changeFrequency: "weekly"` و`priority: 0.9`.
- [ ] **الخطوة 4:** lint/test/build ثم commit `feat: update site description, add analytics and partners to sitemap`.

---

## المرحلة 3: صفحة الفريق

### المهمة 3.1: تحويل الدعوة إلى شراكة

**Files:** Modify: `src/components/sections/Departments.tsx`

- [ ] **الخطوة 1:** نص `depts-lead` ونص وزر `depts-cta` من C6 (الزر `Link` إلى `/partners`).
- [ ] **الخطوة 2:** `grep -rn "انضم للفريق" src` ← لا نتائج.
- [ ] **الخطوة 3:** تحقق بصري لـ `/teams` على العرضين.
- [ ] **الخطوة 4:** lint/test/build ثم commit `feat(teams): point CTA to partnerships`.

---

## المرحلة 4: صفحة الشركاء (المحتوى الثابت)

كل مكوّن في ملف مستقل داخل `src/components/partners/`، مكوّن خادم ما لم يُذكر غير ذلك، ويقرأ بياناته من `content.ts`/`constants.ts` فقط. يُستخدم `Reveal`/`Stagger` الموجودان للحركة.

### المهمة 4.1: هيكل الصفحة والافتتاحية

**Files:**
- Create: `src/app/partners/page.tsx`
- Create: `src/components/partners/PartnersHero.tsx`
- Modify: `src/app/globals.css`

- [ ] **الخطوة 1:** `page.tsx` يصدّر `metadata` من C7 ويعرض المكوّنات بالترتيب (يُضاف كل مكوّن في مهمته): `PartnersHero` · `PartnersStats` · `WhyKora` · `Placements` · `PartnershipSteps` · `SponsorFormSection` · `PartnersLogos` · `DirectContact`.
- [ ] **الخطوة 2:** `PartnersHero`: نصوص الافتتاحية من C7، h1 واحد في الصفحة، زر `Button href="#request"` بنص «قدّم طلب شراكة» و`showArrow={false}`. الخلفية `bg-ink` مع خطوط ملعب خفيفة (أعد استخدام `kora-grid`) وبنتاغون coral زخرفي `aria-hidden`. `padding-top` يراعي ارتفاع الشريط العلوي (70px على الحاسب و58px على الجوال).
- [ ] **الخطوة 3:** تحقق بصري: `/partners` يعمل والرابط في الشريط العلوي يوصل إليه.
- [ ] **الخطوة 4:** lint/test/build ثم commit `feat(partners): add page shell and hero`.

### المهمة 4.2: بالأرقام ولماذا كورة

**Files:** Create: `src/components/partners/PartnersStats.tsx`، `src/components/partners/WhyKora.tsx`

- [ ] **الخطوة 1:** `PartnersStats`: عنوان «كورة بالأرقام»، أربع خلايا (3 من `EVENT_FACTS` بـ `AnimatedNumber` + خلية «KFUPM»)، على الحاسب 4 أعمدة وعلى الجوال عمودان.
- [ ] **الخطوة 2:** `WhyKora`: عنوان «لماذا كورة؟» وأربع بطاقات من `SPONSOR_REASONS` (عمودان على الحاسب، عمود على الجوال)، كل بطاقة ببنتاغون بلون متناوب.
- [ ] **الخطوة 3:** تحقق بصري.
- [ ] **الخطوة 4:** lint/test/build ثم commit `feat(partners): add stats and reasons sections`.

### المهمة 4.3: أين تظهر علامتك

**Files:** Create: `src/components/partners/Placements.tsx`

- [ ] **الخطوة 1:** عنوان «أين تظهر علامتك؟» والتمهيد من C7، ثم شبكة المسارات التسعة: لكل مسار رقمه، أيقونة `track.icon`، العنوان، و`sectors` كوسوم صغيرة (نفس أسلوب `.depts-card li`). اللون من `ACCENT_STYLES[track.accent]`. ثلاثة أعمدة على الحاسب، عمودان على اللوحي، عمود على الجوال.
- [ ] **الخطوة 2:** عنوان فرعي «أشكال الشراكة» وقائمة `PARTNERSHIP_FORMS` (عنوان + وصف) بلا أي أسعار.
- [ ] **الخطوة 3:** تحقق بصري، وأن الوسوم تلتف بلا تجاوز للبطاقة على 375px.
- [ ] **الخطوة 4:** lint/test/build ثم commit `feat(partners): add tracks placement grid and partnership forms`.

### المهمة 4.4: كيف تتم الشراكة، الشركاء، التواصل المباشر

**Files:** Create: `src/components/partners/PartnershipSteps.tsx`، `src/components/partners/PartnersLogos.tsx`، `src/components/partners/DirectContact.tsx`

- [ ] **الخطوة 1:** `PartnershipSteps`: ثلاث خطوات من `PARTNERSHIP_STEPS` كقائمة مرقّمة `<ol>` بخط واصل بينها على الحاسب.
- [ ] **الخطوة 2:** `PartnersLogos`: يُرجع `null` إذا `PARTNERS.length === 0`؛ وإلا شبكة شعارات `next/image` بـ `alt={partner.name}`، والرابط إن وُجد يفتح في تبويب جديد.
- [ ] **الخطوة 3:** `DirectContact`: سطر C7 مع رابط `mailto:`.
- [ ] **الخطوة 4:** تحقق: مؤقتًا أضف شريكًا وهميًا محليًا لرؤية الشبكة ثم أزله قبل الـcommit (`grep -n "PARTNERS" src/lib/content.ts` يُظهر مصفوفة فارغة).
- [ ] **الخطوة 5:** lint/test/build ثم commit `feat(partners): add steps, partner logos and direct contact`.

---

## المرحلة 5: منطق النموذج (TDD، بلا واجهة)

كل الملفات في `src/lib/sponsor/`. الاختبارات بجانب ملفاتها بلاحقة `.test.ts`. لا شيء هنا يستورد من `next/*`.

### المهمة 5.1: تطبيع رقم الجوال

**Files:** Create: `src/lib/sponsor/phone.ts`، Test: `src/lib/sponsor/phone.test.ts`

**Interfaces — Produces:** `export function normalizeSaudiPhone(raw: string): string | null` ← يُرجع `+9665XXXXXXXX` أو `null`.

- [ ] **الخطوة 1: اختبار فاشل:**
  ```ts
  test.each([
    ["0512345678", "+966512345678"],
    ["+966512345678", "+966512345678"],
    ["00966512345678", "+966512345678"],
    ["966512345678", "+966512345678"],
    ["051 234 5678", "+966512345678"],
    ["051-234-5678", "+966512345678"],
    ["٠٥١٢٣٤٥٦٧٨", "+966512345678"],
  ])("normalizes %s", (raw, out) => expect(normalizeSaudiPhone(raw)).toBe(out));
  test.each(["0412345678", "05123", "abc", "", "+9715123456789"])(
    "rejects %s", (raw) => expect(normalizeSaudiPhone(raw)).toBeNull());
  ```
- [ ] **الخطوة 2:** `npx vitest run src/lib/sponsor/phone.test.ts` ← فشل.
- [ ] **الخطوة 3:** التنفيذ: حوّل الأرقام العربية-الهندية (U+0660–U+0669) والفارسية (U+06F0–U+06F9) إلى لاتينية، احذف المسافات والشرطات والأقواس، ثم طابق `^(?:\+?966|00966|0)(5\d{8})$` وأرجع `"+966" + group1`.
- [ ] **الخطوة 4:** الاختبار ينجح.
- [ ] **الخطوة 5:** commit `feat(sponsor): add Saudi phone normalizer`.

### المهمة 5.2: مخطط التحقق وأنواع الحالة

**Files:** Create: `src/lib/sponsor/schema.ts`، `src/lib/sponsor/types.ts`، Test: `src/lib/sponsor/schema.test.ts`

- [ ] **الخطوة 0:** `npm install zod`، وسجّل الإصدار المثبّت. اقرأ `node_modules/zod/package.json` لمعرفة الإصدار الرئيسي، واستخدم واجهة ذلك الإصدار (في v4: `z.email()` و`error` بدل `message`).

**Interfaces — Produces:**
```ts
// types.ts
export type SponsorField = "company" | "email" | "contactName" | "role" | "phone"
  | "sector" | "interests" | "track" | "message";
export type SponsorFormValues = Partial<Record<Exclude<SponsorField, "interests">, string>> & { interests?: string[] };
export type SponsorFormState =
  | { status: "idle" }
  | { status: "invalid"; fieldErrors: Partial<Record<SponsorField, string>>; values: SponsorFormValues }
  | { status: "success"; email: string }
  | { status: "error-verify"; mailto: string; values: SponsorFormValues }
  | { status: "rate-limited"; values: SponsorFormValues }
  | { status: "error-send"; mailto: string; values: SponsorFormValues };

// schema.ts
export type SponsorRequest = {
  company: string; email: string; contactName?: string; role?: string; phone?: string;
  sector?: (typeof SECTORS)[number]; interests: PartnershipFormSlug[]; track?: string; message?: string;
};
export function readSponsorValues(formData: FormData): SponsorFormValues;
export function isHoneypotFilled(formData: FormData): boolean;   // الحقل "website"
export function parseSponsorForm(formData: FormData):
  | { ok: true; data: SponsorRequest }
  | { ok: false; fieldErrors: Partial<Record<SponsorField, string>>; values: SponsorFormValues };
```
القيود: `company` 2–120 بعد القص؛ `email` ≤ 200 يُقص ويُحوَّل لأحرف صغيرة؛ `contactName` و`role` ≤ 120؛ `message` ≤ 2000؛ `phone` يمر عبر `normalizeSaudiPhone`؛ `sector` من `SECTORS`؛ كل عنصر في `interests` من slugs `PARTNERSHIP_FORMS` (تُحذف المكررات)؛ `track` من أرقام `TRACKS`. السلسلة الفارغة بعد القص = غير موجود. الرسائل من C8.

- [ ] **الخطوة 1: اختبارات فاشلة** (ابنِ `FormData` بدالة مساعدة `fd(obj)` داخل ملف الاختبار):
  ```ts
  test("only company and email are required", () => {
    const r = parseSponsorForm(fd({ company: "شركة س", email: "a@b.co" }));
    expect(r).toEqual({ ok: true, data: { company: "شركة س", email: "a@b.co", interests: [] } });
  });
  test("whitespace-only company is rejected", () => {
    const r = parseSponsorForm(fd({ company: "   ", email: "a@b.co" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.fieldErrors.company).toBe("اكتب اسم الشركة");
  });
  test("email is trimmed and lowercased", () => {
    const r = parseSponsorForm(fd({ company: "شركة", email: "  A@B.CO " }));
    expect(r.ok && r.data.email).toBe("a@b.co");
  });
  test("one-letter company is too short", () => {
    const r = parseSponsorForm(fd({ company: "س", email: "a@b.co" }));
    expect(!r.ok && r.fieldErrors.company).toBe("اكتب اسم الشركة");
  });
  test("invalid email message", () => {
    const r = parseSponsorForm(fd({ company: "شركة", email: "nope" }));
    expect(!r.ok && r.fieldErrors.email).toBe("اكتب بريدًا إلكترونيًا صحيحًا");
  });
  test("phone is normalized when given and rejected when invalid", () => {
    const ok = parseSponsorForm(fd({ company: "شركة", email: "a@b.co", phone: "٠٥١٢٣٤٥٦٧٨" }));
    expect(ok.ok && ok.data.phone).toBe("+966512345678");
    const bad = parseSponsorForm(fd({ company: "شركة", email: "a@b.co", phone: "123" }));
    expect(!bad.ok && bad.fieldErrors.phone).toBe("اكتب رقم جوال سعودي صحيح مثل 0512345678");
  });
  test("unknown sector, interest or track is rejected", () => {
    const r = parseSponsorForm(fd({ company: "شركة", email: "a@b.co", sector: "x", interests: ["hack"], track: "99" }));
    expect(r.ok).toBe(false);
  });
  test("duplicate interests are collapsed", () => {
    const r = parseSponsorForm(fd({ company: "شركة", email: "a@b.co", interests: ["media", "media"] }));
    expect(r.ok && r.data.interests).toEqual(["media"]);
  });
  test("over-long message uses the length message", () => {
    const r = parseSponsorForm(fd({ company: "شركة", email: "a@b.co", message: "x".repeat(2001) }));
    expect(!r.ok && r.fieldErrors.message).toBe("النص أطول من المسموح");
  });
  test("invalid result keeps the submitted values", () => {
    const r = parseSponsorForm(fd({ company: "", email: "a@b.co", role: "مدير" }));
    expect(!r.ok && r.values.role).toBe("مدير");
  });
  test("honeypot detection", () => {
    expect(isHoneypotFilled(fd({ website: "spam.com" }))).toBe(true);
    expect(isHoneypotFilled(fd({ website: "" }))).toBe(false);
  });
  ```
- [ ] **الخطوة 2:** `npx vitest run src/lib/sponsor/schema.test.ts` ← فشل.
- [ ] **الخطوة 3:** نفّذ `types.ts` و`schema.ts` (`interests` تُقرأ بـ `formData.getAll("interests")`).
- [ ] **الخطوة 4:** الاختبارات تنجح.
- [ ] **الخطوة 5:** commit `feat(sponsor): add form schema and state types`.

### المهمة 5.3: رابط البريد البديل

**Files:** Create: `src/lib/sponsor/mailto.ts`، Test: `src/lib/sponsor/mailto.test.ts`

**Interfaces — Produces:** `export function buildMailto(values: SponsorFormValues, to: string): string`

- [ ] **الخطوة 1: اختبار فاشل:**
  ```ts
  test("builds an encoded mailto with subject and labelled body", () => {
    const url = buildMailto({ company: "شركة س", email: "a@b.co", interests: ["media"] }, "x@y.sa");
    expect(url.startsWith("mailto:x@y.sa?subject=")).toBe(true);
    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("subject")).toBe("طلب شراكة — شركة س");
    expect(params.get("body")).toContain("اسم الشركة: شركة س");
    expect(params.get("body")).toContain("أشكال الشراكة التي تهمّكم: شراكة إعلامية ومحتوى");
  });
  test("works with empty values", () =>
    expect(new URLSearchParams(buildMailto({}, "x@y.sa").split("?")[1]).get("subject")).toBe("طلب شراكة"));
  ```
- [ ] **الخطوة 2:** فشل ← **الخطوة 3:** نفّذ بـ `encodeURIComponent` للموضوع والجسم (السطور بـ `\n`)، والتسميات من C8. ضع خريطة التسميات `FIELD_LABELS: Record<SponsorField, string>` في `schema.ts` وصدّرها، لأن `email.ts` يستخدمها أيضًا ← **الخطوة 4:** نجاح.
- [ ] **الخطوة 5:** commit `feat(sponsor): add mailto fallback builder`.

### المهمة 5.4: نصوص الإيميلات

**Files:** Create: `src/lib/sponsor/email.ts`، Test: `src/lib/sponsor/email.test.ts`

**Interfaces — Produces:**
```ts
export function renderTeamEmail(req: SponsorRequest): { subject: string; text: string };
export function renderConfirmationEmail(req: SponsorRequest): { subject: string; text: string };
```

- [ ] **الخطوة 1: اختبارات فاشلة:** الموضوعان حرفيًا من C9. جسم إيميل الفريق يحتوي `البريد الإلكتروني: a@b.co`، ولا يحتوي تسمية لحقل غير معبّأ (مثلًا لا يحتوي `المنصب:` إن لم يُرسل `role`)، و`track: "08"` يظهر `مسار مفضّل: 08 ركن التقنية`. إيميل التأكيد يبدأ بـ `مرحبًا أحمد،` عند `contactName: "أحمد"` وبـ `مرحبًا فريق شركة س،` بدونه، ويحتوي `CONTACT_EMAIL`.
- [ ] **الخطوة 2:** فشل ← **الخطوة 3:** نفّذ ← **الخطوة 4:** نجاح.
- [ ] **الخطوة 5:** commit `feat(sponsor): add email templates`.

### المهمة 5.5: عنوان IP وTurnstile

**Files:** Create: `src/lib/sponsor/ip.ts`، `src/lib/sponsor/turnstile.ts`، Test: `src/lib/sponsor/ip.test.ts`، `src/lib/sponsor/turnstile.test.ts`

**Interfaces — Produces:**
```ts
export function getClientIp(headers: Headers): string | null;   // أول قيمة في x-forwarded-for، وإلا x-real-ip، وإلا null
export function hashIp(ip: string, salt: string): string;       // sha256(salt + ip) hex عبر node:crypto
export async function verifyTurnstile(token: string | null, ip: string | null, secret: string,
  fetchImpl: typeof fetch = fetch): Promise<boolean>;
```
`verifyTurnstile` يرسل `POST` إلى `https://challenges.cloudflare.com/turnstile/v0/siteverify` بجسم `FormData` فيه `secret` و`response` و`remoteip` (إن وُجد)، ويُرجع `json.success === true`. يُرجع `false` بلا طلب إذا كان الرمز فارغًا، و`false` إذا رمى `fetch` أو كانت الاستجابة غير `ok`.

- [ ] **الخطوة 1: اختبارات فاشلة:**
  - `getClientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))` ← `"1.2.3.4"`؛ مع `x-real-ip` فقط ← قيمته؛ بلا ترويسات ← `null`.
  - `hashIp("1.2.3.4","s")` بطول 64، وثابت للمدخلات نفسها، ومختلف لملح مختلف.
  - `verifyTurnstile` مع `fetchImpl` وهمي يُرجع `{ success: true }` ← `true`؛ مع `{ success: false }` ← `false`؛ رمز `null` ← `false` ولم يُستدعَ `fetchImpl`؛ `fetchImpl` يرمي ← `false`.
- [ ] **الخطوة 2:** فشل ← **الخطوة 3:** نفّذ ← **الخطوة 4:** نجاح.
- [ ] **الخطوة 5:** commit `feat(sponsor): add ip hashing and turnstile verification`.

### المهمة 5.6: منسّق الطلب `processSponsorRequest`

**Files:** Create: `src/lib/sponsor/process.ts`، Test: `src/lib/sponsor/process.test.ts`

**Interfaces:**
- Consumes: `parseSponsorForm`، `isHoneypotFilled`، `readSponsorValues` (5.2)، `buildMailto` (5.3).
- Produces:
```ts
export const RATE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 } as const;
export interface SponsorDeps {
  verifyCaptcha(token: string | null): Promise<boolean>;
  ipHash: string | null;
  countRecent(ipHash: string, since: Date): Promise<number>;
  save(req: SponsorRequest, ipHash: string | null): Promise<string>;   // يُرجع id
  markNotified(id: string): Promise<void>;
  notifyTeam(req: SponsorRequest): Promise<void>;
  confirmToSender(req: SponsorRequest): Promise<void>;
  now(): Date;
  logError(scope: string, error: unknown): void;
  contactEmail: string;
}
export async function processSponsorRequest(formData: FormData, deps: SponsorDeps): Promise<SponsorFormState>;
```

**الترتيب الملزم:**
1. honeypot ممتلئ ← `{ status: "success", email: <البريد المُدخل أو ""> }` بلا أي استدعاء آخر.
2. `parseSponsorForm` فاشل ← `invalid`.
3. `verifyCaptcha(formData.get("cf-turnstile-response"))` ← `false` ← `error-verify` مع `mailto`.
4. إن وُجد `ipHash`: `countRecent(ipHash, now - windowMs) >= max` ← `rate-limited`. إن رمى `countRecent` ← `logError("rate-limit", e)` وتابع.
5. `save` ← `id` أو `null` (مع `logError("save", e)`).
6. `notifyTeam` ← `notified` true/false (مع `logError("notify", e)`).
7. إن `id && notified` ← `markNotified(id)` (أي خطأ يُسجَّل فقط).
8. إن `!id && !notified` ← `error-send` مع `mailto` (ولا يُرسل تأكيد).
9. وإلا ← `confirmToSender` (أي خطأ يُسجَّل فقط) ثم `success` مع `email`.

- [ ] **الخطوة 1: اختبارات فاشلة** باعتماديات وهمية `makeDeps(overrides)` من `vi.fn()` (افتراضيًا كلها تنجح، `countRecent` يُرجع 0، `save` يُرجع `"id-1"`، `ipHash: "h"`):
  - `honeypot → success without saving`: `save` و`notifyTeam` لم يُستدعيا.
  - `invalid input → invalid state, captcha not called`.
  - `captcha failure → error-verify with mailto, nothing saved` (هذا يغطي سيناريو Turnstile المحجوب).
  - `rate limit reached (countRecent → 5) → rate-limited, nothing saved`.
  - `rate-limit query failure is logged and submission continues`.
  - `happy path → saved, team notified, markNotified("id-1"), confirmation sent, success with email`.
  - `save fails but notify succeeds → success, markNotified not called, logError("save", …)`.
  - `save succeeds but notify fails (missing RESEND key) → success, markNotified not called`.
  - `both fail → error-send with mailto containing the company, confirmToSender not called`.
  - `confirmation failure does not change success`.
  - `no ipHash → countRecent not called, save receives null`.
- [ ] **الخطوة 2:** فشل ← **الخطوة 3:** نفّذ ← **الخطوة 4:** نجاح كل اختبارات المجلد `npx vitest run src/lib/sponsor`.
- [ ] **الخطوة 5:** commit `feat(sponsor): add request processing pipeline`.

### المهمة 5.7: الاعتماديات الحقيقية (Neon وResend) وملف قاعدة البيانات

**Files:**
- Create: `db/001_sponsor_requests.sql` (الجدول والفهرس حرفيًا من وثيقة التصميم §5)
- Create: `src/lib/sponsor/db.ts`
- Modify: `src/lib/sponsor/email.ts`
- Create: `.env.example`

**Interfaces — Produces:**
```ts
// db.ts
export function createDbDeps(databaseUrl: string | undefined): Pick<SponsorDeps, "save" | "countRecent" | "markNotified">;
// email.ts
export function createEmailDeps(cfg: { apiKey?: string; from?: string; teamTo: string }):
  Pick<SponsorDeps, "notifyTeam" | "confirmToSender">;
```

- [ ] **الخطوة 1:** `npm install @neondatabase/serverless resend`.
- [ ] **الخطوة 2:** `createDbDeps`: إن كان `databaseUrl` فارغًا تُرجع دوال ترمي `Error("DATABASE_URL missing")`، وإلا تُنشئ `neon(databaseUrl)` **داخل الدالة** (لا عند تحميل الملف) وتستخدم tagged templates بمعاملات (لا تركيب نصوص SQL يدويًا). `save` تُرجع `id` من `returning id`.
- [ ] **الخطوة 3:** `createEmailDeps`: إن نقص `apiKey` أو `from` ترمي الدوال `Error("email not configured")`. `notifyTeam` ترسل `renderTeamEmail` إلى `teamTo` بـ `replyTo: req.email`؛ `confirmToSender` ترسل `renderConfirmationEmail` إلى `req.email`. إن أعاد Resend `{ error }` ارمِ خطأ.
- [ ] **الخطوة 4:** `.env.example` بالمفاتيح الستة من وثيقة التصميم بقيم فارغة، ومفاتيح Turnstile التجريبية الرسمية مع تعليق يوضح أنها للتطوير فقط: site `1x00000000000000000000AA`، secret `1x0000000000000000000000000000000AA` (تنجح دائمًا).
- [ ] **الخطوة 5:** اختبار وحدة صغير: `createDbDeps(undefined).save(...)` يرفض بالخطأ المتوقع، و`createEmailDeps({ teamTo: "x" }).notifyTeam(...)` يرفض.
- [ ] **الخطوة 6:** lint/test/build ثم commit `feat(sponsor): add neon and resend adapters`.

---

## المرحلة 6: واجهة النموذج وربطها

### المهمة 6.1: الـServer Action

**Files:** Create: `src/app/partners/actions.ts`

**Interfaces — Produces:** `export async function submitSponsorRequest(prev: SponsorFormState, formData: FormData): Promise<SponsorFormState>` في ملف يبدأ بـ `"use server"` ولا يصدّر غيرها.

- [ ] **الخطوة 1:** اقرأ `node_modules/next/dist/docs/01-app/02-guides/server-actions.md` و`forms.md`.
- [ ] **الخطوة 2:** نفّذ: `const h = await headers()` من `next/headers`، `ip = getClientIp(h)`، `ipHash = ip && process.env.IP_HASH_SALT ? hashIp(ip, salt) : null`، ثم استدعِ `processSponsorRequest` مع `createDbDeps(process.env.DATABASE_URL)` و`createEmailDeps({ apiKey: process.env.RESEND_API_KEY, from: process.env.SPONSOR_FROM_EMAIL, teamTo: CONTACT_EMAIL })` و`verifyCaptcha: (t) => verifyTurnstile(t, ip, process.env.TURNSTILE_SECRET_KEY ?? "")` و`now: () => new Date()` و`logError: (scope, e) => console.error(`[sponsor:${scope}]`, e instanceof Error ? e.message : e)` و`contactEmail: CONTACT_EMAIL`. لا تسجّل بيانات المستخدم.
- [ ] **الخطوة 3:** lint/build ثم commit `feat(partners): add sponsor request server action`.

### المهمة 6.2: مكوّن Turnstile

**Files:** Create: `src/components/partners/TurnstileWidget.tsx` (مكوّن عميل)

**Interfaces — Produces:** `export function TurnstileWidget({ resetKey }: { resetKey: number }): JSX.Element` يضع داخل النموذج الحقل المخفي `cf-turnstile-response` (يضيفه Turnstile تلقائيًا).

- [ ] **الخطوة 1:** حمّل السكربت بـ `next/script` من `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit` بـ `strategy="afterInteractive"`، وفي `onReady`/`useEffect` استدعِ `window.turnstile.render(ref.current, { sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY, language: "ar", theme: "dark" })` مرة واحدة واحفظ الـwidget id. عند تغيّر `resetKey` استدعِ `window.turnstile.reset(id)`. عند الإزالة `window.turnstile.remove(id)`. عرّف نوعًا محليًا بسيطًا لـ `window.turnstile` (بلا `any`).
- [ ] **الخطوة 2:** إن لم يوجد `NEXT_PUBLIC_TURNSTILE_SITE_KEY` لا تعرض شيئًا (الخادم سيرفض بأمان ويظهر زر البريد).
- [ ] **الخطوة 3:** lint/build ثم commit `feat(partners): add turnstile widget`.

### المهمة 6.3: مكوّن النموذج

**Files:**
- Create: `src/components/partners/SponsorForm.tsx` (عميل)
- Create: `src/components/partners/SponsorFormSection.tsx` (خادم: العنوان والتمهيد من C8 + `<SponsorForm />`، `id="request"`)
- Modify: `src/app/partners/page.tsx`، `src/app/globals.css`

- [ ] **الخطوة 1:** `useActionState(submitSponsorRequest, { status: "idle" })`. الحقول والتسميات والسمات من جدول C8، كل حقل مرتبط بـ `<label htmlFor>`، والخطأ تحته بـ `id` مستقل مربوط عبر `aria-describedby` و`aria-invalid`. القيم تُعاد من `state.values` كـ `defaultValue`/`defaultChecked`، والنموذج يُعاد تركيبه بـ `key` يتغير مع كل حالة حتى تُطبَّق القيم.
- [ ] **الخطوة 2:** الزر `disabled={pending}` ونصّه يتبدّل حسب C8. `TurnstileWidget` قبل الزر بـ `resetKey` يزيد بعد كل نتيجة غير ناجحة.
- [ ] **الخطوة 3:** صندوق الرسائل `role="status" aria-live="polite"` لحالات `error-verify` و`rate-limited` و`error-send` بنصوص C8؛ زر «أرسل عبر البريد» رابط `<a href={state.mailto}>`. عند `success` يُستبدل النموذج بلوحة النجاح وينتقل التركيز إلى عنوانها (`tabIndex={-1}` + `focus()`).
- [ ] **الخطوة 4:** التصميم: حقول بخلفية `rgb(236 239 245 / 6%)` وحد `rgb(236 239 245 / 16%)` وحالة تركيز coral، وحقلان في السطر على الحاسب وحقل واحد على الجوال، و`interests` كـ chips قابلة للتحديد (checkbox مخفي بصريًا مع label مرئي). الحقل `website` مخفي بصريًا بأسلوب `sr-only`-معكوس (خارج الشاشة) و`aria-hidden`.
- [ ] **الخطوة 5:** أضف `SponsorFormSection` إلى `page.tsx` في موضعه.
- [ ] **الخطوة 6: تحقق يدوي** (مفاتيح Turnstile التجريبية في `.env.local`، وبدون `DATABASE_URL` و`RESEND_API_KEY`):
  - إرسال فارغ ← يمنعه المتصفح (`required`).
  - تعطيل التحقق في المتصفح عبر DevTools (حذف `required`) ← رسائل الخادم العربية تحت الحقلين وتبقى القيم.
  - إرسال صحيح ← بما أن القاعدة والإيميل غير مهيّأين تظهر حالة `error-send` وزر البريد يفتح إيميلًا معبّأً بالبيانات.
  - الضغط المزدوج السريع ← طلب واحد فقط (راقب الـNetwork).
  - التنقل بلوحة المفاتيح فقط عبر كل الحقول حتى الإرسال.
  - لقطات 375px و1440px.
- [ ] **الخطوة 7:** lint/test/build ثم commit `feat(partners): add sponsor request form`.

---

## المرحلة 7: الخدمات الخارجية والتشغيل الفعلي

### المهمة 7.1 👤: إنشاء الحسابات (المالك)

- [ ] **Neon:** أنشئ حسابًا ببريد كورة الرسمي ← مشروع `kora` (منطقة قريبة، مثل `aws-eu-central-1`) ← انسخ connection string (pooled).
- [ ] **Neon:** من SQL Editor نفّذ محتوى `db/001_sponsor_requests.sql`. أنشئ فرعًا باسم `dev` للتجربة المحلية.
- [ ] **Resend:** حساب ببريد كورة الرسمي ← Domains ← أضف `korakfupm.com` ← أضف سجلات DNS المطلوبة عند مزوّد الدومين ← انتظر حالة `Verified` ← أنشئ API key بصلاحية «Sending access».
- [ ] **Cloudflare Turnstile:** من لوحة Cloudflare ← Turnstile ← Add widget ← النطاقات `korakfupm.com` و`localhost` ← النوع Managed ← انسخ site key وsecret key.
- [ ] **IP_HASH_SALT:** نص عشوائي طويل (الـAI يولّده بـ `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` ويعطيه للمالك، ولا يحفظه في أي ملف متتبَّع).
- [ ] **Vercel:** Settings ← Environment Variables ← أضف المفاتيح الستة لبيئة Production (وPreview بقيم فرع `dev` في Neon).
- [ ] **اطّلع:** خطة Vercel Hobby مخصّصة للاستخدام غير التجاري؛ قرّر إن كانت مناسبة لكورة أو تحتاجون Pro.

### المهمة 7.2: تجربة متكاملة محليًا

- [ ] **الخطوة 1:** `.env.local` بقيم فرع `dev` في Neon وResend الحقيقي وTurnstile التجريبي.
- [ ] **الخطوة 2:** أرسل طلبًا كاملًا ← تحقق: صف جديد في `sponsor_requests` و`notified = true`، وإيميل تنبيه وصل إلى `KORA-Initiative@kfupm.edu.sa` بالحقول الصحيحة، و«الرد» يذهب لبريد الشركة، وإيميل تأكيد وصل لبريد الاختبار (العربية تظهر سليمة، بلا رموز مشوّهة).
- [ ] **الخطوة 3:** أرسل طلبًا بالحقلين الإلزاميين فقط ← صف بقيم `null` للبقية.
- [ ] **الخطوة 4:** أرسل 6 طلبات متتالية ← السادس يُظهر `rate-limited`.
- [ ] **الخطوة 5:** اجعل `RESEND_API_KEY` خاطئًا مؤقتًا ← الطلب ينجح (محفوظ) و`notified = false`.
- [ ] **الخطوة 6:** احذف الصفوف التجريبية من فرع `dev` وسجّل النتائج في «سجل التقدم».

---

## المرحلة 8: الجودة والإطلاق

### المهمة 8.1: مراجعة شاملة

- [ ] **الخطوة 1:** `npm run lint && npm run test && npm run build` بلا أخطاء ولا تحذيرات جديدة مقارنة بخط الأساس (0.1).
- [ ] **الخطوة 2:** Lighthouse (موبايل) على `/` و`/partners`: Accessibility ≥ 95، SEO ≥ 95، Best Practices ≥ 90. سجّل الأرقام، وأصلح أي مشكلة وصول تُكتشف.
- [ ] **الخطوة 3:** فحص المتصفحات: Chrome وSafari (iOS) وEdge، على عرض 375 و768 و1440.
- [ ] **الخطوة 4:** `grep -rnE "انضم للفريق|ابدأ طلبك|forms.cloud.microsoft|APPLY_URL" src` ← لا نتائج.
- [ ] **الخطوة 5:** راجع كل نص ظاهر في `/` و`/partners` و`/teams` مقابل «المحتوى المعتمد»: لا نص غير موجود فيه.
- [ ] **الخطوة 6:** طلب مراجعة كود (`superpowers:requesting-code-review`) للفرع كاملًا، وعالج الملاحظات.

### المهمة 8.2 👤: المعاينة والإطلاق

- [ ] **الخطوة 1:** ادفع الفرع `git push -u origin sponsorship` (بعد موافقة المالك) ← Vercel ينشئ Preview.
- [ ] **الخطوة 2 👤:** المالك يراجع رابط الـPreview ويرسل طلبًا تجريبيًا.
- [ ] **الخطوة 3:** افتح Pull Request إلى `main` بوصف يلخّص التغييرات وخطوات الإعداد.
- [ ] **الخطوة 4 👤:** المالك يدمج، ثم يرسل طلبًا حقيقيًا من الموقع المنشور ويتأكد من وصول الإيميلين.

---

## المرحلة 9: بعد الإطلاق

### المهمة 9.1: المتابعة الأولى (أسبوع)

- [ ] راجع Vercel Analytics: زيارات `/partners` ونسبة القادمين من الرئيسية.
- [ ] راجع سجلات Vercel بحثًا عن `[sponsor:` (أخطاء الحفظ أو الإيميل).
- [ ] في Neon: `select count(*) from sponsor_requests where notified = false;` ← يجب أن يكون 0، وإلا تواصلوا يدويًا مع تلك الشركات.
- [ ] 👤 عند تأكيد أول شريك: أضف شعاره إلى `public/assets/partners/` ومدخلًا في `PARTNERS` (سيظهر قسم «شركاؤنا» تلقائيًا).

### أفكار مؤجّلة (لكل منها وثيقة تصميم مستقلة عند الحاجة)

- لوحة داخلية لفريق العلاقات لمتابعة حالة الطلبات (تحتاج تسجيل دخول).
- صورة OpenGraph مخصّصة لكل صفحة وبيانات منظّمة `Event` (schema.org).
- نسخة إنجليزية لصفحة الشركاء للشركات الدولية.
- العودة إلى المعرض ثلاثي الأبعاد (فرع `newV`).
- تسجيل حضور الزوار عند اقتراب موعد الحدث.

---

## سجل التقدم

| التاريخ | المهمة | الحالة | ملاحظات |
|---|---|---|---|
| 2026-10-25 | التخطيط | ✅ | اعتماد وثيقة التصميم وكتابة هذه الخارطة |
| 2026-10-25 | المرحلة 0 | ✅ | فرع `sponsorship`، Vitest 5 (رُفع `@types/node` إلى 22). خط الأساس: خطأ lint سابق في `Departments.tsx` أُصلح في 1.5 |
| 2026-10-25 | المرحلة 1 | ✅ | حذف الكود الميت وبقايا التوظيف، `Mark` مشترك، بيانات المحتوى الجديدة |
| 2026-10-25 | المرحلة 2 | ✅ | الشريط العلوي، شريط معلومات الـHero، «لماذا ترعى كورة»، الدعوة الختامية، Analytics وsitemap |
| 2026-10-25 | المرحلة 3 | ✅ | صفحة الفريق تدعو للشراكة |
| 2026-10-25 | المرحلة 4 | ✅ | صفحة `/partners` بكل أقسامها الثابتة (قسم الشركاء مخفي ما دامت القائمة فارغة) |
| 2026-10-25 | المرحلة 5 | ✅ | منطق النموذج: 24 اختبارًا (اختبارات أساسية فقط بطلب المالك) |
| 2026-10-25 | المرحلة 6 | ✅ | النموذج والـServer Action وTurnstile؛ تحقق يدوي لمسارات الفشل والإرسال المزدوج |
| 2026-10-25 | المرحلة 7.1 👤 | ◐ | Neon (الجدول منشأ) وResend (الدومين موثّق، 4 مستلمين) جاهزان محليًا. متبقٍ: مفاتيح Turnstile حقيقية، ومتغيرات Vercel، وتغيير كلمة مرور قاعدة Neon (ظهرت في مخرجات الجلسة) |
| 2026-10-25 | المرحلة 7.2 | ✅ | طلب حقيقي واحد: حُفظ الصف بكل الحقول، الجوال طُبِّع، IP مخزّن كـ hash، `notified = true`، بلا أخطاء في السجلات. حُذف الصف التجريبي. لم يُجرَّب حد الإرسال ومفتاح Resend الخاطئ فعليًا لتجنّب إيميلات مزعجة؛ مغطّيان باختبارات الوحدة |

| 2026-10-25 | الجزء الثاني | ◐ | رئيسية لكل الجمهور وصفحة `/speakers` — انظر [`roadmap-speakers.md`](roadmap-speakers.md). متغيرات Vercel الإضافية: `SPEAKERS_NOTIFY_TO` (اختياري). وتشغيل `db/002_speaker_requests.sql` تم على Neon |

القرارات التفصيلية أثناء التنفيذ مسجّلة في `.superpowers/sdd/roadmap/progress.md` (أسطر `Ruling:`).
