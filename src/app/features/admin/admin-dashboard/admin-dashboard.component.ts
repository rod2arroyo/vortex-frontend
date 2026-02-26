import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import {TournamentResponse, TournamentService} from '../../../core/auth/tournament.service'; // Asumiendo PrimeNG

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  private tournamentService = inject(TournamentService);
  private fb = inject(FormBuilder);

  // Estado
  tournaments = signal<TournamentResponse[]>([]);
  isLoading = signal(false);

  // Modal y Edición
  showModal = signal(false);
  isEditing = signal(false);
  selectedTournamentId: string | null = null;

  // Formulario
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    category: ['Open', [Validators.required]],
    entry_fee: [0, [Validators.required, Validators.min(0)]],
    prize_pool: [0, [Validators.required, Validators.min(0)]],
    max_teams: [16, [Validators.required, Validators.min(2)]],
    start_date: ['', [Validators.required]],
    description: [''],
    status: ['OPEN'] // Solo usado en edición
  });

  ngOnInit() {
    this.loadTournaments();
  }

  loadTournaments() {
    this.isLoading.set(true);
    this.tournamentService.getAll().subscribe({
      next: (data) => {
        this.tournaments.set(data);
        this.isLoading.set(false);
      }
    });
  }

  openCreate() {
    this.isEditing.set(false);
    this.selectedTournamentId = null;
    this.form.reset({
      category: 'Open',
      entry_fee: 0,
      prize_pool: 0,
      max_teams: 16,
      status: 'OPEN'
    });
    this.showModal.set(true);
  }

  openEdit(t: TournamentResponse) {
    this.isEditing.set(true);
    this.selectedTournamentId = t.id;

    // Formatear fecha para el input datetime-local (YYYY-MM-DDTHH:MM)
    let formattedDate = '';
    if (t.start_date) {
      formattedDate = new Date(t.start_date).toISOString().slice(0, 16);
    }

    this.form.patchValue({
      name: t.name,
      category: t.category,
      entry_fee: t.entry_fee,
      prize_pool: t.prize_pool,
      max_teams: t.max_teams,
      start_date: formattedDate,
      description: t.description,
      status: t.status
    });
    this.showModal.set(true);
  }

  save() {
    if (this.form.invalid) return;
    this.isLoading.set(true);

    const formData = this.form.value as any;
    // Asegurar que la fecha sea objeto Date o string ISO completo
    formData.start_date = new Date(formData.start_date).toISOString();

    if (this.isEditing() && this.selectedTournamentId) {
      // UPDATE
      this.tournamentService.update(this.selectedTournamentId, formData).subscribe({
        next: (updated) => {
          // Actualizar lista localmente
          this.tournaments.update(list => list.map(t => t.id === updated.id ? updated : t));
          this.closeModal();
        }
      });
    } else {
      // CREATE
      // Eliminamos status para create ya que el backend lo pone por default
      const { status, ...createData } = formData;

      this.tournamentService.create(createData).subscribe({
        next: (created) => {
          this.tournaments.update(list => [created, ...list]);
          this.closeModal();
        }
      });
    }
  }

  closeModal() {
    this.showModal.set(false);
    this.isLoading.set(false);
  }
}
