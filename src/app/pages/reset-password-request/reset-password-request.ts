import { Component, inject } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { Input } from '../../shared/components/input/input';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { email } from '@angular/forms/signals';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [Header, Footer, Input],
  templateUrl: './reset-password-request.html',
  styleUrl: './reset-password-request.scss',
})
export class ResetPasswordRequest {
  router = inject(Router);
  hideTooltip = true;
  authService = inject(AuthService);
  form = new FormGroup({
    email: new FormControl('', {
      validators: [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      ],
    }),
  });

  returnToSignin() {
    this.router.navigate(['/sign-in']);
  }

  showTooltip() {
    this.hideTooltip = false;
  }

  async sendPwResetEmail() {
    const email = this.form.controls.email.value ?? '';
    await this.authService.sendResetPasswordLink(email);
  }

  redirectAfterDelay() {
    setTimeout(() => {
      this.router.navigate(['/sign-in']);
    }, 1000);
  }

  async onSubmit() {
    this.showTooltip();
    await this.sendPwResetEmail();
    this.redirectAfterDelay();
  }
}
