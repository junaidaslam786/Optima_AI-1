export interface PartnerProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_slug: string;
  company_description?: string;
  contact_person_name?: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  country?: string;
  partner_status:
    | "pending"
    | "approved"
    | "rejected"
    | "suspended"
    | "deactivated";
  approval_date?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePartnerProfile {
  user_id: string;
  company_name: string;
  company_slug: string;
  company_description?: string;
  contact_person_name?: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  country?: string;
  partner_status?:
    | "pending"
    | "approved"
    | "rejected"
    | "suspended"
    | "deactivated";
  approval_date?: string;
  rejection_reason?: string;
  notes?: string;
}

export interface UpdatePartnerProfile {
  id: string;
  user_id?: string;
  company_name?: string;
  company_slug?: string;
  company_description?: string;
  contact_person_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  country?: string;
  partner_status?:
    | "pending"
    | "approved"
    | "rejected"
    | "suspended"
    | "deactivated";
  approval_date?: string;
  rejection_reason?: string;
  notes?: string;
}
