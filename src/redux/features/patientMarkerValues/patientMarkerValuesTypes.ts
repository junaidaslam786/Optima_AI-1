export interface PatientMarkerValue {
  id: string;
  csvfile_id: string;
  user_id: string;
  marker_id: string;
  col_date: string;
  rep_date: string;
  value: number;
  status: "normal" | "high" | "low" | "critical";
  created_at: string;
  updated_at: string;
}

export interface CreatePatientMarkerValue {
  csvfile_id: string;
  user_id: string;
  marker_id: string;
  col_date?: string;
  rep_date?: string;
  value: number;
  status?: "normal" | "high" | "low" | "critical";
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
