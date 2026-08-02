import { Component, inject } from '@angular/core';
import { ThumbPosition } from '@angular/material/slider/testing';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  router = inject(Router);

  redirectLegalNotice(){
    this.router.navigate(['/legal-notice']);
  }

  redirectPrivacyPol(){
    this.router.navigate(['/privacy-policy']);
  }
}
