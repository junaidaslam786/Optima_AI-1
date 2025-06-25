export interface Marker {
  id: string; // UUID
  panel_id: string; // UUID, FK to panels
  marker: string;
  unit: string;
  normal_low?: number; // NUMERIC
  normal_high?: number; // NUMERIC
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface CreateMarker {
  panel_id: string;
  marker: string;
  unit: string;
  normal_low?: number;
  normal_high?: number;
}

export interface UpdateMarker {
  id: string;
  panel_id?: string;
  marker?: string;
  unit?: string;
  normal_low?: number;
  normal_high?: number;
}
