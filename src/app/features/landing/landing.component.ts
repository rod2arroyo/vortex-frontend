import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {AuthService} from '../../core/auth/auth.service';
import {Router} from '@angular/router';
import {environment} from '../../../environments/environments';
import {OnboardingModalComponent} from '../../shared/components/onboarding-modal/onboarding-modal.component';
import {UserService} from '../../core/auth/user.service';

@Component({
  selector: 'app-landing',
  imports: [
    OnboardingModalComponent
  ],
  templateUrl: './landing.component.html',
})
export class LandingComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  // Signals de estado
  isLoading = signal(false);
  showOnboarding = signal(false);
  isLoggedIn = computed(() => !!this.userService.currentUser());

  ngOnInit() {
    // 1. Inicializar Google SDK
    // @ts-ignore
    google.accounts.id.initialize({
      client_id: environment.clientId,
      callback: (response: any) => this.handleGoogleLogin(response)
    });

    // 2. NUEVO: Si la app ya arrancó y el usuario está pero no tiene onboarding, mostrar modal
    const user = this.userService.currentUser();
    if (user && !user.is_onboarded) {
      this.showOnboarding.set(true);
    }
  }

  loginWithGoogle() {
    this.isLoading.set(true);
    // @ts-ignore
    google.accounts.id.prompt();
  }

  private handleGoogleLogin(response: any) {
    this.isLoading.set(true);
    const payload = this.decodeJWT(response.credential);

    this.authService.loginWithGoogle({
      email: payload.email,
      sub: payload.sub,
      name: payload.name
    }).subscribe({
      next: () => {
        // Ahora llamamos a getUserMe explícitamente para asegurar que
        // tenemos la respuesta más reciente del servidor antes de decidir
        this.userService.fetchUserMe().subscribe({
          next: (user) => {
            this.isLoading.set(false);
            if (!user.is_onboarded) {
              this.showOnboarding.set(true);
            } else {
              // Si ya está listo, no recargues con location.reload()
              // a menos que sea estrictamente necesario, mejor deja que
              // los signals actualicen la UI.
            }
          }
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  private verifyUserStatus() {
    this.userService.fetchUserMe().subscribe({
      next: (user) => {
        this.isLoading.set(false);
        if (!user.is_onboarded) {
          // Si falta onboarding, abrimos el modal en esta misma página
          this.showOnboarding.set(true);
        } else {
          // Si ya está listo, refrescamos o navegamos según prefieras
          // Como no quieres dashboard aún, podrías simplemente dejar que la UI cambie
          location.reload();
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  private decodeJWT(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }
}
