import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeamCreate, TeamResponse, TeamUpdate } from '../models/team.model';
import { environment } from '../../../environments/environments';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/teams`;

  getMyTeams(): Observable<TeamResponse[]> {
    return this.http.get<TeamResponse[]>(`${this.apiUrl}/my-teams`);
  }

  createTeam(data: TeamCreate): Observable<TeamResponse> {
    return this.http.post<TeamResponse>(`${this.apiUrl}/`, data);
  }

  updateTeam(teamId: string, data: TeamUpdate): Observable<TeamResponse> {
    return this.http.patch<TeamResponse>(`${this.apiUrl}/${teamId}`, data);
  }

  removeMember(teamId: string, userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${teamId}/members/${userId}`);
  }

  leaveTeam(teamId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${teamId}/leave`);
  }

  deleteTeam(teamId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${teamId}`);
  }
}
