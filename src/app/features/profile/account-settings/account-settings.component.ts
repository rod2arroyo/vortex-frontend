import { Component, inject, signal, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UserService } from '../../../core/auth/user.service';
import { UserUpdateRequest } from '../../../core/models/auth.model';
import {AMERICAN_COUNTRIES} from '../../../shared/constants/countries';

@Component({
  selector: 'vortex-account-settings',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './account-settings.component.html',
})
export class AccountSettingsComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private messageService = inject(MessageService);

  isLoading = signal<boolean>(false);
  currentUser = this.userService.currentUser;

  // 1. Variable para guardar el estado original
  private initialFormValues: any = null;

  countries = AMERICAN_COUNTRIES;

  profileForm = this.fb.group({
    internal_nick: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
    country: [''],
    phone_country_code: [''],
    phone_number: ['', [Validators.pattern(/^\d{7,15}$/)]],
    discord_id: ['', [Validators.minLength(2), Validators.maxLength(32)]]
  });

  constructor() {
    effect(() => {
      const user = this.currentUser();

      if (user) {
        // Preparamos los datos
        const formValues = {
          internal_nick: user.internal_nick || '',
          country: user.country || '',
          phone_country_code: user.phone_country_code || '',
          phone_number: user.phone_number || '',
          discord_id: user.discord_id || ''
        };

        // Llenamos el formulario
        this.profileForm.patchValue(formValues, { emitEvent: false });

        // 2. Guardamos la "foto" del estado inicial
        this.initialFormValues = formValues;
      }
    });
  }

  // 3. Getter para detectar cambios reales
  get hasChanges(): boolean {
    // Si no hay datos iniciales cargados, no hay cambios
    if (!this.initialFormValues) return false;

    // Obtenemos los valores actuales
    const currentValues = this.profileForm.getRawValue();

    // Comparamos convirtiendo a string (es la forma más rápida para objetos planos)
    return JSON.stringify(currentValues) !== JSON.stringify(this.initialFormValues);
  }

  onCountryChange(event: any) {
    const selectedCode = event.target.value;
    const countryData = this.countries.find(c => c.code === selectedCode);

    if (countryData) {
      this.profileForm.patchValue({phone_country_code: countryData.dial_code});
      // Importante: Marcar como 'dirty' para que Angular sepa que hubo interacción
      this.profileForm.markAsDirty();
    }
  }

  saveChanges() {
    // Agregamos !this.hasChanges a la validación por seguridad
    if (this.profileForm.invalid || this.isLoading() || !this.hasChanges) return;

    this.isLoading.set(true);
    const formData = this.profileForm.value;

    const payload: UserUpdateRequest = {
      internal_nick: formData.internal_nick || undefined,
      country: formData.country || undefined,
      phone_country_code: formData.phone_country_code || undefined,
      phone_number: formData.phone_number || undefined,
      discord_id: formData.discord_id || undefined
    };

    this.userService.updateProfile(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Guardado',
          detail: 'Tu perfil ha sido actualizado correctamente.'
        });
        // IMPORTANTE: Al guardar con éxito, el 'effect' se volverá a disparar
        // porque el currentUser cambiará, actualizando automáticamente
        // el 'initialFormValues' al nuevo valor.
      },
      error: (err) => {
        this.isLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.detail || 'No se pudieron guardar los cambios.'
        });
      }
    });
  }
}
