import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}`; // Base URL

  createInvitationLink(teamId: string): Observable<{ link_token: string }> {
    return this.http.post<{ link_token: string }>(`${this.apiUrl}/invitations/teams/${teamId}/link`, {});
  }

  inviteUserByNick(teamId: string, nick: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/invitations/teams/${teamId}/invite`, { nick });
  }

  acceptInvitation(token: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/invitations/${token}/accept`, {});
  }
}
