import { Component, inject, ChangeDetectorRef, signal } from '@angular/core';
import { WorkspaceHeader } from '../../../shared/components/workspace-header/workspace-header';
import { WorkspaceSidebar } from '../workspace-sidebar/workspace-sidebar';
import { ChatShell } from '../workspace-chat/chat-shell/chat-shell';
import { WorkspaceThread } from '../workspace-thread/workspace-thread';
import { InAppPresenceService } from '../../../core/services/in-app-presence.service';
import { Overlay } from '../../../shared/components/overlay/overlay';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { onAuthStateChanged } from 'firebase/auth';
import { User } from '../../../core/interfaces/user.interface';
import { ChannelService } from '../../../core/services/channel.service';
import { Channel } from '../../../core/interfaces/channel.interface';
import { ChatStateService } from '../../../core/services/chat-state.service';

@Component({
  selector: 'app-workspace-main',
  imports: [WorkspaceHeader, ChatShell, WorkspaceSidebar, WorkspaceThread, Overlay],
  templateUrl: './workspace-main.html',
  styleUrl: './workspace-main.scss',
})
export class WorkspaceMain {
  router = inject(Router);
  authService = inject(AuthService);
  userService = inject(UserService);
  channelService = inject(ChannelService);
  chatStateService = inject(ChatStateService);
  inAppPresenceService = inject(InAppPresenceService);
  chatState = inject(ChatStateService);
  cdr = inject(ChangeDetectorRef);
  isOverlayOpen = false;
  sidebarCollapsed = signal(false);

  overlayView:
    | 'profile'
    | 'edit-profile'
    | 'logout'
    | 'create-channel'
    | 'user-profile'
    | 'add-members'
    | 'channel-details'
    | null = null;

  guestUser: User = {
    id: 'guest',
    name: 'Gast',
    email: 'guest@da-bubble.de',
    avatarUrl: '/assets/img/avatars/default_user.png',
    provider: 'password',
    createdAt: Date.now(),
    lastActive: Date.now(),
    status: 'online',
  };
  overlayUser = signal<User | null>(null);
  currentUser = signal<User>(this.guestUser);
  taggedUsers: User[] = [];
  pendingChannelData = signal<{ name: string; description: string } | null>(null);
  overlayChannel = this.chatState.selectedChannel;

  ngOnInit() {
    this.inAppPresenceService.startInactivityTimer();
    onAuthStateChanged(this.authService.auth, async (user) => {
      if (user) {
        const data = await this.userService.getUser(user.uid);
        this.currentUser.set(data as User);
      } else {
        this.currentUser.set(this.guestUser);
      }
      this.cdr.detectChanges();
    });
  }

  handleLogout() {
    this.authService.logoutUser();
    this.router.navigate(['sign-in']);
  }

  openOverlay(view: string) {
    if (
      view === 'profile' ||
      view === 'edit-profile' ||
      view === 'logout' ||
      view === 'create-channel' ||
      view === 'channel-details'
    ) {
      this.overlayView = view;
      this.isOverlayOpen = true;
    }
  }

  openUserProfile(user: User) {
    this.overlayUser.set(user);
    this.overlayView = 'user-profile';
    this.isOverlayOpen = true;
  }

  openChannelDetails(channel: Channel | null) {
    this.overlayChannel.set(channel);
    this.overlayView = 'channel-details';
    this.isOverlayOpen = true;
  }

  closeOverlay() {
    this.isOverlayOpen = false;
  }

  onSwitchView(view: 'profile' | 'edit-profile' | 'logout') {
    this.overlayView = view;
  }

  async onUpdateName(newName: string) {
    const user = this.currentUser();
    if (!user) return;
    await this.userService.updateUserName(this.currentUser().id, { name: newName });
    this.currentUser.set({ ...this.currentUser(), name: newName });
    this.closeOverlay();
  }

  toggleSidebar() {
    this.sidebarCollapsed.update((v) => !v);
  }

  //prepares the tagged user to be added in the sendMessage funciton
  // that I will defined inside the messageService
  handleUserAdded(user: User) {
    if (!this.taggedUsers.some((u) => u.id === user.id)) {
      this.taggedUsers.push(user);
    }
  }

  handleAddMembers(data: { name: string; description: string }) {
    this.pendingChannelData.set(data);
    this.overlayView = 'add-members';
  }

  onConfirmAddMembers(selectedUsers: User[]) {
    const channelData = this.pendingChannelData();
    if (!channelData) return;

    const memberIds = selectedUsers.map((u) => u.id);
    this.channelService.createChannel(
      channelData.name,
      this.currentUser().id,
      this.currentUser().name,
      memberIds,
      channelData.description,
    );

    this.pendingChannelData.set(null);
    this.closeOverlay();
  }
}
