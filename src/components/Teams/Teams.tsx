import { useId, useState, type CSSProperties } from "react";
import { BrandName, BrandText } from "../BrandName/BrandName";
import type { Department, Subteam } from "../../data/organization";
import { departments, overallLeadership } from "../../data/organization";
import type { Team } from "../../data/teams";
import { teamGroups } from "../../data/teams";
import teamsPattern from "../../assets/brand/patterns/Pattern_8_transparent_HQ.svg";

const teamsById = new Map<string, Team>(
  teamGroups.flatMap((group) => group.teams).map((team) => [team.id, team] as const),
);

function getTeam(teamId: string): Team {
  const team = teamsById.get(teamId);
  if (!team) throw new Error(`Unknown team id: ${teamId}`);
  return team;
}

function Skills({ skills }: { readonly skills: readonly string[] }) {
  return (
    <ul className="skills-list" aria-label="المهارات المناسبة">
      {skills.map((skill) => (
        <li key={skill}>{skill}</li>
      ))}
    </ul>
  );
}

function TeamInformation({ teamId }: { readonly teamId: string }) {
  const team = getTeam(teamId);

  return (
    <div className="organization-team-info">
      <p><BrandText>{team.description}</BrandText></p>
      <Skills skills={team.skills} />
    </div>
  );
}

interface MemberListProps {
  readonly members?: readonly string[];
}

function MemberList({ members }: MemberListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const generatedId = useId().replaceAll(":", "");
  const panelId = `members-${generatedId}`;

  if (!members?.length) return null;

  return (
    <div className="members-block members-block--collapsible">
      <button
        className="members-trigger"
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>الأعضاء <bdi>({members.length})</bdi></span>
        <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <ul id={panelId} className="member-list">
          {members.map((member) => <li key={member}>{member}</li>)}
        </ul>
      )}
    </div>
  );
}

function SubteamView({ subteam }: { readonly subteam: Subteam }) {
  return (
    <section className="organization-subteam" aria-labelledby={`subteam-${subteam.id}`}>
      <header className="subteam-heading">
        <h4 id={`subteam-${subteam.id}`}>{subteam.name}</h4>
        <p className="leader-line">
          <span>{subteam.leader.role}</span>
          <strong>{subteam.leader.name}</strong>
        </p>
      </header>
      <TeamInformation teamId={subteam.teamId} />
      <MemberList members={subteam.members} />
    </section>
  );
}

function DepartmentBody({ department }: { readonly department: Department }) {
  return (
    <div className="department-body">
      {department.primaryTeamId && <TeamInformation teamId={department.primaryTeamId} />}
      <MemberList members={department.members} />
      {department.subteams.map((subteam) => (
        <SubteamView subteam={subteam} key={subteam.id} />
      ))}
    </div>
  );
}

function DepartmentHeading({ department }: { readonly department: Department }) {
  return (
    <>
      <span className="department-name">{department.name}</span>
      <span className="manager-line">
        <small>{department.manager.role}</small>
        <strong>{department.manager.name}</strong>
      </span>
    </>
  );
}

function DepartmentAccordion({ department }: { readonly department: Department }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = `department-panel-${department.id}`;

  return (
    <section className={`department department--${department.accent}`}>
      <h3 className="department-accordion-heading">
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => setIsOpen((current) => !current)}
        >
          <DepartmentHeading department={department} />
          <span className="department-toggle" aria-hidden="true">{isOpen ? "−" : "+"}</span>
        </button>
      </h3>
      {isOpen && (
        <div id={panelId}>
          <DepartmentBody department={department} />
        </div>
      )}
    </section>
  );
}

function Leadership() {
  return (
    <section className="leadership" aria-labelledby="leadership-title">
      <div className="leadership-heading">
        <p className="section-index" aria-hidden="true">01</p>
        <h3 id="leadership-title">قيادة <BrandName /></h3>
      </div>
      <div className="leadership-people">
        {overallLeadership.map((person) => (
          <article key={person.role}>
            <span><BrandText>{person.role}</BrandText></span>
            <strong>{person.name}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Teams() {
  const patternStyle = {
    "--teams-pattern-image": `url("${teamsPattern}")`,
  } as CSSProperties;

  return (
    <section
      id="teams"
      className="section teams-section"
      aria-labelledby="teams-title"
      style={patternStyle}
    >
      <div className="container">
        <div className="teams-intro">
          <div className="section-heading">
            <p className="eyebrow">فرق العمل</p>
            <h2 id="teams-title">
              اختر المجال الذي تصنع من خلاله <BrandName />
            </h2>
          </div>
          <p>تعرّف على طبيعة كل فريق، ثم رتّب رغباتك الثلاث في نموذج التقديم.</p>
        </div>

        <Leadership />

        <div className="organization-heading">
          <p className="section-index" aria-hidden="true">02</p>
          <h3>الإدارات وفرق العمل</h3>
        </div>

        <div className="organization-accordion">
          {departments.map((department) => (
            <DepartmentAccordion department={department} key={department.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
