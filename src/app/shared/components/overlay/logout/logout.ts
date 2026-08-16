import { Component, EventEmitter, output } from '@angular/core';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.html',
  styleUrl: './logout.scss',
})
export class Logout {
  clicked = output<void>();
  profile = output<void>();

  onClick(){
    this.clicked.emit();
  }

  onProfileClick(){
    this.profile.emit();
  }
}
