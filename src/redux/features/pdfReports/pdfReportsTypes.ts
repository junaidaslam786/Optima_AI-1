export interface PdfReport {
  id: string; // UUID
  user_id: string; // UUID, FK to users
  panel_id: string; // UUID, FK to panels
  report_url: string;
  generated_at: string; // DATE
}

export interface CreatePdfReport {
  user_id: string;
  panel_id: string;
  report_url: string;
  generated_at?: string; // DEFAULT CURRENT_DATE
}

export interface UpdatePdfReport {
  id: string;
  user_id?: string;
  panel_id?: string;
  report_url?: string;
  generated_at?: string;
}
