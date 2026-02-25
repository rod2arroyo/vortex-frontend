import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import {authGuard} from './core/guard/auth.guard';

export const routes: Routes = [
  {
    path: 'invite/:token',
    loadComponent: () => import('./features/invites/invite-landing/invite-landing.component')
      .then(m => m.InviteLandingComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard]
      },
      {
        path: 'team/:id',
        loadComponent: () => import('./features/profile/my-teams/team-details/team-details.component').then(m => m.TeamDetailsComponent),
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
