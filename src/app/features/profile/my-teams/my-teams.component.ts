import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TeamService } from '../../../core/auth/team.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TeamCreate, TeamResponse } from '../../../core/models/team.model';
import { UserService } from '../../../core/auth/user.service';
import { Dialog } from 'primeng/dialog';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'vortex-my-teams',
  imports: [
    Dialog,
    ReactiveFormsModule,
    DatePipe,
    RouterLink,
  ],
  templateUrl: './my-teams.component.html',
})
export class MyTeamsComponent implements OnInit {
  private teamService = inject(TeamService);
  public userService = inject(UserService);
  private fb = inject(FormBuilder);

  myTeams = signal<TeamResponse[]>([]);
  isLoading = signal<boolean>(true);

  displayCreateModal = signal<boolean>(false);
  isCreating = signal<boolean>(false);

  currentUser = computed(() => this.userService.currentUser());

  // Formulario actualizado con tag y description
  createTeamForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
    tag: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(5)]],
    description: ['']
  });

  cardColors = [
    'border-t-purple-500',
    'border-t-red-500',
    'border-t-yellow-500',
    'border-t-cyan-500',
    'border-t-green-500'
  ];

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.isLoading.set(true);
    this.teamService.getMyTeams().subscribe({
      next: (teams) => {
        this.myTeams.set(teams);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando equipos', err);
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal() {
    this.createTeamForm.reset();
    this.displayCreateModal.set(true);
  }

  createTeam() {
    if (this.createTeamForm.invalid || this.isCreating()) return;

    this.isCreating.set(true);
    const formData = this.createTeamForm.getRawValue();

    // Preparamos el payload con los nuevos campos
    const newTeamData: TeamCreate = {
      name: formData.name!,
      tag: formData.tag!,
      description: formData.description || undefined // Opcional
    };

    this.teamService.createTeam(newTeamData).subscribe({
      next: (newTeam) => {
        this.myTeams.update(teams => [...teams, newTeam]);
        this.displayCreateModal.set(false);
        this.isCreating.set(false);
      },
      error: (err) => {
        // Mostrar detalle del error si es un 400 (ej. Nombre duplicado)
        alert(err.error?.detail || 'Error al crear el equipo');
        this.isCreating.set(false);
      }
    });
  }
}
