import { Component, inject, output } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ChannelService } from '../../../core/services/channel.service';

@Component({
  selector: 'app-workspace-sidebar',
  imports: [NgClass],
  templateUrl: './workspace-sidebar.html',
  styleUrl: './workspace-sidebar.scss',
})
export class WorkspaceSidebar {
  userService = inject(UserService);
  users = toSignal(this.userService.getAllUsersRealtime());
  authService = inject(AuthService);
  openOverlay = output<string>();
  channelService = inject(ChannelService);
  channels = toSignal(this.channelService.fetchChannels());
  

  get currentUser() {
    return this.authService.auth.currentUser;
  }

  toggleCollapsible(section: HTMLElement) {
    section.classList.toggle('expanded');
    section.classList.toggle('collapsed');
  }

  openOverlayClicked(){
    this.openOverlay.emit('create-channel');
  }
}
