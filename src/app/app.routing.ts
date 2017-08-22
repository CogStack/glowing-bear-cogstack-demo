import {ModuleWithProviders}  from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

// Route Configuration
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/data-selection',
    pathMatch: 'full'
  },
  {
    path: 'data-selection',
    loadChildren: './modules/data-selection/data-selection.module#DataSelectionModule'
  },
  {
    path: 'export',
    loadChildren: './modules/export/export.module#ExportModule'
  }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
