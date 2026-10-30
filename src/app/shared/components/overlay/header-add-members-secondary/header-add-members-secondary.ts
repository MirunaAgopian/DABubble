import { Component, inject, input, computed, signal, output } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from '../../../../core/interfaces/user.interface';
import { NgClass } from '@angular/common';
import { ChatStateService } from '../../../../core/services/chat-state.service';
import { ChannelService } from '../../../../core/services/channel.service';

/**
 * Member management workflow for existing channels.
 *
 * Allows users to search, select and add new members
 * to the currently active channel.
 */
@Component({
  selector: 'app-header-add-members-secondary',
  imports: [NgClass],
  templateUrl: './header-add-members-secondary.html',
  styleUrl: './header-add-members-secondary.scss',
})
export class HeaderAddMembersSecondary {
  userService = inject(UserService);
  users = toSignal(this.userService.getAllUsersRealtime());
  user = input<User | null>();
  selectedUsers: User[] = [];
  chatStateService = inject(ChatStateService);
  selectedChannel = this.chatStateService.selectedChannel;
  channelService = inject(ChannelService);
  inputValue = signal('');
  dialogOpen = false;
  close = output<void>();

  /**
   * Returns users matching the current search input.
   */
  filteredUsers = computed(() => {
    const users = this.users() ?? [];
    const search = this.inputValue().toLowerCase().trim();
    if (!search) return users;
    return users.filter((user) => user.name.toLowerCase().includes(search));
  });

  /**
   * Updates the search value and controls
   * the visibility of the user suggestion list.
   *
   * @param event Input event.
   */
  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue.set(value);
    this.dialogOpen = value.length > 0;
  }

  /**
   * Adds a user to the selection if they
   * have not already been chosen.
   *
   * @param user Selected user.
   */
  selectUser(user: User) {
    if (!this.selectedUsers.find((u) => u.id === user.id)) {
      this.selectedUsers.push(user);
    }
    this.dialogOpen = false;
    this.inputValue.set('');
  }

  /**
   * Removes a user from the current selection.
   * @param user User to remove.
   */
  removeUser(user: User) {
    this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
  }

  /**
   * Returns the selected users currently
   * visible as chips.
   */
  get visibleChips(): User[] {
    return this.selectedUsers.slice(0, 3);
  }

  /**
   * Returns the number of selected users
   * hidden from the chip preview.
   */
  get hiddenChipCount(): number {
    return Math.max(0, this.selectedUsers.length - 3);
  }

  /**
   * Closes the member management dialog.
   */
  onClose() {
    this.close.emit();
  }

  /**
   * Adds all selected users to the currently
   * active channel and closes the dialog.
   */
  async addMembers() {
    const channel = this.selectedChannel();
    if (!channel) return;
    for (const user of this.selectedUsers) {
      await this.channelService.addMember(channel.id, user);
    }
    this.selectedUsers = [];
    this.onClose();
  }
}
