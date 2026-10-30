import { Component, inject, ChangeDetectorRef, signal, HostListener } from '@angular/core';
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
import { OverlayTrigger, OverlayView } from '../../../core/interfaces/overlay-trigger.interface';

/**
 * Main workspace container of the application.
 *
 * Handles:
 * - Authentication state initialization
 * - Responsive workspace layout
 * - Overlay and modal management
 * - User profile interactions
 * - Channel creation workflow
 * - Sidebar and thread panel state
 */
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
  threadCollapsed = signal(false);
  overlayView: OverlayView | null = null;
  overlayUser = signal<User | null>(null);
  overlayAnchor = signal<DOMRect | null>(null);
  currentUser = this.chatStateService.currentUser;
  taggedUsers: User[] = [];
  pendingChannelData = signal<{ name: string; description: string } | null>(null);
  overlayChannel = this.chatState.selectedChannel;
  isMobile = signal(false);

  /**
   * Initializes authentication state, user data, presence tracking and responsive layout detection.
   */
  ngOnInit() {
    this.checkViewport();
    this.inAppPresenceService.startInactivityTimer();
    onAuthStateChanged(this.authService.auth, async (user) => {
      if (user) {
        const data = await this.userService.getUser(user.uid);
        this.chatStateService.currentUser.set(data as User);
      } else {
        const guest = await this.userService.getUser('guest');
        this.chatStateService.currentUser.set(guest as User);
      }
      this.cdr.detectChanges();
    });
  }

  /**
   * Updates viewport-dependent layout state when the browser window is resized.
   */
  @HostListener('window:resize')
  onResize() {
    this.checkViewport();
  }

  /**
   * Determines whether the application is currently
   * displayed in mobile view.
   */
  checkViewport() {
    this.isMobile.set(window.innerWidth <= 1100);
  }

  /**
   * Logs out the current user, clears the application state and redirects
   * to the sign-in page.
   */
  handleLogout() {
    this.chatStateService.resetChatState();
    this.authService.logoutUser();
    this.router.navigate(['sign-in']);
  }

  // -------------------------OVERLAY METHODS--------------------------------------

  /**
   * Opens a standard overlay view.
   * @param view Overlay to display.
   */
  openOverlay(view: OverlayView) {
    if (
      view === 'profile' ||
      view === 'edit-profile' ||
      view === 'logout' ||
      view === 'create-channel' ||
      view === 'channel-details' ||
      view === 'header-add-members-primary' ||
      view === 'header-add-members-secondary'
    ) {
      this.overlayView = view;
      this.isOverlayOpen = true;
    }
  }

  /**
   * Opens an overlay positioned relative
   * to a trigger element.
   * @param trigger Overlay view and anchor position.
   */
  openAnchoredOverlay(trigger: OverlayTrigger) {
    this.overlayView = trigger.view;
    this.overlayAnchor.set(trigger.anchor);
    this.isOverlayOpen = true;
  }

  /**
   * Opens the selected user's profile overlay.
   * @param user User to display.
   */
  openUserProfile(user: User) {
    this.overlayUser.set(user);
    this.overlayView = 'user-profile';
    this.isOverlayOpen = true;
  }

  /**
   * Opens the details overlay for a channel.
   * @param channel Channel to display.
   */
  openChannelDetails(channel: Channel | null) {
    this.overlayChannel.set(channel);
    this.overlayView = 'channel-details';
    this.isOverlayOpen = true;
  }

  /**
   * Closes the currently active overlay.
   */
  closeOverlay() {
    this.isOverlayOpen = false;
  }

  /**
   * Switches between profile-related overlay views from within the workspace-header.
   * @param view Target overlay view.
   */
  onSwitchView(view: 'profile' | 'edit-profile' | 'logout') {
    this.overlayView = view;
  }

  /**
   * Toggles the sidebar collapsed state.
   */
  toggleSidebar() {
    this.sidebarCollapsed.update((v) => !v);
  }

  /**
   * Toggles the thread panel collapsed state.
   */
  toggleThread() {
    this.threadCollapsed.update((v) => !v);
  }

  /**
   * Updates the current user's display name in the workspace-header.
   * @param newName Updated username.
   */
  async onUpdateName(newName: string) {
    const user = this.currentUser();
    if (!user) return;
    await this.userService.updateUserName(user.id, {
      name: newName,
    });
    this.currentUser.set({
      ...user,
      name: newName,
    });
    this.closeOverlay();
  }

  /**
   * Stores channel data and opens the member selection overlay.
   * @param data Channel information.
   */
  handleAddMembers(data: { name: string; description: string }) {
    this.pendingChannelData.set(data);
    this.overlayView = 'add-members';
  }

  /**
   * Creates a channel with the selected members.
   * @param selectedUsers Users to add to the channel.
   */
  onConfirmAddMembers(selectedUsers: User[]) {
    const channelData = this.pendingChannelData();
    const user = this.currentUser();
    if (!channelData || !user) return;
    const memberIds = selectedUsers.map((u) => u.id);
    this.channelService.createChannel(
      channelData.name,
      user.id,
      user.name,
      memberIds,
      channelData.description,
    );
    this.pendingChannelData.set(null);
    this.closeOverlay();
  }

  /**
   * Updates the currently selected user for overlay interactions.
   *
   * @param user Selected user.
   */
  onSelectedUser(user: User) {
    this.overlayUser.set(user);
  }
}
