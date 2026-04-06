import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SignupComponent } from './components/login/signup.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  // DashboardComponent acts as the persistent Shell/Layout.
  // It owns the Navbar, WebSocket connection, and <router-outlet>.
  // Child routes are lazy-loaded to keep the layout alive while swapping content.
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      {
        path: 'messages',
        loadComponent: () =>
          import('./components/dashboard/messages/messages.component')
            .then(m => m.MessagesComponent)
      },
      {
        path: 'friends',
        loadComponent: () =>
          import('./components/dashboard/friends/friends.component')
            .then(m => m.FriendsComponent)
      },
      {
        path: 'contacts',
        loadComponent: () =>
          import('./components/dashboard/contacts/contacts.component')
            .then(m => m.ContactsComponent)
      },
      {
        path: 'calls',
        loadComponent: () =>
          import('./components/dashboard/calls/calls.component')
            .then(m => m.CallsComponent)
      },
      // Default child route: redirect /dashboard → /dashboard/messages
      { path: '', redirectTo: 'messages', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: '/login' }
];
