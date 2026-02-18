import {Component, inject, OnInit, output, signal} from '@angular/core';
import {AuthService} from '../../../core/auth/auth.service';
import {environment} from '../../../../environments/environments';
import {UserService} from '../../../core/auth/user.service';

@Component({
  selector: 'vortex-login-modal',
  imports: [],
  templateUrl: './login-modal.component.html',
})
export class LoginModalComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  isLoading = signal(false);
  close = output<void>(); // Para cerrar el modal

  ngOnInit() {
    // @ts-ignore
    google.accounts.id.initialize({
      client_id: environment.clientId,
      callback: (response: any) => this.handleGoogleLogin(response)
    });
  }

  loginWithGoogle() {
    this.isLoading.set(true);
    // @ts-ignore
    google.accounts.id.prompt();
  }

  private handleGoogleLogin(response: any) {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const googleData = { email: payload.email, sub: payload.sub, name: payload.name };

    this.authService.loginWithGoogle(googleData).subscribe({
      next: () => {
        this.userService.fetchUserMe().subscribe(() => {
          this.isLoading.set(false);
          this.close.emit(); // Cerramos el modal al terminar
          // Si no tiene onboarding, la Landing (que también escucha al servicio) lo disparará
        });
      },
      error: () => this.isLoading.set(false)
    });
  }
}
