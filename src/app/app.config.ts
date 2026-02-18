import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthService } from './core/auth/auth.service';
import { providePrimeNG } from 'primeng/config';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.bootstrapAuth();
    }),

    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.vortex-dark', // Selector para activar el modo oscuro
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, tailwind-utilities' // Evita conflictos con Tailwind
          }
        }
      }
    })
  ]
};
