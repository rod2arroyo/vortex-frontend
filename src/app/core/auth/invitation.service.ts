import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`; // Base URL

  /**
   * Genera un link de invitación único (Cualquiera con el link se une)
   */
  createInvitationLink(teamId: string): Observable<{ link_token: string }> {
    return this.http.post<{ link_token: string }>(`${this.apiUrl}/invitations/teams/${teamId}/link`, {});
  }

  /**
   * Invita a un usuario específico por su Nick de Vortex
   */
  inviteUserByNick(teamId: string, nick: string): Observable<{ message: string }> {
    // El backend espera un body JSON: {"nick": "Faker"}
    return this.http.post<{ message: string }>(`${this.apiUrl}/invitations/teams/${teamId}/invite`, { nick });
  }

  /**
   * Acepta una invitación dado un token
   */
  acceptInvitation(token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/invitations/${token}/accept`, {});
  }
}
