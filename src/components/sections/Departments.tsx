"use client";

import { useEffect, useState } from "react";
import { APPLY_URL } from "@/lib/constants";
import { DEPARTMENTS, LEADERSHIP, type TeamAudience } from "@/lib/content";

const AUDIENCE_LABEL: Record<TeamAudience, string> = {
  male: "طلاب",
  female: "طالبات",
};

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
          التسويق، التخطيط، التشغيل، العلاقات والموارد، أو التقنية.
        </p>
      </header>

      <section className="depts-leaders" aria-labelledby="leaders-heading">
        <div className="depts-leaders-title">
          <h2 id="leaders-heading">
            قيادة <em className="word-mark">كورة</em>
          </h2>
        </div>
        <ul className="depts-leaders-people">
          {LEADERSHIP.people.map((person) => (
            <li key={person.name}>
              <span>
                {"highlight" in person ? (
                  <>
                    قائد <em>{person.highlight}</em>
                  </>
                ) : (
                  person.role
                )}
              </span>
              <strong>{person.name}</strong>
            </li>
          ))}
        </ul>
      </section>

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
          <p className="depts-person">
            <span>{dept.manager.role}</span>
            <strong>{dept.manager.name}</strong>
          </p>
          <p className="depts-stage-lead">{dept.lead}</p>
        </div>

        <ul className="depts-teams">
          {dept.teams.map((team, teamIndex) => (
            <li key={team.slug} id={team.slug}>
              <article className="depts-card">
                <div className="depts-card-top">
                  <span>{String(teamIndex + 1).padStart(2, "0")}</span>
                  {team.audience ? (
                    <b
                      className="depts-audience"
                      data-audience={team.audience}
                      aria-label={
                        team.audience === "female"
                          ? "هذا الفريق للطالبات"
                          : "هذا الفريق للطلاب"
                      }
                    >
                      {AUDIENCE_LABEL[team.audience]}
                    </b>
                  ) : null}
                  <i className="kora-pentagon" />
                </div>
                <h3>{team.title}</h3>
                {team.leader ? (
                  <p className="depts-person">
                    <span>{team.leader.role}</span>
                    <strong>{team.leader.name}</strong>
                  </p>
                ) : null}
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
