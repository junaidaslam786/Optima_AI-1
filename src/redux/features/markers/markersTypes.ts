export interface Marker {
  id: string;
  panel_id: string;
  marker: string;
  unit: string;
  normal_low?: number;
  normal_high?: number;
  created_at: string;
  updated_at: string;
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
