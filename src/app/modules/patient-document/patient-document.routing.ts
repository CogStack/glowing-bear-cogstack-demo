import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PatientDocumentComponent} from "./patient-document.component";


const routes: Routes = [
  {
    path: '',
    component: PatientDocumentComponent
  }
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
