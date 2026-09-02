import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { siteConfig } from "../src/config/site.ts";
import { departments, overallLeadership } from "../src/data/organization.ts";
import { teamGroups } from "../src/data/teams.ts";

const root = new URL("../", import.meta.url).pathname;
const read = (path: string) => readFileSync(join(root, path), "utf8");

function filesUnder(path: string): string[] {
  const absolute = join(root, path);
  return readdirSync(absolute).flatMap((entry: string) => {
    const child = join(absolute, entry);
    return statSync(child).isDirectory()
      ? filesUnder(join(path, entry))
      : [join(path, entry)];
  });
}

const requiredFiles = [
  "src/config/site.ts",
  "src/data/organization.ts",
  "src/data/teams.ts",
  "src/components/BrandName/BrandName.tsx",
  "src/components/SocialSection/SocialSection.tsx",
  "src/styles/fonts.css",
  "src/styles/tokens.css",
  "src/styles/globals.css",
  "src/App.tsx",
  "src/main.tsx",
  "index.html",
  "public/robots.txt",
  "README.md",
  "ASSET_AUDIT.md",
];

for (const file of requiredFiles) assert.ok(existsSync(join(root, file)), `Missing required project file: ${file}`);

assert.equal(siteConfig.applicationStatus, "coming-soon");
assert.equal(siteConfig.microsoftFormUrl, "https://forms.cloud.microsoft/r/QQmb1auxvd");
assert.equal(siteConfig.applicationDeadlineISO, "2026-09-01T23:59:00+03:00");
assert.equal(siteConfig.applicationDeadlineArabic, "1 سبتمبر 2026، الساعة 11:59 مساءً بتوقيت السعودية");
assert.equal(siteConfig.contactEmail, "kora.kfupm@gmail.com");
assert.equal(siteConfig.socialLinks.instagram, "https://www.instagram.com/kora_kfupm");
assert.equal(siteConfig.socialLinks.x, "https://x.com/KORA_KFUPM");
assert.equal(siteConfig.socialLinks.tiktok, "https://www.tiktok.com/@kfupm_kora");
assert.equal(siteConfig.canonicalUrl, null);
assert.equal(siteConfig.openGraphImage, null);

assert.equal(teamGroups.length, 5);
const teams = teamGroups.flatMap((group) => group.teams);
assert.equal(teams.length, 11);
assert.equal(new Set(teams.map((team) => team.id)).size, teams.length);
assert.equal(new Set(teams.map((team) => team.name)).size, teams.length);

assert.equal(overallLeadership.length, 2);
assert.equal(departments.length, 6);
assert.equal(new Set(departments.map((department) => department.id)).size, departments.length);
const organizationTeamIds = departments.flatMap((department) => [
  ...(department.primaryTeamId ? [department.primaryTeamId] : []),
  ...department.subteams.map((subteam) => subteam.teamId),
]);
assert.deepEqual(new Set(organizationTeamIds), new Set(teams.map((team) => team.id)));
const members = departments.flatMap((department) => [
  ...(department.members ?? []),
  ...department.subteams.flatMap((subteam) => subteam.members ?? []),
]);
assert.equal(members.length, 29);
assert.equal(new Set(members).size, members.length);
assert.deepEqual(overallLeadership, [
  { role: "قائد كورة", name: "عمر الحربي" },
  { role: "نائب القائد", name: "خالد الجهني" },
]);
assert.deepEqual(departments.map((department) => department.manager.name), [
  "أحمد بخاري",
  "طارق الحربي",
  "عمار الهذلي",
  "أحمد المحمدي",
  "خالد النجدي",
  "أسامة الغامدي",
]);
assert.deepEqual(
  departments.flatMap((department) => department.subteams.map((subteam) => subteam.leader.name)),
  [
    "مهند الرحيلي",
    "زهرة الحداد",
    "لمى النقموش",
    "محمد سامي",
    "دنيا الضحيان",
    "عبدالله الحوطي",
    "شوق الغامدي",
    "سعيد العيد",
  ],
);
assert.deepEqual(members, [
  "محمد بكر",
  "محمد أبو سمحة",
  "إلياس الياس",
  "أريام يوسف",
  "لجين العتيبي",
  "فاطمة النمير",
  "دانة العلوان",
  "شهد العتيبي",
  "مجد الخليفة",
  "خالد المسلم",
  "حسين اليامي",
  "حسين الخميس",
  "نواف الودعاني",
  "عبدالرحمن الجهني",
  "مشاري الرماح",
  "محمد النجمي",
  "هند القاسم",
  "أروى العامودي",
  "جنى يعقوب",
  "فاطمة السبيع",
  "سجا الحربي",
  "هند الملحم",
  "محمد الصقور",
  "عبدالله القرني",
  "مشعل",
  "نورة",
  "محمد يار",
  "فيصل باغشن",
  "عمر سليق",
]);

const index = read("index.html");
assert.match(index, /<html lang="ar" dir="rtl">/);
assert.match(index, /<title>الانضمام إلى فريق كورة 2026 \| الصناعة خلف اللعبة<\/title>/);
assert.doesNotMatch(index, /rel="canonical"/);
assert.doesNotMatch(index, /property="og:url"/);
assert.doesNotMatch(index, /property="og:image"/);

