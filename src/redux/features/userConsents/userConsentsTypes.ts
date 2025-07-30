export interface UserConsent {
  id: string;
  user_id?: string | null;
  consent_timestamp: string;
  consent_version: string;
  consent_type: string;
  agreed: boolean;
  ip_address?: string | null;
  user_agent?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserConsent {
  user_id?: string | null;
  consent_version: string;
  consent_type: string;
  agreed: boolean;
  user_agent?: string;
  notes?: string;
}

export interface GetUserConsentParams {
  userId: string;
  consent_type?: string;
  latest_only?: boolean;
}