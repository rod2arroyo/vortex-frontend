export interface TeamMemberResponse {
  user_id: string;
  joined_at: string;
  riot_id_full?: string; // Nuevo campo que viene de la @property
}

export interface TeamResponse {
  id: string;
  name: string;
  tag: string;           // NUEVO
  description?: string;  // NUEVO
  captain_id: string;
  logo_url?: string;
  created_at: string;    // NUEVO
  members: TeamMemberResponse[];
}

export interface TeamCreate {
  name: string;
  tag: string;           // NUEVO
  description?: string;  // NUEVO
}

export interface TeamUpdate {
  name?: string;
  description?: string;
  logo_url?: string;
}
