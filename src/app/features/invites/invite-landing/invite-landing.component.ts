import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { InvitationService } from '../../../core/auth/invitation.service';
import {LoginModalComponent} from '../../../shared/components/login-modal/login-modal.component';

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

  token = '';
  isLoading = signal(false);
  isLoginModalOpen = signal(false);

  // Estado reactivo de sesión
  isLoggedIn = this.authService.isLoggedIn; // Asumiendo que expusiste el computed en AuthService

  constructor() {
    // EFECTO: Si el usuario se loguea mientras está en esta pantalla,
    // el estado cambiará automáticamente y mostrará los botones de aceptar/rechazar.
    effect(() => {
      if (this.isLoggedIn()) {
        this.isLoginModalOpen.set(false);
      }
    });
  }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    console.warn(this.isLoggedIn());
    // Si NO está logueado, guardamos el token para que no se pierda si recarga
    if (!this.isLoggedIn()) {
      this.authService.setPendingInvite(this.token);
    }
  }

  onAccept() {
    this.isLoading.set(true);
    this.invitationService.acceptInvitation(this.token).subscribe({
      next: (res) => {
        this.authService.clearPendingInvite();
        // Redirigir al dashboard o mejor aún, a mis equipos para ver el nuevo
        // Lo ideal sería que el backend devuelva el team_id en la respuesta del accept
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
    // Simplemente limpiamos y nos vamos al perfil
    this.authService.clearPendingInvite();
    this.router.navigate(['/profile']);
  }

  openLogin() {
    this.isLoginModalOpen.set(true);
  }
}
