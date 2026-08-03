import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Header } from '../../shared/components/header/header';

@Component({
  selector: 'app-legal-notice',
  imports: [Header],
  templateUrl: './legal-notice.html',
  styleUrl: './legal-notice.scss',
})
export class LegalNotice {
  router = inject(Router);

  returnToSignin(){
    this.router.navigate(["/sign-in"])
  }
}
