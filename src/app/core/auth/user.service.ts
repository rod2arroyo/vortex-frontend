import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environments';
import { Observable, tap } from 'rxjs';
import { User, UserOnboardingRequest, UserUpdateRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  private user = signal<User | null>(this.getUserFromStorage());

  currentUser = this.user.asReadonly();

  fetchUserMe(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(userData => this.updateLocalUser(userData))
    );
  }
  completeOnboarding(data: UserOnboardingRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/onboarding`, data).pipe(
      tap(userData => this.updateLocalUser(userData))
    );
  }

  updateProfile(data: UserUpdateRequest): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/update`, data).pipe(
      tap(userData => this.updateLocalUser(userData))
    );
  }

  private updateLocalUser(userData: User) {
    this.user.set(userData);
    localStorage.setItem('vortex_user', JSON.stringify(userData));
  }

  private getUserFromStorage(): User | null {
    const stored = localStorage.getItem('vortex_user');
    return stored ? JSON.parse(stored) : null;
  }

  clearUser() {
    this.user.set(null);
    localStorage.removeItem('vortex_user');
  }
}
