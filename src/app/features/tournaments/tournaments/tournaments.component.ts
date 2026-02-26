import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {TournamentCardComponent} from '../components/tournament-card/tournament-card.component';
import { TournamentService} from '../../../core/auth/tournament.service';
import {NgClass} from '@angular/common';
import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DropdownModule} from 'primeng/dropdown';

@Component({
  selector: 'app-tournaments',
  imports: [
    TournamentCardComponent,
    NgClass,
    FormsModule,
    DropdownModule,
    ReactiveFormsModule,
  ],
  templateUrl: './tournaments.component.html',
})
export class TournamentsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tournamentService = inject(TournamentService);

  loading = signal(true);
  tournaments = signal<any[]>([]);
  activeFilter = signal<'ALL' | 'LIVE' | 'UPCOMING' | 'MINE'>('ALL');

  // Formulario Reactivo
  filterForm = this.fb.group({
    server: [null],
    prize: [null],
    mode: [null],
    map: [null],
    search: ['']
  });

  // Opciones para Dropdowns (Con iconos para PrimeNG)
  serverOptions = [
    { label: 'LAN', value: 'LAN', icon: 'pi pi-globe' },
    { label: 'LAS', value: 'LAS', icon: 'pi pi-globe' },
    { label: 'NA', value: 'NA', icon: 'pi pi-globe' }
  ];

  prizeOptions = [
    { label: 'Cash (USD)', value: 'USD', icon: 'pi pi-dollar' },
    { label: 'Riot Points', value: 'RP', icon: 'pi pi-star-fill' }
  ];

  modeOptions = [
    { label: '5v5 Grieta', value: '5v5', icon: 'pi pi-users' },
    { label: '1v1 Abismo', value: '1v1', icon: 'pi pi-user' }
  ];

  mapOptions = [
    { label: 'Grieta del Invocador', value: 'SUMMONERS_RIFT', icon: 'pi pi-image' },
    { label: 'Abismo de los Lamentos', value: 'HOWLING_ABYSS', icon: 'pi pi-image' }
  ];

  ngOnInit() {
    this.loadTournaments();
  }

  loadTournaments() {
    this.tournamentService.getAll().subscribe({
      next: (data) => {
        this.tournaments.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      }
    });
  }

  applyFilters() {
    const filters = this.filterForm.value;
    // Llamar al endpoint con filters...
  }


  filteredTournaments = computed(() => {
    const filter = this.activeFilter();
    const all = this.tournaments();

    if (filter === 'LIVE') {
      return all.filter(t => t.status === 'IN_PROGRESS');
    }
    if (filter === 'UPCOMING') {
      return all.filter(t => t.status === 'OPEN');
    }
    return all;
  });
}
