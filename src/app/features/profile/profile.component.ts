import { Component, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { LinkedAccountsComponent } from './linked-accounts/linked-accounts.component';
import { NgClass } from '@angular/common';
import { MyTeamsComponent } from './my-teams/my-teams.component';

type ProfileTab = 'equipos' | 'cuentas';

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    Toast,
    AccountSettingsComponent,
    LinkedAccountsComponent,
    NgClass,
    MyTeamsComponent
  ],
  providers: [MessageService],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  activeTab = signal<ProfileTab>('equipos');
}
