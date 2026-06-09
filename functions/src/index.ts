import * as admin from "firebase-admin";

admin.initializeApp();

export {
  sendCandidateInvitation,
  approveExpediente,
  rejectExpediente,
  onCandidateStageChange,
} from "./candidates";

export {
  provisionUser,
  deprovisionUser,
} from "./users";

export {
  submitOffboardingApproval,
  executeOffboarding,
  onOffboardingTicketCreated,
} from "./tickets";

export { dailyIntegrationSync } from "./integrationSync";
