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
    this.token = this.route.snapshot.paramMap.get('token') || '';

    if (!this.isLoggedIn()) {
      this.authService.setPendingInvite(this.token);
    }
  }

  private resolveNotification() {
    const notifId = this.route.snapshot.queryParamMap.get('notif_id');

    if (notifId) {
      this.notificationService.markAsRead(notifId).subscribe({
        error: (err) => console.error('Error marcando notificación', err)
      });
    }
  }

  onAccept() {
    this.isLoading.set(true);
    this.invitationService.acceptInvitation(this.token).subscribe({
      next: (res) => {
        this.resolveNotification();

        this.authService.clearPendingInvite();
        this.router.navigate(['/profile']);
        alert('¡Te has unido al equipo correctamente!');
      },
      error: (err) => {
        this.isLoading.set(false);
        alert(err.error?.detail || 'El enlace ha expirado o no es válido.');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onReject() {
    this.resolveNotification();

    this.authService.clearPendingInvite();
    this.router.navigate(['/profile']);
  }

  openLogin() {
    this.isLoginModalOpen.set(true);
  }
}
