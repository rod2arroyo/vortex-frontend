import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environments';

// --- Interfaces ---
export interface TournamentBase {
  name: string;
  description?: string;
  category: 'Low Elo' | 'High Elo' | 'Open' | string;
  entry_fee: number;
  prize_pool: number;
  max_teams: number;
  start_date?: string; // ISO String
}

export interface TournamentCreate extends TournamentBase {}

export interface TournamentUpdate extends Partial<TournamentBase> {
  status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface TournamentResponse extends TournamentBase {
  id: string;
  status: string;
  registered_teams_count?: number; // Propiedad computada del backend
}

@Injectable({ providedIn: 'root' })
export class TournamentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tournaments`;

  // Público: Listar torneos
  getAll(skip = 0, limit = 20): Observable<TournamentResponse[]> {
    return this.http.get<TournamentResponse[]>(`${this.apiUrl}/?skip=${skip}&limit=${limit}`);
  }

  // Admin: Crear
  create(data: TournamentCreate): Observable<TournamentResponse> {
    return this.http.post<TournamentResponse>(`${this.apiUrl}/`, data);
  }

  // Admin: Actualizar
  update(id: string, data: TournamentUpdate): Observable<TournamentResponse> {
    return this.http.patch<TournamentResponse>(`${this.apiUrl}/${id}`, data);
  }
}
