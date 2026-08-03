import { Component, inject } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { Input } from '../../shared/components/input/input';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [Header, Footer, Input],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  router = inject(Router);
  isChecked = false;

  returnToSignin() {
    this.router.navigate(['/sign-in']);
  }

  redirectToPrivPol() {
    this.router.navigate(['/privacy-policy']);
  }

  toggleCheckbox() {
  this.isChecked = !this.isChecked;
}
}
