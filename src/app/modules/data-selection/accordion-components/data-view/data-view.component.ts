import { Component, OnInit } from '@angular/core';
import {SelectItem} from "primeng/primeng";

@Component({
  selector: 'data-view',
  templateUrl: './data-view.component.html',
  styleUrls: ['./data-view.component.css']
})
export class DataViewComponent implements OnInit {

  patients = [];
  validationOptions: SelectItem[];

  constructor() {
    this.validationOptions = [];
    this.validationOptions.push({label: 'performed', value: 'performed'});
    this.validationOptions.push({label: 'not performed', value: 'not performed'});
    this.validationOptions.push({label: 'eligible', value: 'eligible'});
    this.validationOptions.push({label: 'not eligible', value: 'not eligible'});

    let p1 = {
      id: 'p1',
      confidence: 89,
      validation: 'not performed',
      interested: true
    };
    let p2 = {
      id: 'p2',
      confidence: 20,
      validation: 'performed',
      interested: false
    };
    let p3 = {
      id: 'p3',
      confidence: 100,
      validation: 'eligible',
      interested: true
    };
    let p4 = {
      id: 'p4',
      confidence: 33,
      validation: 'not eligible',
      interested: 'NA'
    };
    let p5 = {
      id: 'p5',
      confidence: 10,
      validation: 'performed',
      interested: false
    };
    let p6 = {
      id: 'p6',
      confidence: 56,
      validation: 'not eligible',
      interested: false
    };
    let p7 = {
      id: 'p7',
      confidence: 96,
      validation: 'performed',
      interested: 'NA'
    };
    this.patients = [p1, p2, p3, p4, p5, p6, p7];
  }

  ngOnInit() {
  }

  onExportPatientTableClick() {
    console.log('export patient data: ', this.patients);
  }
}
