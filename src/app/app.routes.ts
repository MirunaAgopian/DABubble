import { Routes } from '@angular/router';
import { Start } from './pages/start/start';
import { SignIn } from './pages/sign-in/sign-in';
import { Register } from './pages/register/register';
import { ResetPassword } from './pages/reset-password/reset-password';
import { LegalNotice } from './pages/legal-notice/legal-notice';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';

export const routes: Routes = [
    { path: '', component: Start },
    { path: 'sign-in', component: SignIn },
    { path: 'register', component: Register },
    { path: 'reset-password', component: ResetPassword },
    { path: 'legal-notice', component: LegalNotice }, 
    { path: 'privacy-policy', component: PrivacyPolicy }
];
