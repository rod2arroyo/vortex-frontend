import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, Observable, lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environments';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private router = inject(Router);
  private pendingInviteToken = signal<string | null>(null);

  private accessToken = signal<string | null>(null);
  private refreshToken = signal<string | null>(localStorage.getItem('vortex_refresh'));

  isLoggedIn = computed(() => !!this.accessToken());

  public async bootstrapAuth(): Promise<void> {
    const refresh = this.refreshToken();
    if (!refresh) return Promise.resolve();

    try {
      const res = await lastValueFrom(this.refreshTokenCall());
      this.setTokens(res);
      await lastValueFrom(this.userService.fetchUserMe());
    } catch (err) {
      this.clearSession();
    }
  }

  private clearSession() {
    this.accessToken.set(null);
    this.refreshToken.set(null);
    localStorage.removeItem('vortex_refresh');
    this.userService.clearUser();
  }

  logout() {
    this.clearSession();
    this.router.navigate(['/dashboard']);
  }

  private setTokens(res: any) {
    this.accessToken.set(res.access_token);
    this.refreshToken.set(res.refresh_token);
    localStorage.setItem('vortex_refresh', res.refresh_token);
  }

  loginWithGoogle(googleData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/google`, googleData).pipe(
      tap(res => {
        this.setTokens(res);
        this.userService.fetchUserMe().subscribe();
      })
    );
  }

  getAccessToken() { return this.accessToken(); }

  public refreshTokenCall(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/refresh`, {
      refresh_token: this.refreshToken()
    });
  }

  setPendingInvite(token: string) {
    this.pendingInviteToken.set(token);
    sessionStorage.setItem('vortex_pending_invite', token);
  }

  getPendingInvite(): string | null {
    return this.pendingInviteToken() || sessionStorage.getItem('vortex_pending_invite');
  }

  clearPendingInvite() {
    this.pendingInviteToken.set(null);
    sessionStorage.removeItem('vortex_pending_invite');
  }
}
