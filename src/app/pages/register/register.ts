import { Component, inject } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { Input } from '../../shared/components/input/input';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { strongPasswordValidator } from '../../shared/utils/strong-password.validator';
import { RegistrationService } from '../../core/services/registration.service';
import { validateHorizontalPosition } from '@angular/cdk/overlay';

@Component({
  selector: 'app-register',
  imports: [Header, Footer, Input],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  router = inject(Router);
  isChecked = false;
  registrationService = inject(RegistrationService);

  form = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required],
    }),
    email: new FormControl('', {
      validators: [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      ],
    }),
    password: new FormControl('', {
      validators: [Validators.required, strongPasswordValidator],
    }),
  });

  returnToSignin() {
    this.router.navigate(['/sign-in']);
  }

  redirectToPrivPol() {
    this.router.navigate(['/privacy-policy']);
  }

  redirectToAvatar() {
    this.registrationService.setFormData(this.form.value);
    this.router.navigate(['/set-avatar']);
  }

  toggleCheckbox() {
    this.isChecked = !this.isChecked;
  }
}
