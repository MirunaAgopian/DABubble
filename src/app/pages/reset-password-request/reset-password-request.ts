import { Component, inject } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { Input } from '../../shared/components/input/input';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { email } from '@angular/forms/signals';

@Component({
  selector: 'app-reset-password',
  imports: [Header, Footer, Input],
  templateUrl: './reset-password-request.html',
  styleUrl: './reset-password-request.scss',
})
export class ResetPasswordRequest {
  router = inject(Router);
  hideTooltip = true;
  form = new FormGroup({
    email: new FormControl('', {
      validators: [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      ]
    }),
  });

  returnToSignin() {
    this.router.navigate(['/sign-in']);
  }

  showTooltip() {
    this.hideTooltip = false;
    setTimeout(() => {
      this.router.navigate(['/sign-in']);
    }, 1000);
  }
  //implement real password reset with firebase
}
