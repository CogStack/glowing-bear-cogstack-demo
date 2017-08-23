import {Component, OnInit, ViewChild} from '@angular/core';
import {ConstraintComponent} from "../constraint/constraint.component";
import {AutoComplete} from "primeng/components/autocomplete/autocomplete";
import {Concept} from "../../../shared/models/concept";
import {ConceptConstraint} from "../../../shared/models/constraints/concept-constraint";
import {ConceptOperatorState} from "./concept-operator-state";
import {ValueConstraint} from "../../../shared/models/constraints/value-constraint";

@Component({
  selector: 'concept-constraint',
  templateUrl: './concept-constraint.component.html',
  styleUrls: ['./concept-constraint.component.css', '../constraint/constraint.component.css']
})
export class ConceptConstraintComponent extends ConstraintComponent implements OnInit {

  @ViewChild('autoComplete') autoComplete: AutoComplete;
  @ViewChild('categoricalAutoComplete') categoricalAutoComplete: AutoComplete;
  @ViewChild('trialVisitAutoComplete') trialVisitAutoComplete: AutoComplete;

  searchResults: Concept[];
  operatorState: ConceptOperatorState;
  isMinEqual: boolean;
  isMaxEqual: boolean;
  equalVal: number;
  minVal: number;
  maxVal: number;
  minLimit: number;
  maxLimit: number;

  selectedCategories: string[];
  suggestedCategories: string[];
  selectedCategoryObjects: object[];

  selectedContexts: string[];
  allCategories: string[];
  allCategoryChecks: object[];

  categoryFilterWord = '';

  ngOnInit() {
    this.initializeConstraints();
  }

  initializeConstraints() {
    // Initialize aggregate values
    this.isMinEqual = true;
    this.isMaxEqual = true;
    this.operatorState = ConceptOperatorState.BETWEEN;

    this.selectedCategories = [];
    this.suggestedCategories = [];
    this.selectedCategoryObjects = [];

    let constraint: ConceptConstraint = <ConceptConstraint>this.constraint;
    if (constraint.concept) {
      // Construct a new constraint that only has the concept as sub constraint
      // (We don't want to apply value and date constraints when getting aggregates)
      let conceptOnlyConstraint: ConceptConstraint = new ConceptConstraint();
      conceptOnlyConstraint.concept = constraint.concept;

      let aggregate = this.resourceService.getConceptAggregateMock(conceptOnlyConstraint);
      this.constraint['concept'].aggregate = aggregate;
      if (this.isNumeric()) {
        this.minLimit = aggregate.min;
        this.maxLimit = aggregate.max;
      } else if (this.isCategorical()) {
        this.selectedCategories = aggregate.values;
        this.suggestedCategories = aggregate.values;
      } else if (this.isSpecialCategorical()) {
        this.selectedCategoryObjects.push({
          word: '',
          selectedCategories: []
        });
        this.suggestedCategories = [].concat(constraint.concept['values']);
        this.allCategories = [].concat(this.suggestedCategories);
        this.allCategoryChecks = [];
        for (let cat of this.allCategories) {
          let obj = {
            category: cat,
            checked: true,
            shown: true
          };
          this.allCategoryChecks.push(obj);
        }
      }
    }

  }

  /*
   * -------------------- getters and setters --------------------
   */
  get selectedConcept(): Concept {
    return (<ConceptConstraint>this.constraint).concept;
  }

  set selectedConcept(value: Concept) {
    if (value instanceof Concept) {
      (<ConceptConstraint>this.constraint).concept = value;
      this.initializeConstraints();
      this.constraintService.update();
    }
  }

  /*
   * -------------------- event handlers: concept autocomplete --------------------
   */
  /**
   * when the user searches through concept list
   * @param event
   */
  onSearch(event) {
    let query = event.query.toLowerCase();
    let concepts = this.dimensionRegistry.getConcepts();
    if (query) {
      this.searchResults = concepts.filter((concept: Concept) => concept.path.toLowerCase().includes(query));
    } else {
      this.searchResults = concepts;
    }
  }

  /**
   * when user clicks the concept list dropdown
   * @param event
   */
  onDropdown(event) {
    let concepts = this.dimensionRegistry.getConcepts();

    // Workaround for dropdown not showing properly, as described in
    // https://github.com/primefaces/primeng/issues/745
    this.searchResults = [];
    this.searchResults = concepts;
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    if (this.autoComplete.panelVisible) {
      this.autoComplete.hide();
    } else {
      this.autoComplete.show();
    }
  }

