import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  imports: [],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})
export class PrivacyPolicy {
  router = inject(Router);

  returnToSignin(){
    this.router.navigate(["/sign-in"])
  }
}
