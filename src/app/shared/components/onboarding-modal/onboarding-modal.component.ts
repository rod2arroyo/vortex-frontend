import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/auth/user.service';

@Component({
  selector: 'vortex-onboarding-modal',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './onboarding-modal.component.html',
})
export class OnboardingModalComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  // Usamos un output para avisar a la Landing que ya terminamos
  finished = output<void>();

  onboardingForm = this.fb.nonNullable.group({
    internal_nick: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
    whatsapp: ['', [Validators.required]],
    country: ['', [Validators.required]]
  });

  submit() {
    if (this.onboardingForm.valid) {
      this.userService.completeOnboarding(this.onboardingForm.getRawValue()).subscribe({
        next: () => {
          this.finished.emit(); // Avisamos que terminó
          location.reload();    // Refrescamos para mostrar el estado logueado
        }
      });
    }
  }
}
