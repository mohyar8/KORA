import { useId, useState } from "react";
import type { Team } from "../../data/teams";
import { teamGroups } from "../../data/teams";
import { useMediaQuery } from "../../hooks/useMediaQuery";

function Skills({ skills }: { readonly skills: readonly string[] }) {
  return (
    <ul className="skills-list" aria-label="المهارات المناسبة">
      {skills.map((skill) => (
        <li key={skill}>{skill}</li>
      ))}
    </ul>
  );
}

function TeamAccordion({ team }: { readonly team: Team }) {
  const [isOpen, setIsOpen] = useState(false);
  const generatedId = useId();
  const panelId = `team-${team.id}-${generatedId.replaceAll(":", "")}`;

  return (
    <div className="accordion-item">
      <h4>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span>{team.name}</span>
          <span className="accordion-symbol" aria-hidden="true">{isOpen ? "−" : "+"}</span>
        </button>
      </h4>
      {isOpen && (
        <div id={panelId} className="accordion-panel">
          <p>{team.description}</p>
          <Skills skills={team.skills} />
        </div>
      )}
    </div>
  );
}

export function Teams() {
  const isDesktop = useMediaQuery("(min-width: 769px)");

  return (
    <section id="teams" className="section teams-section" aria-labelledby="teams-title">
      <div className="container">
        <div className="teams-intro">
          <div className="section-heading">
            <p className="eyebrow">فرق العمل</p>
            <h2 id="teams-title">اختر المجال الذي تصنع من خلاله KORA</h2>
          </div>
          <p>تعرّف على طبيعة كل فريق، ثم رتّب رغباتك الثلاث في نموذج التقديم.</p>
        </div>

        <div className={isDesktop ? "team-groups team-groups--desktop" : "team-groups team-groups--mobile"}>
          {teamGroups.map((group) => (
            <section className={`team-group team-group--${group.accent}`} key={group.id} aria-labelledby={`group-${group.id}`}>
              <div className="team-group-heading">
                <span aria-hidden="true">{String(group.teams.length).padStart(2, "0")}</span>
                <h3 id={`group-${group.id}`}>{group.name}</h3>
              </div>

              {isDesktop ? (
                <div className="team-list">
                  {group.teams.map((team) => (
                    <article className="team-card" key={team.id}>
                      <h4>{team.name}</h4>
                      <p>{team.description}</p>
                      <Skills skills={team.skills} />
                    </article>
                  ))}
                </div>
              ) : (
                <div className="accordion-list">
                  {group.teams.map((team) => (
                    <TeamAccordion team={team} key={team.id} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
