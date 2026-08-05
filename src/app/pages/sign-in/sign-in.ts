import { Component, inject } from '@angular/core';
import { Input } from '../../shared/components/input/input';
import { Footer } from '../../shared/components/footer/footer';
import { Header } from '../../shared/components/header/header';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  imports: [Input, Footer, Header],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {
  router = inject(Router);

  redirectToPwChange() {
    this.router.navigate(['reset-password-req']);
  }
}
