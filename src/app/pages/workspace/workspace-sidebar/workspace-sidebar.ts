import { Component } from '@angular/core';

@Component({
  selector: 'app-workspace-sidebar',
  imports: [],
  templateUrl: './workspace-sidebar.html',
  styleUrl: './workspace-sidebar.scss',
})
export class WorkspaceSidebar {
  toggleCollapsible(section: HTMLElement) {
    section.classList.toggle('expanded');
    section.classList.toggle('collapsed');
  }
}
