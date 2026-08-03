import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from '../../shared/components/header/header';

@Component({
  selector: 'app-privacy-policy',
  imports: [Header],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})
export class PrivacyPolicy {
  router = inject(Router);

  returnToSignin(){
    this.router.navigate(["/sign-in"])
  }
}
