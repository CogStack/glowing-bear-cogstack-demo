import {Component, OnInit, ElementRef, AfterViewInit} from '@angular/core';
import {ConstraintService} from "../../../shared/services/constraint.service";
import {DimensionRegistryService} from "../../../shared/services/dimension-registry.service";
import {DropMode} from "../../../shared/models/drop-mode";
import {PatientSet} from "../../../shared/models/patient-set";

@Component({
  selector: 'saved-patient-sets',
  templateUrl: './saved-patient-sets.component.html',
  styleUrls: ['./saved-patient-sets.component.css']
})
export class SavedPatientSetsComponent implements OnInit, AfterViewInit {

  patientSets: PatientSet[];
  observer: MutationObserver;

  constructor(private dimensionRegistry: DimensionRegistryService,
              private constraintService: ConstraintService,
              private element: ElementRef) {
    // this.patientSets = this.dimensionRegistry.getPatientSets();
    this.patientSets = this.constraintService.savedPatientSets;
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.observer = new MutationObserver(this.update.bind(this));
    let config = {
      attributes: false,
      subtree: true,
      childList: true,
      characterData: false
    };

    this.observer.observe(this.element.nativeElement, config);
  }

  update() {
    let pDataList = this.element.nativeElement.querySelector('p-datalist');
    let ul = pDataList.querySelector('.ui-datalist-data');
    let index = 0;
    for (let li of ul.children) {
      let correspondingPatientSet = this.patientSets[index];
      li.addEventListener('dragstart', (function () {
        correspondingPatientSet['dropMode'] = DropMode.PatientSet;
        this.constraintService.selectedNode = correspondingPatientSet;
      }).bind(this));
      index++;
    }
  }

  modifyPatientSet(event, i) {
    console.log('modify patient set: ', event, i, this.patientSets[i]);
    let patientSet = this.patientSets[i];
    this.constraintService.rootInclusionConstraint =
      this.constraintService.deepCopy(patientSet['inclusionConstraint']);
    this.constraintService.rootExclusionConstraint =
      this.constraintService.deepCopy(patientSet['exclusionConstraint']);
  }

  removePatientSet(event, i) {
    console.log('remove patient set: ', event);
    this.patientSets.splice(i, 1);
  }

}
