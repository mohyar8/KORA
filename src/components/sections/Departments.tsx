"use client";

import { useEffect, useState } from "react";
import { APPLY_URL } from "@/lib/constants";
import { DEPARTMENTS } from "@/lib/content";

export function Departments() {
  const [active, setActive] = useState(DEPARTMENTS[0].slug);
  const dept = DEPARTMENTS.find((item) => item.slug === active) ?? DEPARTMENTS[0];

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && DEPARTMENTS.some((item) => item.slug === hash)) {
      setActive(hash);
    }
  }, []);

  const open = (slug: string) => {
    setActive(slug);
    window.history.replaceState(null, "", `#${slug}`);
  };

  return (
    <section className="depts-page" aria-labelledby="depts-heading">
      <div className="depts-pattern" aria-hidden="true">
        <span className="depts-pattern-tile" />
        <span className="depts-pattern-lg" />
        <span className="depts-pattern-sm" />
      </div>
      <header className="depts-mast">
        <h1 id="depts-heading">الإدارات والفرق</h1>
        <p className="depts-lead">
          اختر إدارة، ثم اقرأ فرقها. كل فريق يمسك جزءًا واضحًا من كورة: المكان،
          التسويق، التخطيط، التشغيل، أو العلاقات والموارد.
        </p>
      </header>

      <div className="depts-tabs" role="tablist" aria-label="الإدارات">
        {DEPARTMENTS.map((item, itemIndex) => (
          <button
            key={item.slug}
            type="button"
            role="tab"
            id={`tab-${item.slug}`}
            aria-selected={active === item.slug}
            aria-controls="depts-stage"
            data-accent={item.accent}
            data-wide={item.slug === "event-design" ? "true" : undefined}
            onClick={() => open(item.slug)}
          >
            <span>{String(itemIndex + 1).padStart(2, "0")}</span>
            {item.short}
          </button>
        ))}
      </div>

      <div
        id="depts-stage"
        role="tabpanel"
        aria-labelledby={`tab-${dept.slug}`}
        className="depts-stage"
        data-accent={dept.accent}
      >
        <div className="depts-stage-head">
          <h2>{dept.title}</h2>
          <p className="depts-stage-lead">{dept.lead}</p>
        </div>

        <ul className="depts-teams">
          {dept.teams.map((team, teamIndex) => (
            <li key={team.slug} id={team.slug}>
              <article className="depts-card">
                <div className="depts-card-top">
                  <span>{String(teamIndex + 1).padStart(2, "0")}</span>
                  <i className="kora-pentagon" />
                </div>
                <h3>{team.title}</h3>
                <p>{team.description}</p>
                <ul>
                  {team.skills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ul>
      </div>

      <div className="depts-cta">
        <p>لقِيت الفريق الأقرب لك؟</p>
        <a href={APPLY_URL} target="_blank" rel="noreferrer">
          انضم للفريق
        </a>
      </div>
    </section>
  );
}
