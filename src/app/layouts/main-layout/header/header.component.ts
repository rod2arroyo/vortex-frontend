import {Component, computed, effect, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AuthService} from '../../../core/auth/auth.service';
import {LoginModalComponent} from '../../../shared/components/login-modal/login-modal.component';
import {UserService} from '../../../core/auth/user.service';
import {DatePipe, NgClass} from '@angular/common';
import {NotificationService} from '../../../core/auth/notification.service';
import {NotificationResponse} from '../../../core/models/notification.model';

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

  // Estado local para abrir el pop-up
  isLoginModalOpen = signal(false);
  showNotifications = signal(false); // Controla el dropdown

  // Datos
  notifications = signal<NotificationResponse[]>([]);

  // Computed para facilitar el uso en el a
  currentUser = computed(() => this.userService.currentUser());
  isLoggedIn = computed(() => !!this.currentUser());

  unreadCount = computed(() =>
    this.notifications().filter(n => !n.is_read).length
  );

  constructor() {
    // Si el usuario se loguea, cargamos notificaciones automáticamente
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
      this.loadNotifications(); // Recargar al abrir para tener datos frescos
    }
  }

  markRead(notification: NotificationResponse) {
    if (notification.is_read) return;

    // Optimistic UI: Actualizamos localmente primero para que se sienta instantáneo
    this.notifications.update(list =>
      list.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
    );

    // Llamada al backend
    this.notificationService.markAsRead(notification.id).subscribe();
  }

  // Helper para asignar iconos según el tipo (basado en tu imagen)
  getIconByType(type: string): string {
    switch (type) {
      case 'TEAM_INVITE': return 'group_add';
      case 'PAYMENT_SUCCESS': return 'check_circle';
      case 'MATCH_START': return 'schedule'; // Reloj
      case 'TOURNAMENT_NEW': return 'emoji_events'; // Trofeo
      default: return 'notifications';
    }
  }

  // Helper para colores de fondo del icono
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
}
