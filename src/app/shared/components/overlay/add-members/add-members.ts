import { Component, ElementRef, inject, output, HostListener } from '@angular/core';
import { User } from '../../../../core/interfaces/user.interface';
import { UserService } from '../../../../core/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-add-members',
  imports: [NgClass],
  templateUrl: './add-members.html',
  styleUrl: './add-members.scss',
})
export class AddMembers {
  confirm = output<User[]>();
  selectedUsers: User[] = [];
  selectedOption: 'all' | 'some' | null = null;
  close = output<void>();
  userService = inject(UserService);
  users = toSignal(this.userService.getAllUsersRealtime());
  inputValue = '';
  dialogOpen = false;

  confirmSelection() {
    this.confirm.emit(this.selectedUsers);
  }

  selectOption(option: 'all' | 'some') {
    this.selectedOption = option;
  }

  closeClicked() {
    this.close.emit();
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue = value;
    this.dialogOpen = value.length > 0;
  }

  selectUser(user: User) {
    if (!this.selectedUsers.find((u) => u.id === user.id)) {
      this.selectedUsers.push(user);
    }
    this.dialogOpen = false;
    this.inputValue = '';
  }

  removeUser(user: User) {
    this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
  }

  get visibleChips(): User[] {
    return this.selectedUsers.slice(0, 3);
  }

  get hiddenChipCount(): number {
    return Math.max(0, this.selectedUsers.length - 3);
  }

}
