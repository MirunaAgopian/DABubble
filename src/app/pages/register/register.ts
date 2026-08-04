import { Component, inject } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { Input } from '../../shared/components/input/input';
import { Router } from '@angular/router';
import { ThumbPosition } from '@angular/material/slider/testing';

@Component({
  selector: 'app-register',
  imports: [Header, Footer, Input],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  router = inject(Router);
  isChecked = false;
  hideTooltip = true;
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

  returnToSignin() {
    this.router.navigate(['/sign-in']);
  }

  redirectToPrivPol() {
    this.router.navigate(['/privacy-policy']);
  }

  toggleCheckbox() {
    this.isChecked = !this.isChecked;
  }

  selectAvatar(index: number) {
    this.chosenAvatar = this.avatars[index];
  }

  showTooltip() {
    this.hideTooltip = false;

    setTimeout(()=> {
      this.router.navigate(['/sign-in']);
    },1000);
  }

}
