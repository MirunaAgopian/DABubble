import { Component, inject } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { Input } from '../../shared/components/input/input';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { strongPasswordValidator } from '../../shared/utils/strong-password.validator';
import { passwordsMatchValidator } from '../../shared/utils/password-match.validator';

@Component({
  selector: 'app-reset-password',
  imports: [Header, Footer, Input],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {
  router = inject(Router);
  hideTooltip = true;

  form = new FormGroup(
    {
      password: new FormControl('', {
        validators: [Validators.required, strongPasswordValidator],
      }),
      confirmPassword: new FormControl('', {
        validators: [Validators.required],
      }),
    },
    { validators: passwordsMatchValidator },
  );

  returnToResPwReq() {
    this.router.navigate(['/reset-password-req']);
  }

  showTooltip() {
    this.hideTooltip = false;
    setTimeout(() => {
      this.router.navigate(['/sign-in']);
    }, 1000);
  }

  //implement real password reset with firebase
}
