export interface PatientMarkerValue {
  id: string; // UUID
  csvfile_id: string; // UUID, FK to uploads
  user_id: string; // UUID, FK to users
  marker_id: string; // UUID, FK to markers
  col_date: string; // DATE
  rep_date: string; // DATE
  value: number; // NUMERIC
  status: "normal" | "high" | "low" | "critical";
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface CreatePatientMarkerValue {
  csvfile_id: string;
  user_id: string;
  marker_id: string;
  col_date?: string; // DEFAULT now()
  rep_date?: string; // DEFAULT now()
  value: number;
  status?: "normal" | "high" | "low" | "critical"; // DEFAULT 'normal'
}

export interface UpdatePatientMarkerValue {
  id: string;
  csvfile_id?: string;
  user_id?: string;
  marker_id?: string;
  col_date?: string;
  rep_date?: string;
  value?: number;
  status?: "normal" | "high" | "low" | "critical";
}
