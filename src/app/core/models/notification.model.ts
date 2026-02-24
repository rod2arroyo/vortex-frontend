export interface NotificationResponse {
  id: string;
  user_id: string;
  type: 'TEAM_INVITE' | 'PAYMENT_SUCCESS' | 'MATCH_START' | 'TOURNAMENT_NEW' | string;
  title: string;
  message: string;
  data?: any; // Para guardar team_id, tournament_id, etc.
  is_read: boolean;
  created_at: string;
}
