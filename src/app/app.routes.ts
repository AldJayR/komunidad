import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./auth/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./auth/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then(m => m.TabsPage),
    canActivate: [authGuard, roleGuard],
    data: { role: 'resident' },
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'search',
        loadComponent: () => import('./resident/search/search.page').then((m) => m.SearchPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('./resident/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'home',
    redirectTo: 'tabs/home',
    pathMatch: 'full',
  },
  {
    path: 'announcement/:id',
    loadComponent: () => import('./resident/announcement-detail/announcement-detail.page').then(m => m.AnnouncementDetailPage),
    canActivate: [authGuard]
  },
  {
    path: 'official-dashboard',
    loadComponent: () => import('./official/dashboard/dashboard.page').then( m => m.DashboardPage),
    canActivate: [authGuard, roleGuard],
    data: { role: 'official' }
  },
  {
    path: 'announcement-form',
    loadComponent: () => import('./official/announcement-form/announcement-form.page').then( m => m.AnnouncementFormPage),
    canActivate: [authGuard, roleGuard],
    data: { role: 'official' }
  },
];
