import { Component, AfterViewInit, ViewChild, ElementRef, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AuthService} from '../../../core/auth/auth.service';
import {UserService} from '../../../core/auth/user.service';
import {environment} from '../../../../environments/environments';

@Component({
  selector: 'vortex-login-box', // Asegúrate de que coincida con lo que usas en el HTML
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-box.component.html'
})
export class LoginBoxComponent implements AfterViewInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  // 1. Capturamos el elemento del HTML
  @ViewChild('googleBtnRef') googleBtnElement!: ElementRef;

  isLoading = signal(false);
  loginSuccess = output<void>();

  // 2. Usamos ngAfterViewInit en lugar de ngOnInit
  ngAfterViewInit() {
    // @ts-ignore
    google.accounts.id.initialize({
      client_id: environment.clientId,
      callback: (response: any) => this.handleGoogleLogin(response),
      auto_select: false,
      cancel_on_tap_outside: false
    });

    // 3. Pasamos el nativeElement en lugar de getElementById
    // @ts-ignore
    google.accounts.id.renderButton(
      this.googleBtnElement.nativeElement,
      {
        theme: 'filled_black', // Puedes cambiar a 'filled_blue' si prefieres
        size: 'large',
        width: 350,
        text: 'continue_with',
        shape: 'pill'
      }
    );
  }

  loginWithGoogle() {
    this.isLoading.set(true);
    // @ts-ignore
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        this.isLoading.set(false);
      }
    });
  }

  private handleGoogleLogin(response: any) {
    this.isLoading.set(true);
    const payload = JSON.parse(atob(response.credential.split('.')[1]));

    const googleData = {
      email: payload.email,
      sub: payload.sub,
      name: payload.name
    };

    this.authService.loginWithGoogle(googleData).subscribe({
      next: () => {
        this.userService.fetchUserMe().subscribe(() => {
          this.isLoading.set(false);
          this.loginSuccess.emit();
        });
      },
      error: () => this.isLoading.set(false)
    });
  }
}
