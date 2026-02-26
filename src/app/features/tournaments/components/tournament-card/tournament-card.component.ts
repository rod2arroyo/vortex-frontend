import { Component, computed, input } from '@angular/core';
import {CurrencyPipe, DatePipe, NgClass} from '@angular/common';
import { TournamentResponse } from '../../../../core/auth/tournament.service';

@Component({
  selector: 'vortex-tournament-card',
  imports: [
    NgClass,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './tournament-card.component.html',
})
export class TournamentCardComponent {
  tournament = input.required<TournamentResponse>();

  statusColor = computed(() => {
    switch (this.tournament().status) {
      case 'ongoing': return 'bg-red-600 animate-pulse'; // Rojo y parpadeando para EN VIVO
      case 'waiting': return 'bg-[#10B981]'; // Verde esmeralda para ABIERTO
      case 'finished': return 'bg-gray-600'; // Gris oscuro para FINALIZADO
      default: return 'bg-purple-600'; // Color de fallback
    }
  });

  statusLabel = computed(() => {
    switch (this.tournament().status) {
      case 'ongoing': return 'EN VIVO';
      case 'waiting': return 'ABIERTO';
      case 'finished': return 'FINALIZADO';
      default: return this.tournament().status?.toUpperCase();
    }
  });
}
