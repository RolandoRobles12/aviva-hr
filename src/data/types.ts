// ── Domain types for Aviva HR ──────────────────────────────────────────────

export interface Region {
  id: string;
  label: string;
  area: string;
  leader: string;
}

export interface Quiosco {
  name: string;
  estado: string;
  producto: string;
}

export interface Integration {
  id: string;
  name: string;
  short: string;
  desc: string;
  accounts: number;
  lastSync: string;
  status: "ok" | "warn" | "error";
  color: string;
}

export type UserStatus = "active" | "invited" | "suspended" | "offboarding" | "archived";

export interface AvatarData {
  initials: string;
  color: string;
}

export interface User {
  id: string;
  numColaborador: string;
  first: string;
  last: string;
  fullName: string;
  email: string;
  role: string;
  area?: string;
  region: string;
  quiosco: string;
  estado: string;
  empresa: string;
  genero: "H" | "M";
  talla: string;
  manager: string | null;
  managerName: string | null;
  avatar: AvatarData;
  hiredAt: string;
  hireMonths: number;
  status: UserStatus;
  laptop: string | null;
  tablets: string[];
  access: string[];
  phone: string;
  hubspot: string | null;
  dealOwner?: boolean;
}

// ── Recruiting ────────────────────────────────────────────────────────────

export type StageGroup = "offer" | "documents" | "contract" | "accounts" | "induction" | "rejected";

export interface Stage {
  id: string;
  label: string;
  group: StageGroup;
  color: string;
  bg: string;
  desc: string;
}

export interface GroupMeta {
  label: string;
  color: string;
  bg: string;
}

export interface DocType {
  id: string;
  label: string;
  required: boolean;
  condition?: string;
}

export type DocStatus = "ok" | "pending" | "review" | "rejected" | "na";

export interface CandidateDoc {
  id: string;
  status: DocStatus;
  note?: string;
}

export interface FormAnswer {
  questionId: string;
  value: string | boolean;
}

export interface TimelineEvent {
  state: "done" | "current" | "pending";
  title: string;
  who?: string;
  when: string;
  note?: string;
}

export interface Candidate {
  id: string;
  first: string;
  last: string;
  fullName: string;
  position: string;
  region: string;
  quiosco: string;
  estado: string;
  stage: string;
  recruiter: string;
  createdAt: string;
  avatar: AvatarData;
  docs: CandidateDoc[];
  answers: FormAnswer[];
  timeline: TimelineEvent[];
  salary?: string;
  startDate?: string;
  phone?: string;
  email?: string;
  viterbitId?: string;
}

// ── Tickets ───────────────────────────────────────────────────────────────

export type TicketKind = "offboarding" | "import" | "transfer" | "suspend" | "access";
export type TicketStatus = "in_progress" | "approved" | "rejected" | "completed";

export interface Approval {
  role: string;
  who: string;
  state: "pending" | "approved" | "rejected";
}

export interface Ticket {
  id: string;
  kind: TicketKind;
  userId: string;
  reason: string;
  lastDay: string;
  createdAt: string;
  createdBy: string;
  status: TicketStatus;
  progress: number;
  approvals: Approval[];
  timeline: TimelineEvent[];
}

// ── Nav ───────────────────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  icon: string;
}
