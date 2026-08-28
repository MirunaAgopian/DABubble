import { Component, output } from '@angular/core';
import { User } from '../../../../core/interfaces/user.interface';

@Component({
  selector: 'app-add-members',
  imports: [],
  templateUrl: './add-members.html',
  styleUrl: './add-members.scss',
})
export class AddMembers {
  confirm = output<User[]>();
  selectedUsers: User[] = [];
  selectedOption: 'all' | 'some' | null = null;

  confirmSelection() {
    this.confirm.emit(this.selectedUsers);
  }

  selectOption(option: 'all' | 'some') {
    this.selectedOption = option;
  }
}

// AMR
// disable estellen button
//add users overlay
//make x-button close the dialog