  updateConceptValues() {
    let conceptConstraint: ConceptConstraint = <ConceptConstraint>this.constraint;

    // if the concept is numeric
    if (this.isNumeric()) {
      // if to define a single value
      if (this.operatorState === ConceptOperatorState.EQUAL) {
        if (typeof this.equalVal === 'number') {
          let newVal: ValueConstraint = new ValueConstraint();
          newVal.valueType = this.selectedConcept.type;
          newVal.operator = '=';
          newVal.value = this.equalVal;
          conceptConstraint.values = [];
          conceptConstraint.values.push(newVal);
        } // else if to define a value range
      } else if (this.operatorState === ConceptOperatorState.BETWEEN) {
        conceptConstraint.values = [];
        if (typeof this.minVal === 'number') {
          let newMinVal: ValueConstraint = new ValueConstraint();
          newMinVal.valueType = this.selectedConcept.type;
          newMinVal.operator = '>';
          if (this.isMinEqual) {
            newMinVal.operator = '>=';
          }
          newMinVal.value = this.minVal;
          conceptConstraint.values.push(newMinVal);
        }

        if (typeof this.maxVal === 'number') {
          let newMaxVal: ValueConstraint = new ValueConstraint();
          newMaxVal.valueType = this.selectedConcept.type;
          newMaxVal.operator = '<';
          if (this.isMaxEqual) {
            newMaxVal.operator = '<=';
          }
          newMaxVal.value = this.maxVal;
          conceptConstraint.values.push(newMaxVal);
        }
      } // else if the concept is categorical
    } else if (this.isCategorical()) {
      conceptConstraint.values = [];
      for (let category of this.selectedCategories) {
        let newVal: ValueConstraint = new ValueConstraint();
        newVal.valueType = 'STRING';
        newVal.operator = '=';
        newVal.value = category;
        conceptConstraint.values.push(newVal);
      }
    } else if (this.isSpecialCategorical()) {
      // for (let catObj of this.allCategoryChecks) {
      //   const cat = catObj['category'];
      //   catObj['checked'] = (this.selectedCategories.indexOf(cat) === -1);
      // }
    }

    this.constraintService.update();

  }

  /*
   * -------------------- event handlers: category autocomplete --------------------
   */
  /**
   * when the user searches through the category list of a selected concept
   * @param event
   */
  onCategorySearch(event) {
    let query = event.query.toLowerCase().trim();
    let categories = [];
    if (this.isSpecialCategorical()) {
      categories = (<ConceptConstraint>this.constraint).concept['values'];
    } else {
      categories = (<ConceptConstraint>this.constraint).concept.aggregate.values;
    }
    if (query) {
      this.suggestedCategories =
        categories.filter((category: string) => category.toLowerCase().includes(query));
    } else {
      this.suggestedCategories = [].concat(categories);
    }
  }

  selectAllCategories() {
    // console.log('select all values for concept: ', (<ConceptConstraint>this.constraint).concept);
    let concept = (<ConceptConstraint>this.constraint).concept;
    if (!this.isSpecialCategorical()) {
      this.selectedCategories = (<ConceptConstraint>this.constraint).concept.aggregate.values;
      if (concept.path.indexOf('consent') !== -1) {
        this.selectedCategories = ['yes', 'no'];
      } else if (concept.path.indexOf('gender') !== -1) {
        this.selectedCategories = ['male', 'female'];
      }
    } else {
      for (let catobj of this.allCategoryChecks) {
        if (catobj['checked'] && catobj['shown']) {
          this.putCategoryToSelectedCategories(catobj['category']);
        }
      }
    }

    this.updateConceptValues();
  }

  clearAllCategories() {
    if (this.isSpecialCategorical()) {
      for (let cat of this.selectedCategories) {
        this.putCategoryToAvailableCategories(cat);
      }
    }
    this.selectedCategories = [];
    this.updateConceptValues();
  }

  clearAllCategoriesWithFilter(filterWord) {
    let selectedCategoryObject = this.getSelectedCategoryObject(filterWord);
    if (selectedCategoryObject) {
      for (let cat of selectedCategoryObject['selectedCategories']) {
        this.putCategoryToAvailableCategories(cat);
      }
      selectedCategoryObject['selectedCategories'] = [];
      this.removeEmptySelectedCategoryObjects();
    }
  }

  putCategoryToSelectedCategories(category: string) {
    /*
     * old approach for a singular selectecdCategories object
     */
    // if (this.selectedCategories.indexOf(category) === -1) {
    //   this.selectedCategories.push(category);
    //   let found = this.getCategoryObject(category);
    //   if (found) {
    //     found['checked'] = false;
    //   }
    // }

    /*
     * new approach for one selectedCategories object per filter word
     */
    let word = this.getCategoryFilterWord();
    let selectedCategoryObject = this.getSelectedCategoryObject(word);
    if (selectedCategoryObject) {
      let selectedCategories = selectedCategoryObject['selectedCategories'];
      if (selectedCategories.indexOf(category) === -1) {
        selectedCategories.push(category);
        let found = this.getCategoryObject(category);
        if (found) {
          found['checked'] = false;
        }
      }
    } else {
      let newObj = {
        word: word,
        selectedCategories: [category]
      };
      let found = this.getCategoryObject(category);
      if (found) {
        found['checked'] = false;
      }
      this.selectedCategoryObjects.push(newObj);
    }
    // console.log('selectedCategoryObjects: ', this.selectedCategoryObjects);
  }

