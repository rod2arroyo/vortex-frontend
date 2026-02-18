import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environments';
import {Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private http = inject(HttpClient);

  linkRiotAccount(region: string, riot_nick: string, riot_tag: string): Observable<any> {
    const params = { region, riot_nick, riot_tag };
    return this.http.post(`${environment.apiUrl}/players/link-riot`, null, { params });
  }

  getRiotProfile(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/players/riot-profile`);
  }

  // Aquí podrías agregar métodos futuros como:
  // getTournamentHistory()
  // getTeamStats()
}