const tokens = read("src/styles/tokens.css");
for (const token of ["#2d3b70", "#944399", "#f26557", "#4ea649", "#ffffff"]) {
  assert.ok(tokens.includes(token), `Missing brand token ${token}`);
}

const productionSource = filesUnder("src")
  .filter((path) => !path.includes("/test/") && /\.(?:ts|tsx|css)$/.test(path))
  .map(read)
  .join("\n");
assert.equal(productionSource.split(siteConfig.microsoftFormUrl).length - 1, 1, "Form URL must occur only in site config");
assert.equal(productionSource.split(siteConfig.contactEmail).length - 1, 1, "Email must occur only in site config");
assert.doesNotMatch(productionSource, /dangerouslySetInnerHTML/);
assert.doesNotMatch(productionSource, /console\.log/);
assert.doesNotMatch(productionSource, /\bTODO\b/);
assert.doesNotMatch(productionSource, /\bany\b/);

const action = read("src/components/ApplicationAction/ApplicationAction.tsx");
assert.match(action, /status === "open"/);
assert.match(action, /href=\{siteConfig\.microsoftFormUrl\}/);
assert.match(action, /target="_blank"/);
assert.match(action, /rel="noopener noreferrer"/);
assert.match(action, /role="status"/);

const footer = read("src/components/Footer/Footer.tsx");
assert.match(footer, /SiInstagram/);
assert.match(footer, /SiX/);
assert.match(footer, /SiTiktok/);

const hero = read("src/components/Hero/Hero.tsx");
assert.match(hero, /KORA_only\.svg/);
assert.match(hero, /logo_14_transparent_HQ\.svg/);
assert.doesNotMatch(hero, /Pattern_0_transparent_HQ\.svg/);
assert.doesNotMatch(hero, />26</);
assert.doesNotMatch(hero, /سيتم التقديم عبر نموذج Microsoft الرسمي/);

const about = read("src/components/AboutKora/AboutKora.tsx");
assert.match(about, /Pattern_2_transparent_HQ\.svg/);
assert.doesNotMatch(about, /logo 20\.svg/);

const styles = read("src/styles/globals.css");
assert.doesNotMatch(styles, /\.hero::before/);
assert.match(styles, /\.hero\s*\{[\s\S]*?background: var\(--color-navy-950\)/);
assert.match(styles, /\.about-section::before[\s\S]*?background-repeat: repeat/);

for (const path of [
  "src/components/Hero/Hero.tsx",
  "src/components/AboutKora/AboutKora.tsx",
  "src/components/Teams/Teams.tsx",
  "src/components/FinalCTA/FinalCTA.tsx",
  "src/components/Footer/Footer.tsx",
  "src/data/teams.ts",
  "index.html",
]) {
  assert.doesNotMatch(read(path), /\bKORA\b/, `Plain visible KORA remains in ${path}`);
}

const missingAssets = [
  "src/assets/brand/logos/KORA_only.svg",
  "src/assets/brand/logos/logo 20.svg",
  "src/assets/brand/logos/logo 22.svg",
  "src/assets/brand/logos/logo 23.svg",
  "src/assets/brand/logos/logo_0_transparent_HQ.svg",
  "src/assets/brand/logos/logo_14_transparent_HQ.svg",
  "src/assets/brand/patterns/Pattern_0_transparent_HQ.svg",
  "src/assets/brand/patterns/Pattern_2_transparent_HQ.svg",
  "src/assets/brand/patterns/Pattern_6_transparent_HQ.svg",
  "src/assets/brand/patterns/Pattern_7_transparent_HQ.svg",
  "src/assets/brand/patterns/Pattern_8_transparent_HQ.svg",
  "src/assets/fonts/itfGhroob-Light.otf",
  "src/assets/fonts/itfGhroob-Regular.otf",
  "src/assets/fonts/itfGhroob-Medium.otf",
  "src/assets/fonts/itfGhroob-Bold.otf",
  "src/assets/fonts/itfGhroob-ExtraBold.otf",
].filter((path) => !existsSync(join(root, path)));

const suppliedSvgAssets = [
  "src/assets/brand/logos/KORA_only.svg",
  "src/assets/brand/logos/logo 20.svg",
  "src/assets/brand/logos/logo 22.svg",
  "src/assets/brand/logos/logo 23.svg",
  "src/assets/brand/logos/logo_0_transparent_HQ.svg",
  "src/assets/brand/logos/logo_14_transparent_HQ.svg",
  "src/assets/brand/patterns/Pattern_0_transparent_HQ.svg",
  "src/assets/brand/patterns/Pattern_2_transparent_HQ.svg",
  "src/assets/brand/patterns/Pattern_6_transparent_HQ.svg",
  "src/assets/brand/patterns/Pattern_7_transparent_HQ.svg",
  "src/assets/brand/patterns/Pattern_8_transparent_HQ.svg",
];
for (const path of suppliedSvgAssets) {
  assert.match(read(path).slice(0, 500), /<svg[^>]+width="\d+"[^>]+height="\d+"/);
}

process.stdout.write(`${JSON.stringify({
  status: "passed",
  checkedFiles: requiredFiles.length,
  groups: teamGroups.length,
  teams: teams.length,
  departments: departments.length,
  members: members.length,
  deploymentBlockedByDeadlineStatusConflict:
    siteConfig.applicationStatus === "coming-soon" && Date.now() > Date.parse(siteConfig.applicationDeadlineISO),
  missingAssets,
}, null, 2)}\n`);
