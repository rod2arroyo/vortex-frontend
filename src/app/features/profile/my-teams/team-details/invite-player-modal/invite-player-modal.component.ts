import {Component, EventEmitter, inject, Input, Output, signal} from '@angular/core';
import {Dialog} from 'primeng/dialog';
import {InvitationService} from '../../../../../core/auth/invitation.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'vortex-invite-player-modal',
  imports: [
    Dialog,
    FormsModule
  ],
  templateUrl: './invite-player-modal.component.html',
})
export class InvitePlayerModalComponent {
  private invitationService = inject(InvitationService);

  @Input() visible = false;
  @Input() teamId = '';
  @Output() visibleChange = new EventEmitter<boolean>();

  searchNick = '';
  isLoading = signal(false);

  inviteLink = signal<string | null>(null);
  isGeneratingLink = signal(false);
  linkCopied = signal(false);

  closeModal() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.resetState();
  }

  resetState() {
    this.searchNick = '';
    this.inviteLink.set(null);
    this.linkCopied.set(false);
  }

  // --- Lógica de Invitación Directa ---
  inviteUser() {
    if (!this.searchNick.trim() || this.isLoading()) return;

    this.isLoading.set(true);
    this.invitationService.inviteUserByNick(this.teamId, this.searchNick).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.searchNick = '';
        alert(res.message); // O usar un Toast bonito
        this.closeModal();
      },
      error: (err) => {
        this.isLoading.set(false);
        alert(err.error?.detail || 'Error al enviar invitación');
      }
    });
  }

  // --- Lógica de Link ---
  generateLink() {
    this.isGeneratingLink.set(true);
    this.invitationService.createInvitationLink(this.teamId).subscribe({
      next: (res) => {
        // Construimos la URL completa para el frontend
        // Asumiendo que tu app corre en localhost:4200 o vortex.gg
        const fullLink = `${window.location.origin}/invite/${res.link_token}`;
        this.inviteLink.set(fullLink);
        this.isGeneratingLink.set(false);
      },
      error: (err) => {
        this.isGeneratingLink.set(false);
        alert('Error al generar el link');
      }
    });
  }

  copyLink() {
    if (this.inviteLink()) {
      navigator.clipboard.writeText(this.inviteLink()!).then(() => {
        this.linkCopied.set(true);
        setTimeout(() => this.linkCopied.set(false), 2000);
      });
    }
  }
}
