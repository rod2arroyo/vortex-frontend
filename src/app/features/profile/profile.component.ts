import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Skeleton } from 'primeng/skeleton';
import { UserService } from '../../core/auth/user.service';
import { PlayerService } from '../../core/auth/player.service';
import {MessageService, PrimeTemplate} from 'primeng/api';
import { Toast } from 'primeng/toast';

type ProfileTab = 'equipos' | 'cuentas';
type ServerOption = 'LAN' | 'LAS' | 'EUW';

@Component({
  selector: 'app-profile',
  imports: [
    NgClass,
    ReactiveFormsModule,
    Skeleton,
    Toast,
    PrimeTemplate
  ],
  providers: [MessageService],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private userService = inject(UserService);
  private playerService = inject(PlayerService);
  private messageService = inject(MessageService);

  // --- Signals con Tipado Estricto ---
  activeTab = signal<ProfileTab>('cuentas');

  showLinkForm = signal<boolean>(false);
  isLinked = signal<boolean>(false);
  isLoading = signal<boolean>(false); // Para el guardado
  isFetchingRiotData = signal<boolean>(true); // NUEVO: Para el esqueleto de carga inicial
  riotProfile = signal<any | null>(null);

  servers: ServerOption[] = ['LAN', 'LAS', 'EUW'];
  selectedServer = signal<ServerOption>('LAN');

  riotForm = this.fb.group({
    riot_nick: ['', [Validators.required]],
    riot_tag: ['', [Validators.required]]
  });

  // --- Lógica de Usuario ---
  currentUser = this.userService.currentUser;

  profileForm = this.fb.group({
    internal_nick: ['', [Validators.required, Validators.minLength(3)]],
    country: [''],
    whatsapp: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]]
  });

  constructor() {
    // 3. Ahora el effect funcionará porque currentUser ya existe
    effect(() => {
      const user = this.currentUser();

      if (user) {
        this.profileForm.patchValue({
          // El " || '' " es vital por si el dato viene null
          internal_nick: user.internal_nick || '',
          country: user.country || '',
          whatsapp: user.whatsapp || ''
        });
      }
    });
  }

  ngOnInit() {
    // Al cargar el componente, intentamos traer el perfil de Riot si ya existe
    this.fetchRiotData();
  }

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

  cancelLink() {
    this.showLinkForm.set(false);
  }

  // --- Función Real de Vinculación (Sustituye a simularValidacion) ---
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

  saveChanges() {
    if (this.profileForm.invalid || this.isLoading()) return;

    this.isLoading.set(true);
    const data = this.profileForm.getRawValue();

    this.userService.updateProfile(data).subscribe({
      next: () => {
        this.isLoading.set(false);
        // Toast de Éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Guardado',
          detail: 'Tu perfil ha sido actualizado correctamente.'
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        // Toast de Error
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron guardar los cambios.'
        });
      }
    });
  }
}
