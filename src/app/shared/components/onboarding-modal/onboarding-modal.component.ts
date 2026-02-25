import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/auth/user.service';
import { AMERICAN_COUNTRIES } from '../../constants/countries';
import { UserOnboardingRequest } from '../../../core/models/auth.model';

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

  finished = output<void>();
  countries = AMERICAN_COUNTRIES;

  // Formulario con validaciones estrictas
  onboardingForm = this.fb.nonNullable.group({
    internal_nick: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
    country: ['', [Validators.required]],
    phone_code: [{value: '', disabled: true}, [Validators.required]], // Disabled visualmente, pero lo necesitamos
    phone_number: ['', [Validators.required, Validators.pattern(/^\d{7,15}$/)]],
    discord_id: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(32)]]
  });

  onCountryChange(event: any) {
    const selectedCode = event.target.value; // Ej: "PE"
    const countryData = this.countries.find(c => c.code === selectedCode);

    if (countryData) {
      // Seteamos el código telefónico (Ej: "+51")
      this.onboardingForm.controls.phone_code.setValue(countryData.dial_code);
    }
  }

  submit() {
    if (this.onboardingForm.valid) {
      // getRawValue() incluye campos deshabilitados (importante para phone_code)
      const raw = this.onboardingForm.getRawValue();

      // Mapeamos exactamente a la interfaz UserOnboardingRequest
      const payload: UserOnboardingRequest = {
        internal_nick: raw.internal_nick,
        country: raw.country,
        phone_country_code: raw.phone_code, // Ahora se envía separado
        phone_number: raw.phone_number,     // Ahora se envía separado
        discord_id: raw.discord_id
      };

      this.userService.completeOnboarding(payload).subscribe({
        next: () => {
          this.finished.emit();
          location.reload();
        },
        error: (err) => console.error('Error en onboarding', err)
      });
    }
  }
}
