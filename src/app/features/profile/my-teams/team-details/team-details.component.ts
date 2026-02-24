import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService } from '../../../../core/auth/team.service';
import { TeamResponse } from '../../../../core/models/team.model';
import { UserService } from '../../../../core/auth/user.service';

@Component({
  selector: 'app-team-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-details.component.html'
})
export class TeamDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private teamService = inject(TeamService);
  public userService = inject(UserService);

  teamId = '';
  team = signal<TeamResponse | null>(null);
  isLoading = signal<boolean>(true);

  // Límite máximo de integrantes según tu diseño
  MAX_MEMBERS = 7;

  currentUser = computed(() => this.userService.currentUser());

  // Computed para saber si el usuario actual es el capitán
  isCaptain = computed(() => {
    const currentT = this.team();
    const user = this.currentUser();
    return currentT && user ? currentT.captain_id === user.id : false;
  });

  ngOnInit() {
    this.teamId = this.route.snapshot.paramMap.get('id') || '';
    if (this.teamId) {
      this.loadTeamData();
    }
  }

  loadTeamData() {
    this.isLoading.set(true);
    this.teamService.getMyTeams().subscribe({
      next: (teams) => {
        const foundTeam = teams.find(t => t.id === this.teamId);
        if (foundTeam) {
          this.team.set(foundTeam);
        } else {
          this.router.navigate(['/profile']); // Regresa si no existe
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  goBack() {
    this.location.back();
  }

  // --- ACCIONES DE LOS ENDPOINTS ---

  expulsarJugador(memberId: string) {
    if (!confirm('¿Estás seguro de que deseas expulsar a este jugador?')) return;

    this.teamService.removeMember(this.teamId, memberId).subscribe({
      next: () => {
        // Actualizamos la UI removiendo al jugador
        this.team.update(t => {
          if (!t) return t;
          return { ...t, members: t.members.filter(m => m.user_id !== memberId) };
        });
      },
      error: (err) => alert(err.error?.detail || 'Error al expulsar jugador')
    });
  }

  abandonarEquipo() {
    if (!confirm('¿Estás seguro de que deseas abandonar este equipo?')) return;

    this.teamService.leaveTeam(this.teamId).subscribe({
      next: () => this.router.navigate(['/profile']),
      error: (err) => alert(err.error?.detail || 'Error al abandonar el equipo')
    });
  }

  eliminarEquipo() {
    if (!confirm('¡Atención! Esta acción es irreversible. ¿Eliminar equipo?')) return;

    this.teamService.deleteTeam(this.teamId).subscribe({
      next: () => this.router.navigate(['/profile']),
      error: (err) => alert(err.error?.detail || 'Error al eliminar el equipo')
    });
  }

  // --- HELPERS PARA LA UI ---

  getEmptySlots(): any[] {
    const currentMembersCount = this.team()?.members.length || 0;
    const emptyCount = Math.max(0, this.MAX_MEMBERS - currentMembersCount);
    return new Array(emptyCount);
  }

  getLinkedAccountsCount(): number {
    return this.team()?.members.filter(m => !!m.riot_id_full).length || 0;
  }
}
