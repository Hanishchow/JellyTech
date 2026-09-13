"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Masthead, Page, Section, Note } from "@/components/layout/editorial";
import { backend, type Member } from "@/lib/backend";

function Row({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-rule py-4 sm:grid-cols-[12rem_1fr] sm:gap-8">
      <dt className="label pt-1">{term}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setMember(backend.currentMember());
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (!member) {
    return (
      <Page>
        <Masthead eyebrow="Members" title="Not signed in" />
        <Section>
          <p className="measure border-t border-rule pt-10 text-ink-muted">
            <Link to="/login" className="text-glow-bright underline underline-offset-4">
              Sign in
            </Link>{" "}
            to see your membership, or{" "}
            <Link to="/join" className="text-glow-bright underline underline-offset-4">
              apply to join
            </Link>
            .
          </p>
        </Section>
      </Page>
    );
  }

  return (
    <Page>
      <Masthead eyebrow="Members" title={member.name} />

      <Section title="Your membership">
        <dl className="border-t border-rule">
          <Row term="Status">
            {member.status === "applied" ? "Application received" : "Active member"}
          </Row>
          <Row term="Email">{member.email}</Row>
          {member.usn && <Row term="USN">{member.usn}</Row>}
          <Row term="Department">{member.department}</Row>
          <Row term="Year">{member.year}</Row>
          <Row term="Interests">
            {member.interests.length ? member.interests.join(", ") : "None selected"}
          </Row>
          <Row term="Applied">
            {new Date(member.createdAt).toLocaleDateString(undefined, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Row>
        </dl>

        <button
          type="button"
          onClick={async () => {
            await backend.signOut();
            navigate("/");
          }}
          className="mt-8 border border-rule px-5 py-2.5 text-sm text-ink-muted transition-colors hover:border-glow/60 hover:text-ink"
        >
          Sign out
        </button>
      </Section>

      <Section title="What appears here next">
        <p className="measure border-t border-rule pt-10 text-ink-muted">
          Once the club's backend is connected and the first activities run, this
          page becomes the member's own record: opportunities they are eligible
          for, activities they have attended, work they have published, and the
          team they belong to.
        </p>
        {!backend.isLive && (
          <div className="mt-8">
            <Note>
              The backend is not connected yet, so everything above was read from
              this browser's local storage rather than from an account.
            </Note>
          </div>
        )}
      </Section>
    </Page>
  );
}
