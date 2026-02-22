import { Component, OnInit, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { PlayerService } from '../../../core/auth/player.service';
import { Skeleton } from 'primeng/skeleton';
import {NgClass,} from '@angular/common';

type ServerOption = 'LAN' | 'LAS' | 'EUW';

@Component({
  selector: 'vortex-linked-accounts',
  imports: [
    ReactiveFormsModule,
    Skeleton,
    NgClass,
  ],
  templateUrl: './linked-accounts.component.html',
})
export class LinkedAccountsComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private playerService = inject(PlayerService);
  private messageService = inject(MessageService);

  showLinkForm = signal<boolean>(false);
  isLinked = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isFetchingRiotData = signal<boolean>(true);
  riotProfile = signal<any | null>(null);

  servers: ServerOption[] = ['LAN', 'LAS', 'EUW'];
  selectedServer = signal<ServerOption>('LAN');

  riotForm = this.fb.group({
    riot_nick: ['', [Validators.required]],
    riot_tag: ['', [Validators.required]]
  });

  ngOnInit() { this.fetchRiotData(); }

  fetchRiotData() {
    this.isFetchingRiotData.set(true); // Iniciamos carga

    this.playerService.getRiotProfile()
      .pipe(
        finalize(() => this.isFetchingRiotData.set(false)) // Finaliza carga sea éxito o error
      )
      .subscribe({
        next: (data) => {
          this.riotProfile.set(data);
          this.isLinked.set(true);
          // Si ya hay cuenta, NO mostramos el formulario, mostramos el perfil directo
          this.showLinkForm.set(false);
        },
        error: () => {
          this.isLinked.set(false);
          this.riotProfile.set(null);
        }
      });
  }

  vincularRiotReal() {
    if (this.riotForm.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    const { riot_nick, riot_tag } = this.riotForm.getRawValue();

    this.playerService.linkRiotAccount(this.selectedServer(), riot_nick, riot_tag).subscribe({
      next: () => {
        this.fetchRiotData();
        this.isLoading.set(false);
        // Toast de Éxito
        this.messageService.add({
          severity: 'success',
          summary: '¡Vinculado!',
          detail: 'Tu cuenta de Riot se ha conectado exitosamente.'
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        // Toast de Error (Reemplaza al alert)
        this.messageService.add({
          severity: 'error',
          summary: 'Error de Vinculación',
          detail: err.error?.detail || "No pudimos encontrar ese invocador."
        });
      }
    });
  }

  getRankImagePath(tier: string): string {
    // 1. Si no hay rango
    if (!tier || tier === 'UNRANKED') {
      return '/ranks/Rank=Bronze.png'; // <--- Fíjate que empieza directo con /ranks/
    }

    // 2. Formatear el texto (DIAMOND -> Diamond)
    const formattedTier = tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();

    // 3. Devolver la ruta correcta desde la raíz
    return `/ranks/Rank=${formattedTier}.png`;
  }
}
