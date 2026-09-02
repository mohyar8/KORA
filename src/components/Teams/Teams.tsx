import { useId, useState } from "react";
import { BrandName, BrandText } from "../BrandName/BrandName";
import type { Department, Subteam } from "../../data/organization";
import { departments, overallLeadership } from "../../data/organization";
import type { Team } from "../../data/teams";
import { teamGroups } from "../../data/teams";
import { useMediaQuery } from "../../hooks/useMediaQuery";

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
  readonly collapsible: boolean;
}

function MemberList({ members, collapsible }: MemberListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const generatedId = useId().replaceAll(":", "");
  const panelId = `members-${generatedId}`;

  if (!members?.length) return null;

  if (!collapsible) {
    return (
      <div className="members-block">
        <p className="role-label">الأعضاء</p>
        <ul className="member-list">
          {members.map((member) => <li key={member}>{member}</li>)}
        </ul>
      </div>
    );
  }

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

function SubteamView({ subteam, mobile }: { readonly subteam: Subteam; readonly mobile: boolean }) {
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
      <MemberList members={subteam.members} collapsible={mobile} />
    </section>
  );
}

function DepartmentBody({ department, mobile }: { readonly department: Department; readonly mobile: boolean }) {
  return (
    <div className="department-body">
      {department.primaryTeamId && <TeamInformation teamId={department.primaryTeamId} />}
      <MemberList members={department.members} collapsible={mobile} />
      {department.subteams.map((subteam) => (
        <SubteamView subteam={subteam} mobile={mobile} key={subteam.id} />
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

function DepartmentCard({ department }: { readonly department: Department }) {
  return (
    <section
      className={`department department--${department.accent}`}
      aria-labelledby={`department-${department.id}`}
    >
      <header className="department-heading">
        <h3 id={`department-${department.id}`}>{department.name}</h3>
        <p className="manager-line">
          <small>{department.manager.role}</small>
          <strong>{department.manager.name}</strong>
        </p>
      </header>
      <DepartmentBody department={department} mobile={false} />
    </section>
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
          <DepartmentBody department={department} mobile />
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
  const isDesktop = useMediaQuery("(min-width: 769px)");

  return (
    <section id="teams" className="section teams-section" aria-labelledby="teams-title">
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

        <div className={isDesktop ? "organization-grid" : "organization-accordion"}>
          {departments.map((department) =>
            isDesktop
              ? <DepartmentCard department={department} key={department.id} />
              : <DepartmentAccordion department={department} key={department.id} />,
          )}
        </div>
      </div>
    </section>
  );
}
