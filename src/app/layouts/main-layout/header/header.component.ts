import {Component, computed, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AuthService} from '../../../core/auth/auth.service';
import {LoginModalComponent} from '../../../shared/components/login-modal/login-modal.component';
import {UserService} from '../../../core/auth/user.service';

@Component({
  selector: 'vortex-header',
  imports: [
    RouterLink,
    LoginModalComponent
  ],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  public userService = inject(UserService);
  public authService = inject(AuthService);

  // Estado local para abrir el pop-up
  isLoginModalOpen = signal(false);

  // Computed para facilitar el uso en el a
  currentUser = computed(() => this.userService.currentUser());
  isLoggedIn = computed(() => !!this.currentUser());

  openLogin() {
    this.isLoginModalOpen.set(true);
  }
}
