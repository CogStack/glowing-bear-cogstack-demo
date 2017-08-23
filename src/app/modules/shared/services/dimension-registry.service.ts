import {Injectable} from '@angular/core';
import {ResourceService} from './resource.service';
import {Constraint} from '../models/constraints/constraint';
import {Concept} from '../models/concept';
import {ConceptConstraint} from '../models/constraints/concept-constraint';
import {CombinationConstraint} from '../models/constraints/combination-constraint';
import {SavedSet} from '../models/saved-set';
import {TreeNode} from 'primeng/primeng';

type LoadingState = 'loading' | 'complete';

@Injectable()
export class DimensionRegistryService {

  // the variable that holds the entire tree structure
  public treeNodes: TreeNode[] = [];
  // the selectionMode of the tree, default is '', alternative is 'checkbox'
  public treeSelectionMode = '';
  // the selected tree nodes by user in observation selection
  public selectedTreeNodes: TreeNode[] = [];
  // the status indicating the when the tree is being loaded or finished loading
  public loadingTreeNodes: LoadingState = 'complete';

  private concepts: Concept[] = [];
  private conceptConstraints: Constraint[] = [];

  private patientSets: SavedSet[] = [];
  private observationSets: SavedSet[] = [];

  // List keeping track of all available constraints. By default, the empty
  // constraints are in here. In addition, (partially) filled constraints are
  // added. The constraints should be copied when editing them.
  private allConstraints: Constraint[] = [];

  constructor(private resourceService: ResourceService) {
    this.updateEmptyConstraints();
    this.updateConcepts();
    this.updatePatientSets();
  }

  updateEmptyConstraints() {
    this.allConstraints.push(new CombinationConstraint());
    this.allConstraints.push(new ConceptConstraint());
  }

  /** Extracts concepts (and later possibly other dimensions) from the
   *  provided TreeNode array and their children.
   *  And augment tree nodes with PrimeNG tree-ui specifications
   * @param treeNodes
   */
  private processTreeNodes(treeNodes: object[]) {
    if (!treeNodes) {
      return;
    }
    for (let node of treeNodes) {
      this.processTreeNode(node);
    }
  }

  private processTreeNode(node: Object) {
    // Extract concept
    if (node['dimension'] === 'concept') {

      // Only include non-FOLDERs and non-CONTAINERs
      if (node['visualAttributes'].indexOf('FOLDER') === -1 &&
        node['visualAttributes'].indexOf('CONTAINER') === -1) {

        let concept = new Concept();
        // TODO: retrieve concept path in less hacky manner:
        concept.path = node['conceptPath']
        concept.type = node['type'];
        this.concepts.push(concept);
        if (node['type'] === 'CATEGORICAL') {
          concept['values'] = node['values'];
        }

        let constraint = new ConceptConstraint();
        constraint.concept = concept;
        this.conceptConstraints.push(constraint);
        this.allConstraints.push(constraint);
      }
    }
    // Add PrimeNG visual properties for tree nodes
    let patientCount = node['patientCount'];
    let countStr = ' ';
    if (patientCount) {
      countStr += '(' + patientCount;
    }
    // let observationCount = node['observationCount'];
    // if (observationCount) {
    //   countStr += ' | ' + observationCount;
    // }
    if (countStr !== ' ') {
      countStr += ')';
    }
    node['label'] = node['name'] + countStr;
    if (node['metadata']) {
      node['label'] = node['label'] + ' ⚆';
    }

    // if (node['name'].indexOf('consent') !== -1 ||
    //   node['name'].indexOf('demography') !== -1 ||
    //   node['name'].indexOf('medical') !== -1) {
    //   node['expanded'] = true;
    // }

    // If this node has children, drill down
    if (node['children']) {
      // Recurse
      node['expandedIcon'] = 'fa-folder-open';
      node['collapsedIcon'] = 'fa-folder';
      node['icon'] = '';
      this.processTreeNodes(node['children']);
    } else {
      if (node['type'] === 'NUMERIC') {
        node['icon'] = 'icon-123';
      } else if (node['type'] === 'HIGH_DIMENSIONAL') {
        node['icon'] = 'icon-hd';
      } else if (node['type'] === 'CATEGORICAL_OPTION') {
        node['icon'] = 'icon-abc';
      } else {
        node['icon'] = 'fa-folder-o';
      }
    }
  }

  updateConcepts() {
    this.loadingTreeNodes = 'loading';
    // Retrieve all tree nodes and extract the concepts iteratively
    let allTreeNodes = this.resourceService.getAllTreeNodes();
    this.loadingTreeNodes = 'complete';
    this.concepts = [];
    this.conceptConstraints = [];
    this.treeNodes = allTreeNodes;
    this.processTreeNodes(allTreeNodes);
  }

  updatePatientSets() {
    // reset patient sets
    // this.resourceService.getPatientSets()
    //   .subscribe(
    //     sets => {
    //       // this is to retain the original reference pointer to the array
    //       this.patientSets.length = 0;
    //
    //       // reverse the sets so that the latest patient set is on top
    //       sets.reverse();
    //       sets.forEach(set => {
    //         set.name = set.description;
    //         this.patientSets.push(set);
    //       });
    //     },
    //     err => console.error(err)
    //   );
  }

  getConcepts() {
    return this.concepts;
  }

  getPatientSets() {
    return this.patientSets;
  }

  getObservationSets() {
    return this.observationSets;
  }

  /**
   * Returns a list of all constraints that match the query string.
   * The constraints should be copied when editing them.
   * @param query
   * @returns {Array}
   */
  searchAllConstraints(query: string): Constraint[] {
    query = query.toLowerCase();
    let results = [];
    this.allConstraints.forEach((constraint: Constraint) => {
      let text = constraint.textRepresentation.toLowerCase();
      if (text.indexOf(query) > -1) {
        results.push(constraint);
      }
    });
    return results;
  }

}
