import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {OnboardingModalComponent} from '../../shared/components/onboarding-modal/onboarding-modal.component';
import {UserService} from '../../core/auth/user.service';
import {LoginBoxComponent} from '../../shared/components/login-box/login-box.component';

@Component({
  selector: 'app-landing',
  imports: [
    OnboardingModalComponent,
    LoginBoxComponent
  ],
  templateUrl: './landing.component.html',
})
export class LandingComponent implements OnInit {
  private userService = inject(UserService);

  // Signals de estado
  isLoading = signal(false);
  showOnboarding = signal(false);
  isLoggedIn = computed(() => !!this.userService.currentUser());

  ngOnInit() {
    // Ya NO necesitas inicializar Google aquí.
    this.checkOnboardingStatus();
  }

  handleSuccessfulLogin() {
    this.checkOnboardingStatus();
  }

  private checkOnboardingStatus() {
    const user = this.userService.currentUser();
    if (user && !user.is_onboarded) {
      this.showOnboarding.set(true);
    }
  }
}
