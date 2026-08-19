import { Routes } from '@angular/router';
import { Start } from './pages/start/start';
import { SignIn } from './pages/sign-in/sign-in';
import { Register } from './pages/register/register';
import { SetAvatar } from './pages/set-avatar/set-avatar';
import { ResetPasswordRequest } from './pages/reset-password-request/reset-password-request';
import { ResetPassword } from './pages/reset-password/reset-password';
import { LegalNotice } from './pages/legal-notice/legal-notice';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';
import { WorkspaceMain } from './pages/workspace/workspace-main/workspace-main';


export const routes: Routes = [
  { path: '', component: Start },
  { path: 'sign-in', component: SignIn },
  { path: 'register', component: Register },
  { path: 'set-avatar', component: SetAvatar },
  { path: 'reset-password-req', component: ResetPasswordRequest },
  { path: 'reset-password', component: ResetPassword },
  { path: 'legal-notice', component: LegalNotice },
  { path: 'privacy-policy', component: PrivacyPolicy },
  {path: 'workspace', component: WorkspaceMain },
];
