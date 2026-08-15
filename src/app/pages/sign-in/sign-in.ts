import { Component, inject } from '@angular/core';
import { Input } from '../../shared/components/input/input';
import { Footer } from '../../shared/components/footer/footer';
import { Header } from '../../shared/components/header/header';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { strongPasswordValidator } from '../../shared/utils/strong-password.validator';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sign-in',
  imports: [Input, Footer, Header],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {
  router = inject(Router);
  authService = inject(AuthService);
  form = new FormGroup({
    email: new FormControl('', {
      validators: [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      ],
    }),
    password: new FormControl('', {
      validators: [
        Validators.required, strongPasswordValidator
      ]
    }),
  });

  redirectToPwChange() {
    this.router.navigate(['reset-password-req']);
  }

  redirectToApp(){
    this.router.navigate(['workspace']);
  }

  async onSubmit(){
    const { email, password } = this.form.value;

    try {
      await this.authService.loginUser(email ?? '', password ?? '');
      this.router.navigate(['workspace']);
    } catch(err){
      console.error('Error on user sign-in:', err);
    }
  }
}
