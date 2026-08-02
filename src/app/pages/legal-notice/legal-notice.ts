import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-legal-notice',
  imports: [],
  templateUrl: './legal-notice.html',
  styleUrl: './legal-notice.scss',
})
export class LegalNotice {
  router = inject(Router);

  returnToSignin(){
    this.router.navigate(["/sign-in"])
  }
}
