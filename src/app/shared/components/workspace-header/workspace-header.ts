import { Component, output, input, inject } from '@angular/core';
import { User } from '../../../core/interfaces/user.interface';
import { NgClass } from '@angular/common';
import { ChatStateService } from '../../../core/services/chat-state.service';
import { WorkspaceSearch } from '../workspace-search/workspace-search';

@Component({
  selector: 'app-workspace-header',
  imports: [NgClass, WorkspaceSearch],
  templateUrl: './workspace-header.html',
  styleUrl: './workspace-header.scss',
})
export class WorkspaceHeader {
  user = input<User | null>();
  isMobile = input<boolean>(false);
  chatStateService = inject(ChatStateService);
  openOverlay = output<'profile' | 'edit-profile' | 'logout'>();


  showSidebar(){
    this.chatStateService.mobileView.set('sidebar');
  }
}
