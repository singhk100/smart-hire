import { Routes } from '@angular/router';
import { authGuard, guestGuard, recruiterGuard, candidateGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/register.component').then(m => m.RegisterComponent)
  },

  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  {
    path: 'jobs',
    loadComponent: () => import('./pages/jobs/jobs-list.component').then(m => m.JobsListComponent)
  },
  {
    path: 'jobs/create',
    canActivate: [authGuard, recruiterGuard],
    loadComponent: () => import('./pages/jobs/create-job.component').then(m => m.CreateJobComponent)
  },
  {
    path: 'jobs/:id',
    loadComponent: () => import('./pages/jobs/job-detail.component').then(m => m.JobDetailComponent)
  },

  {
    path: 'applications',
    canActivate: [authGuard, candidateGuard],
    loadComponent: () => import('./pages/applications/my-applications.component').then(m => m.MyApplicationsComponent)
  },
  {
    path: 'manage-applications',
    canActivate: [authGuard, recruiterGuard],
    loadComponent: () => import('./pages/applications/manage-applications.component').then(m => m.ManageApplicationsComponent)
  },

  {
    path: 'resumes',
    canActivate: [authGuard, candidateGuard],
    loadComponent: () => import('./pages/resumes/resumes.component').then(m => m.ResumesComponent)
  },

  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },

  { path: '**', redirectTo: 'dashboard' }
];