  putCategoryToAvailableCategories(category: string) {
    const word = this.categoryFilterWord.trim().toLowerCase();
    // console.log('put back ', category, ', with word, ', word);
    // console.log('find catObj: ', this.getCategoryObject(category));
    let found = this.getCategoryObject(category);
    if (found) {
      found['checked'] = true;
      let name = found['category'].trim().toLowerCase();
      if (name.includes(word)) {
        found['shown'] = true;
      } else {
        found['shown'] = false;
      }
    }
  }

  getCategoryObject(category: string) {
    for (let catObj of this.allCategoryChecks) {
      if (category === catObj['category']) {
        return catObj;
      }
    }
    return null;
  }

  onUnselectCategories(category) {
    // For some funny reason, the category is still in the list when this handler is invoked
    let index = this.selectedCategories.indexOf(category);
    this.selectedCategories.splice(index, 1);
    this.putCategoryToAvailableCategories(category);
    this.updateConceptValues();
  }

  onUnselectCategoryWithFilter(category, word) {
    let selectedCategoryObject = this.getSelectedCategoryObject(word);
    // For some funny reason, the category is still in the list when this handler is invoked
    let index = selectedCategoryObject['selectedCategories'].indexOf(category);
    selectedCategoryObject['selectedCategories'].splice(index, 1);
    this.putCategoryToAvailableCategories(category);
    this.removeEmptySelectedCategoryObjects();
  }

  handleCategoryCheckChange(event) {
    for (let catObj of this.allCategoryChecks) {
      if (!catObj['checked']) {
        const cat = catObj['category'];
        if (!this.checkIfCategoryIsAlreadySelected(cat)) {
          this.putCategoryToSelectedCategories(cat);
        }
      }
    }
  }

  checkIfCategoryIsAlreadySelected(category: string) {
    for (let cat of this.selectedCategoryObjects) {
      if (cat['selectedCategories'].indexOf(category) !== -1) {
        return true;
      }
    }
    return false;
  }

  filterAvailableCategories(event) {
    // console.log('filterAvailableCategories: ', event, this.categoryFilterWord);
    const word = this.categoryFilterWord.trim().toLowerCase();
    for (let catObj of this.allCategoryChecks) {
      const checked = catObj['checked'];
      const name = catObj['category'].trim().toLowerCase();
      if (checked) {
        if (name.includes(word)) {
          catObj['shown'] = true;
        } else {
          catObj['shown'] = false;
        }
      }
    }
  }

  getAvailableCategoryCount() {
    let count = 0;
    for (let catobj of this.allCategoryChecks) {
      if (catobj['checked'] && catobj['shown']) {
        count++;
      }
    }
    return count;
  }

  getCategoryFilterWord() {
    return this.categoryFilterWord.trim().toLowerCase();
  }

  getSelectedCategoryObject(word: string) {
    for (let cat of this.selectedCategoryObjects) {
      if (cat['word'] === word) {
        return cat;
      }
    }
    return null;
  }

  removeEmptySelectedCategoryObjects() {
    for(let cat of this.selectedCategoryObjects) {
      if(cat['word'] !== '' && cat['selectedCategories'].length === 0) {
        let index = this.selectedCategoryObjects.indexOf(cat);
        this.selectedCategoryObjects.splice(index, 1);
      }
    }
  }

  /*
   * -------------------- state checkers --------------------
   */
  isNumeric() {
    let concept: Concept = (<ConceptConstraint>this.constraint).concept;
    if (!concept) {
      return false;
    }
    return concept.type === 'NUMERIC';
  }

  isCategorical() {
    let concept: Concept = (<ConceptConstraint>this.constraint).concept;
    if (!concept) {
      return false;
    }
    return concept.type === 'CATEGORICAL_OPTION';
  }

  isSpecialCategorical() {
    let concept: Concept = (<ConceptConstraint>this.constraint).concept;
    if (!concept) {
      return false;
    }
    return concept.type === 'CATEGORICAL';
  }

  isBetween() {
    return this.operatorState === ConceptOperatorState.BETWEEN;
  }

  switchOperatorState() {
    if (this.isNumeric()) {
      this.operatorState =
        (this.operatorState === ConceptOperatorState.EQUAL) ?
          (this.operatorState = ConceptOperatorState.BETWEEN) :
          (this.operatorState = ConceptOperatorState.EQUAL);
    }
    this.updateConceptValues();
  }

  getOperatorButtonName() {
    let name = '';
    if (this.isNumeric()) {
      name = (this.operatorState === ConceptOperatorState.BETWEEN) ? 'between' : 'equal to';
    }
    return name;
  }
}
