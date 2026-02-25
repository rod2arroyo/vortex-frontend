import { Component, computed, effect, inject, signal } from '@angular/core';
import { OnboardingModalComponent } from '../../shared/components/onboarding-modal/onboarding-modal.component';
import { UserService } from '../../core/auth/user.service';
import { LoginBoxComponent } from '../../shared/components/login-box/login-box.component';

@Component({
  selector: 'app-landing',
  imports: [
    OnboardingModalComponent,
    LoginBoxComponent
  ],
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  private userService = inject(UserService);

  isLoading = signal(false);
  showOnboarding = signal(false);

  isLoggedIn = computed(() => !!this.userService.currentUser());

  constructor() {
    effect(() => {
      const user = this.userService.currentUser();

      if (user && !user.is_onboarded) {
        this.showOnboarding.set(true);
      }
    });
  }
  handleSuccessfulLogin() {
    console.log('Login exitoso: El effect se encargará del resto.');
  }
}
