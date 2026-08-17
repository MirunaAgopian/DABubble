import { Component, input, output, signal } from '@angular/core';
import { User } from '../../../../core/interfaces/user.interface';

@Component({
  selector: 'app-edit-profile',
  imports: [],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.scss',
})
export class EditProfile {
  user = input<User | null>();
  clicked = output<void>();
  name = signal('');
  save = output<string>();

  onClick(){
    this.clicked.emit();
  }

  onSave(){
    this.save.emit(this.name());
  }
}
