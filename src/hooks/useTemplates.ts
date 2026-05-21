import { useCollection, orderBy } from "@/hooks/useFirestore";

export interface OfferTemplate {
  name: string;
  profileNames: string[];
  positionKeywords: string[];
  salary: string;
  benefits: string;
  startDate: string;
  updatedAt: string;
}

export interface ContractTemplate {
  name: string;
  positionKeywords: string[];
  type: "html" | "pdf";
  pageCount: number;
  hasSignatureFields: boolean;
  hasInitials: boolean;
  updatedAt: string;
}

export interface EmailTemplate {
  type: string;
  name: string;
  subject: string;
  body: string;
  updatedAt: string;
}

export interface FormQuestion {
  label: string;
  type: "radio" | "yes_no" | "select" | "text" | "textarea";
  options?: string[];
  required: boolean;
  enabled: boolean;
  order: number;
  builtinKey?: string;
}

export function useOfferTemplates() {
  return useCollection<OfferTemplate>("templates/offers/items", [orderBy("name")]);
}

export function useContractTemplates() {
  return useCollection<ContractTemplate>("templates/contracts/items", [orderBy("name")]);
}

export function useEmailTemplates() {
  return useCollection<EmailTemplate>("templates/emails/items", [orderBy("type")]);
}

export function useFormQuestions() {
  return useCollection<FormQuestion>("templates/formConfig/questions", [orderBy("order")]);
}
