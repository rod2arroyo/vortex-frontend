import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environments';
import {Observable, tap} from 'rxjs';
import {User} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  // --- Estado del Usuario ---
  // Inicializamos con lo que haya en storage para evitar parpadeos
  private user = signal<any | null>(JSON.parse(localStorage.getItem('vortex_user') || 'null'));

  // Selector público
  currentUser = this.user.asReadonly();

  // --- API Calls ---

  fetchUserMe(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/users/me`).pipe(
      tap(userData => this.updateLocalUser(userData))
    );
  }

  updateProfile(data: any): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/users/update`, data).pipe(
      tap(userData => this.updateLocalUser(userData))
    );
  }

  completeOnboarding(data: any): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users/onboarding`, data).pipe(
      tap(userData => this.updateLocalUser(userData))
    );
  }

  // --- Manejo de Estado Local ---

  private updateLocalUser(userData: User) {
    this.user.set(userData);
    localStorage.setItem('vortex_user', JSON.stringify(userData));
  }

  // Método llamado por AuthService al hacer logout
  clearUser() {
    this.user.set(null);
    localStorage.removeItem('vortex_user');
  }
}
