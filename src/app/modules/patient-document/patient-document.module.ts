import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {PatientDocumentComponent} from "./patient-document.component";
import {routing} from "./patient-document.routing";

@NgModule({
  imports: [
    CommonModule,
    routing
  ],
  declarations: [PatientDocumentComponent]
})
export class PatientDocumentModule { }
