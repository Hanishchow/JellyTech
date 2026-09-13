"use client";

import { Masthead, Page, Section } from "@/components/layout/editorial";

function Clause({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-rule py-6">
      <h2 className="font-display text-lg">{title}</h2>
      <div className="measure mt-3 space-y-3 text-ink-muted">{children}</div>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <Page>
      <Masthead
        eyebrow="Privacy"
        title="What this site collects"
        standfirst="JellyTech is a non-commercial student club. The site collects the minimum it needs to process a membership application and nothing else."
      />
      <Section>
        <div className="border-t border-rule">
          <Clause title="What is collected">
            <p>
              The membership form collects your name, email address, optional
              USN, department, year of study, the teams you are interested in and
              anything you choose to write in the free-text box.
            </p>
          </Clause>
          <Clause title="Why">
            <p>
              To contact you about the club's intake, and to record participation
              in activities as institutional documentation, as described on the
              Team &amp; governance page.
            </p>
          </Clause>
          <Clause title="Who sees it">
            <p>
              The club's Cultural &amp; Engagement team and, where institutional
              policy requires it, the supervising faculty. Member data is not
              sold, shared with third parties, or used for advertising.
            </p>
          </Clause>
          <Clause title="Analytics and tracking">
            <p>
              This site sets no advertising or analytics cookies. Web fonts are
              loaded from Google Fonts, which receives the request as part of
              serving them.
            </p>
          </Clause>
          <Clause title="Removal">
            <p>
              Ask the club to delete your application or membership record at any
              time, through the contact route on the Join page.
            </p>
          </Clause>
        </div>
      </Section>
    </Page>
  );
}

export function TermsPage() {
  return (
    <Page>
      <Masthead
        eyebrow="Terms"
        title="Terms of use"
        standfirst="This site is published by a student club of Acharya Institute of Technology for informational purposes."
      />
      <Section>
        <div className="border-t border-rule">
          <Clause title="Nature of the club">
            <p>
              JellyTech is a student-led, faculty-supervised, non-commercial
              co-curricular organization. It does not sell goods or services, and
              it makes no financial commitment on behalf of the institute.
            </p>
          </Clause>
          <Clause title="Accuracy">
            <p>
              Scientific content published here is reviewed for accuracy before
              publication, but it is student communication, not peer-reviewed
              literature. Cite the primary sources, not this site.
            </p>
          </Clause>
          <Clause title="Opportunities listed">
            <p>
              Conferences, workshops and programs listed in the opportunity
              calendar are run by external organizations. The club coordinates
              participation; it does not operate them and cannot guarantee their
              content, cost or outcome.
            </p>
          </Clause>
          <Clause title="Membership">
            <p>
              Membership is voluntary, carries no fee, and may be ended by either
              the member or the club. Participation in activities remains subject
              to institutional approval.
            </p>
          </Clause>
          <Clause title="Attribution">
            <p>
              The animated background is the particulate-medusae simulation by
              Ash Weeks (milcktoast), used under the Artistic-2.0 licence. The
              source is at{" "}
              <a
                href="https://github.com/milcktoast/particulate-medusae"
                target="_blank"
                rel="noreferrer noopener"
                className="text-glow-bright underline underline-offset-4"
              >
                github.com/milcktoast/particulate-medusae
              </a>
              , and the copy running here is unmodified apart from the removal
              of its demo control panel.
            </p>
            <p>
              This site was built by{" "}
              <a
                href="https://hanishchow.github.io/"
                target="_blank"
                rel="noreferrer noopener"
                className="text-glow-bright underline underline-offset-4"
              >
                Hanishchow
              </a>
              .
            </p>
          </Clause>
        </div>
      </Section>
    </Page>
  );
}

export function NotFoundPage() {
  return (
    <Page>
      <Masthead
        eyebrow="404"
        title="Nothing at this address"
        standfirst="The page you asked for does not exist, possibly because the site was restructured and an old link survived somewhere."
      />
    </Page>
  );
}
