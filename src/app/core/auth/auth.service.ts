import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, Observable, lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environments';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  // Inyectamos UserService para actualizar el estado del usuario tras el login
  private userService = inject(UserService);
  private router = inject(Router);

  // --- Estado de Tokens ---
  private accessToken = signal<string | null>(null);
  private refreshToken = signal<string | null>(localStorage.getItem('vortex_refresh'));

  // --- Selectores ---
  // Auth solo dice SI/NO está logueado, no le importa el nickname
  isLoggedIn = computed(() => !!this.accessToken() || !!this.refreshToken());

  constructor() {
    // Intentar recuperar sesión al iniciar
    this.bootstrapAuth();
  }

  public async bootstrapAuth() {
    const refresh = this.refreshToken();
    if (!refresh) return;

    try {
      const res = await lastValueFrom(this.refreshTokenCall());
      this.setTokens(res);
      // Delegamos la carga de datos al UserService
      await lastValueFrom(this.userService.fetchUserMe());
    } catch (err) {
      this.logout();
    }
  }

  loginWithGoogle(googleData: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/google`, googleData).pipe(
      tap(res => {
        this.setTokens(res);
        // Al loguear, pedimos los datos del usuario
        this.userService.fetchUserMe().subscribe();
      })
    );
  }

  logout() {
    // 1. Limpieza de tokens y storage
    this.accessToken.set(null);
    this.refreshToken.set(null);
    localStorage.removeItem('vortex_refresh');

    // 2. Limpieza del estado de usuario
    this.userService.clearUser();

    // 3. Redirección forzada al Dashboard
    this.router.navigate(['/dashboard']);
  }

  // Utilidad interna para guardar tokens
  private setTokens(res: any) {
    this.accessToken.set(res.access_token);
    this.refreshToken.set(res.refresh_token);
    localStorage.setItem('vortex_refresh', res.refresh_token);
  }

  getAccessToken() { return this.accessToken(); }

  public refreshTokenCall(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/refresh`, {
      refresh_token: this.refreshToken()
    });
  }
}
