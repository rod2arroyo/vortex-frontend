import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { InvitationService } from '../../../core/auth/invitation.service';
import {LoginModalComponent} from '../../../shared/components/login-modal/login-modal.component';
import {NotificationService} from '../../../core/auth/notification.service';

@Component({
  selector: 'app-invite-landing',
  imports: [
    LoginModalComponent
  ],
  templateUrl: './invite-landing.component.html',
})
export class InviteLandingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private invitationService = inject(InvitationService);
  private notificationService = inject(NotificationService); // 2. Inyectar

  token = '';
  isLoading = signal(false);
  isLoginModalOpen = signal(false);
  isLoggedIn = this.authService.isLoggedIn;

  constructor() {
    effect(() => {
      if (this.isLoggedIn()) {
        this.isLoginModalOpen.set(false);
      }
    });
  }

  ngOnInit() {
    // Obtenemos el token de la ruta principal (ej: /invite/ABC-123)
    this.token = this.route.snapshot.paramMap.get('token') || '';

    if (!this.isLoggedIn()) {
      this.authService.setPendingInvite(this.token);
    }
  }

  // --- Helper para limpiar la notificación ---
  private resolveNotification() {
    // Buscamos si en la URL vino un ?notif_id=XYZ
    const notifId = this.route.snapshot.queryParamMap.get('notif_id');

    if (notifId) {
      // Marcamos como leída en segundo plano (fire & forget)
      this.notificationService.markAsRead(notifId).subscribe({
        error: (err) => console.error('Error marcando notificación', err)
      });
    }
  }

  onAccept() {
    this.isLoading.set(true);
    this.invitationService.acceptInvitation(this.token).subscribe({
      next: (res) => {
        // 3. Al aceptar con éxito, marcamos la notificación como leída
        this.resolveNotification();

        this.authService.clearPendingInvite();
        this.router.navigate(['/profile']);
        alert('¡Te has unido al equipo correctamente!');
      },
      error: (err) => {
        this.isLoading.set(false);
        // Incluso si falla (ej: ya eras miembro), podríamos querer borrar la notificación
        // para que no siga molestando, pero eso depende de tu lógica.
        // Por seguridad, aquí NO la borramos para que el usuario pueda intentar de nuevo.
        alert(err.error?.detail || 'El enlace ha expirado o no es válido.');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onReject() {
    // 4. Si rechaza, también queremos que desaparezca de la lista
    this.resolveNotification();

    this.authService.clearPendingInvite();
    this.router.navigate(['/profile']);
  }

  openLogin() {
    this.isLoginModalOpen.set(true);
  }
}
