import { Component, inject, input, computed, signal, output } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from '../../../../core/interfaces/user.interface';
import { NgClass } from '@angular/common';
import { ChatStateService } from '../../../../core/services/chat-state.service';
import { ChannelService } from '../../../../core/services/channel.service';
import { TitleStrategy } from '@angular/router';

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
  filteredUsers = computed(() => {
    const users = this.users() ?? [];
    const search = this.inputValue().toLowerCase().trim();
    if (!search) return users;
    return users.filter((user) => user.name.toLowerCase().includes(search));
  });

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue.set(value);
    this.dialogOpen = value.length > 0;
  }

  selectUser(user: User) {
    if (!this.selectedUsers.find((u) => u.id === user.id)) {
      this.selectedUsers.push(user);
    }
    this.dialogOpen = false;
    this.inputValue.set('');
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

  onClose() {
    this.close.emit();
  }

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
