import {Component, computed, effect, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../core/auth/auth.service';
import {LoginModalComponent} from '../../../shared/components/login-modal/login-modal.component';
import {UserService} from '../../../core/auth/user.service';
import {DatePipe, NgClass} from '@angular/common';
import {NotificationService} from '../../../core/auth/notification.service';
import {NotificationResponse} from '../../../core/models/notification.model';
import {InvitationService} from '../../../core/auth/invitation.service';

@Component({
  selector: 'vortex-header',
  imports: [
    RouterLink,
    LoginModalComponent,
    NgClass,
    DatePipe
  ],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  public userService = inject(UserService);
  public authService = inject(AuthService);
  public notificationService = inject(NotificationService);
  private invitationService = inject(InvitationService);
  private router = inject(Router);

  isLoginModalOpen = signal(false);
  showNotifications = signal(false);

  notifications = signal<NotificationResponse[]>([]);

  currentUser = computed(() => this.userService.currentUser());
  isLoggedIn = computed(() => !!this.currentUser());

  unreadCount = computed(() =>
    this.notifications().filter(n => !n.is_read).length
  );

  isAdmin = computed(() => {
    const user = this.userService.currentUser();
    console.warn(user)
    return user?.role === 'admin';
  });

  constructor() {
    effect(() => {
      if (this.isLoggedIn()) {
        this.loadNotifications();
      }
    });
  }

  loadNotifications() {
    this.notificationService.getMyNotifications().subscribe({
      next: (data) => this.notifications.set(data),
      error: (err) => console.error('Error cargando notificaciones', err)
    });
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
    if (this.showNotifications()) {
      this.loadNotifications();
    }
  }

  markRead(notification: NotificationResponse) {
    if (notification.is_read) return;
    this.notifications.update(list =>
      list.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
    );
    this.notificationService.markAsRead(notification.id).subscribe();
  }

  /**
   * Elimina la notificación visualmente y en el backend
   */
  removeNotification(event: Event, notificationId: string) {
    event.stopPropagation(); // Evita marcar como leído o abrir detalles

    // 1. Optimistic Update: Lo sacamos de la lista inmediatamente
    this.notifications.update(list => list.filter(n => n.id !== notificationId));

    // 2. Llamada al backend
    this.notificationService.deleteNotification(notificationId).subscribe({
      error: (err) => {
        console.error('Error eliminando notificación', err);
        // Opcional: Revertir si falla (volver a cargar)
        this.loadNotifications();
      }
    });
  }

  // Actualizado para devolver clases de PrimeIcons
  getIconByType(type: string): string {
    switch (type) {
      case 'TEAM_INVITE': return 'pi-users';
      case 'PAYMENT_SUCCESS': return 'pi-check-circle';
      case 'MATCH_START': return 'pi-clock';
      case 'TOURNAMENT_NEW': return 'pi-trophy';
      default: return 'pi-bell'; // Icono por defecto (Campana)
    }
  }

  getIconBgColor(type: string): string {
    switch (type) {
      case 'TEAM_INVITE': return 'bg-indigo-500';
      case 'PAYMENT_SUCCESS': return 'bg-green-500';
      case 'MATCH_START': return 'bg-orange-500';
      case 'TOURNAMENT_NEW': return 'bg-pink-500';
      default: return 'bg-gray-700';
    }
  }

  openLogin() {
    this.isLoginModalOpen.set(true);
  }

  onAcceptInvite(notification: NotificationResponse, event: Event) {
    event.stopPropagation(); // Evita que se dispare el click del contenedor (markRead)
    const token = notification.data?.token;
    const teamId = notification.data?.team_id;

    if (!token) {
      alert('Error: La invitación no contiene un token válido.');
      return;
    }

    this.invitationService.acceptInvitation(token).subscribe({
      next: (res) => {
        alert(res.message || '¡Te has unido al equipo exitosamente!');
        this.markRead(notification);

        if (teamId) {
          this.router.navigate(['/teams', teamId]);
          this.showNotifications.set(false);
        }
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.detail || 'Ocurrió un error al aceptar la invitación.');
      }
    });
  }
}
