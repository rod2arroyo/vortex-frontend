import { Component, inject, signal, effect } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UserService } from '../../../core/auth/user.service';

@Component({
  selector: 'vortex-account-settings',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './account-settings.component.html',
})
export class AccountSettingsComponent {
  private fb = inject(NonNullableFormBuilder);
  private userService = inject(UserService);
  private messageService = inject(MessageService);

  isLoading = signal<boolean>(false);
  currentUser = this.userService.currentUser;

  profileForm = this.fb.group({
    internal_nick: ['', [Validators.required, Validators.minLength(3)]],
    country: [''],
    whatsapp: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]]
  });

  constructor() {
    // 3. Ahora el effect funcionará porque currentUser ya existe
    effect(() => {
      const user = this.currentUser();

      if (user) {
        this.profileForm.patchValue({
          // El " || '' " es vital por si el dato viene null
          internal_nick: user.internal_nick || '',
          country: user.country || '',
          whatsapp: user.whatsapp || ''
        });
      }
    });
  }

  saveChanges() {
    if (this.profileForm.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    const data = this.profileForm.getRawValue();

    this.userService.updateProfile(data).subscribe({
      next: () => {
        this.isLoading.set(false);
        // Toast de Éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Guardado',
          detail: 'Tu perfil ha sido actualizado correctamente.'
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        // Toast de Error
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron guardar los cambios.'
        });
      }
    });
  }
}
