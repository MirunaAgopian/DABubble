import { Component } from '@angular/core';
import { Header } from '../../../shared/components/header/header';
import { WorkspaceHeader } from '../../../shared/components/workspace-header/workspace-header';

@Component({
  selector: 'app-workspace-main',
  imports: [WorkspaceHeader],
  templateUrl: './workspace-main.html',
  styleUrl: './workspace-main.scss',
})
export class WorkspaceMain {}
