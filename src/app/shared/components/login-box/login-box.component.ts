import { Component, AfterViewInit, ViewChild, ElementRef, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { UserService } from '../../../core/auth/user.service';
import { environment } from '../../../../environments/environments';
import {Skeleton} from 'primeng/skeleton';

declare var google: any;

@Component({
  selector: 'vortex-login-box',
  standalone: true,
  imports: [CommonModule, Skeleton],
  templateUrl: './login-box.component.html'
})
export class LoginBoxComponent implements AfterViewInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  @ViewChild('googleBtnRef') googleBtnElement!: ElementRef;

  isLoading = signal(false);
  isGoogleLibLoaded = signal(false);
  loginSuccess = output<void>();

  // 2. Usamos ngAfterViewInit en lugar de ngOnInit
  ngAfterViewInit() {
    this.ensureGoogleLibraryLoaded();
  }

  private ensureGoogleLibraryLoaded() {
    // Revisamos periódicamente si Google ya cargó
    const checkInterval = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts) {
        clearInterval(checkInterval);
        this.initGoogleBtn();
      }
    }, 100);
  }

  private initGoogleBtn() {
    try {
      google.accounts.id.initialize({
        client_id: environment.clientId,
        callback: (response: any) => this.handleGoogleLogin(response),
        auto_select: false,
        cancel_on_tap_outside: false
      });

      google.accounts.id.renderButton(
        this.googleBtnElement.nativeElement,
        {
          theme: 'filled_black',
          size: 'large',
          width: 350,
          text: 'continue_with',
          shape: 'pill'
        }
      );

      // Una vez renderizado, apagamos el skeleton
      this.isGoogleLibLoaded.set(true);

    } catch (error) {
      console.error('Error al inicializar Google:', error);
    }
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
