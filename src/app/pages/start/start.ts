import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start',
  imports: [],
  templateUrl: './start.html',
  styleUrl: './start.scss',
})
export class Start {
private router = inject(Router);

  ngOnInit(){
    setTimeout(() => {
      this.router.navigate(['/sign-in']);
    }, 4100);
  }
}
