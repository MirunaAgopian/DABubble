import { Component, inject } from '@angular/core';
import { Footer } from '../../shared/components/footer/footer';
import { Header } from '../../shared/components/header/header';
import { Router } from '@angular/router';
import { RegistrationService } from '../../core/services/registration.service';
import { AuthService } from '../../core/services/auth.service';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-set-avatar',
  imports: [Footer, Header],
  templateUrl: './set-avatar.html',
  styleUrl: './set-avatar.scss',
})
export class SetAvatar {
  router = inject(Router);
  avatars = [
    '/assets/img/avatars/default_user.png',
    '/assets/img/avatars/avatar_elias_neumann.png',
    '/assets/img/avatars/avatar_elise_roth.png',
    '/assets/img/avatars/avatar_frederick_beck.png',
    '/assets/img/avatars/avatar_noah_braun.png',
    '/assets/img/avatars/avatar_sofia_mueller.png',
    '/assets/img/avatars/avatar_steffen_hoffmann.png',
  ];

  chosenAvatar = this.avatars[0];
  hideTooltip = true;
  registrationService = inject(RegistrationService);
  username = '';
  authService = inject(AuthService);

  ngZone = inject(NgZone);
  ngOnInit() {
    const data = this.registrationService.getFinalData();
    this.username = data.name;
  }

  selectAvatar(index: number) {
    this.chosenAvatar = this.avatars[index];
    this.registrationService.setAvatar(this.chosenAvatar);
  }

  redirectToRegister() {
    this.router.navigate(['/register']);
  }

  showTooltip() {
    this.hideTooltip = false;
  }

  async finishRegistration() {
    const data = this.registrationService.getFinalData();
    await this.authService.registerUser(data.name, data.email, data.password, data.avatarUrl);
    this.hideTooltip = false;
    setTimeout(() => {
      this.router.navigate(['/sign-in']);
    }, 1000);
  }

  async onSubmit() {
    this.showTooltip();
    await this.finishRegistration();
  }
}
