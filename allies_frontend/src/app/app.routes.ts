import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SignupComponent } from './components/login/signup.component'; // <— THÊM

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },            // <— THÊM
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: '/login' }
];
