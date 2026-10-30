import { Component, inject, output, input } from '@angular/core';
import { User } from '../../../../core/interfaces/user.interface';
import { UserService } from '../../../../core/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';

/**
 * Member selection workflow used during channel creation.
 *
 * Allows users to:
 * - Add all team members
 * - Select individual users
 * - Review and remove selected members
 * - Confirm the final member list
 */
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
  user = input<User | null>();
  entwicklerteamUsers = toSignal(this.userService.getEntwicklerteamUsersRealtime(), {
    initialValue: [],
  });

  inputValue = '';
  dialogOpen = false;

  /**
   * Emits the final member selection.
   * When "all" is selected, all available team members
   * are added automatically.
   */
  confirmSelection() {
    if (this.selectedOption === 'all') {
      const all = this.entwicklerteamUsers();
      this.confirm.emit(all);
    } else {
      this.confirm.emit(this.selectedUsers);
    }
  }

  /**
   * Sets the member selection mode.
   * @param option Selection strategy.
   */
  selectOption(option: 'all' | 'some') {
    this.selectedOption = option;
  }

  /**
   * Closes the dialog.
   */
  closeClicked() {
    this.close.emit();
  }

  /**
   * Updates the search input and controls
   * the visibility of the user suggestion list.
   *
   * @param event Input event.
   */
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue = value;
    this.dialogOpen = value.length > 0;
  }

  /**
   * Adds a user to the current selection
   * if they have not already been chosen.
   *
   * @param user Selected user.
   */
  selectUser(user: User) {
    if (!this.selectedUsers.find((u) => u.id === user.id)) {
      this.selectedUsers.push(user);
    }
    this.dialogOpen = false;
    this.inputValue = '';
  }

  /**
   * Removes a user from the current selection.
   *
   * @param user User to remove.
   */
  removeUser(user: User) {
    this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
  }

  /**
   * Returns the user chips currently visible
   * in the selection preview.
   */
  get visibleChips(): User[] {
    return this.selectedUsers.slice(0, 3);
  }

  /**
   * Returns the number of additional selected users
   * that are not displayed as chips.
   */
  get hiddenChipCount(): number {
    return Math.max(0, this.selectedUsers.length - 3);
  }
}
