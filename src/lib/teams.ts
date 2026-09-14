/* =============================================================================
   The nine functional teams.

   One definition, two readers: the Team page lists what each team does, and
   About shows them as a filmstrip. They were the same array copied into two
   places for about five minutes, which is exactly long enough for them to
   start disagreeing.

   This is the club's structure, not its roster. Who is actually on each team
   lives in the `team_members` table and is edited from the admin panel.
   ============================================================================= */

export interface FunctionalTeam {
  title: string;
  summary: string;
  duties: string[];
}

export const ROLES: FunctionalTeam[] = [
  {
    title: "Club Head / President",
    summary: "The primary student leader: sets direction, delegates, and is accountable for the club as a whole.",
    duties: [
      "Establish the strategic direction of the club",
      "Coordinate all functional teams",
      "Represent the club before faculty and college authorities",
      "Ensure teams operate independently while staying aligned",
    ],
  },
  {
    title: "Student Welfare, Conferences & Outreach",
    summary: "Finds the opportunities everything else is built on.",
    duties: [
      "Research conferences and scientific events",
      "Prepare summaries of relevant opportunities",
      "Coordinate student participation and permissions",
      "Maintain participation records",
    ],
  },
  {
    title: "Alumni Team",
    summary: "Builds the standing network the club draws speakers and mentors from.",
    duties: [
      "Identify and contact biotechnology alumni",
      "Maintain an alumni contact database",
      "Invite alumni for talks, mentorship and podcasts",
      "Build an institutional network, not last-minute speakers",
    ],
  },
  {
    title: "Cultural & Engagement Team",
    summary: "Makes sure opportunities reach students who would not otherwise hear about them.",
    duties: [
      "Conduct classroom campaigns across AIT",
      "Democratize access to scientific activities",
      "Encourage first-year and cross-department participation",
      "Coordinate student volunteers",
    ],
  },
  {
    title: "Media Team",
    summary: "Records what happens, so it exists after the day it happened.",
    duties: [
      "Photograph and record events",
      "Produce short-form videos and reels",
      "Document meetings and external coverage",
      "Maintain an organized, geotagged media archive",
    ],
  },
  {
    title: "Editorial & Design Team",
    summary: "Turns the record into something readable, and keeps the club's visual voice consistent.",
    duties: [
      "Graphic design, website and posters",
      "Blogs, explainers and event reports",
      "Magazine and digital publications",
      "Work closely with Media on every story",
    ],
  },
  {
    title: "Hackathons & Technical Activities",
    summary: "The hands-on, competitive side of the club.",
    duties: [
      "Research hackathons and competitions",
      "Identify biotechnology and interdisciplinary challenges",
      "Assemble student teams and document outcomes",
      "Develop internal hackathons where appropriate",
    ],
  },
  {
    title: "Logistics & Transportation",
    summary: "The part of an event nobody sees unless it goes wrong.",
    duties: [
      "Transport arrangements and venue coordination",
      "Permissions, setup and equipment",
      "Registration desks and scheduling",
      "External conference and visit logistics",
    ],
  },
  {
    title: "Treasurer / Finance Team",
    summary: "Keeps the club solvent, documented and compliant.",
    duties: [
      "Maintain financial records and budgets",
      "Track income and expenditure",
      "Prepare receipts, documentation and financial reports",
      "Ensure all expenditure follows institutional regulations",
    ],
  },
];
