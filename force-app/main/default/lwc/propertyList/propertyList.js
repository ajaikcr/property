import { LightningElement, wire, track } from 'lwc';
import getProperties from '@salesforce/apex/PropertiesController.getProperties';

export default class PropertyList extends LightningElement {

    @track properties = [];
    pageNumber = 1;
    pageSize = 25;
    totalRecords = 0;

    minPrice;
    maxPrice;
    status;
    furnishing;

    @wire(getProperties, {
        pageNumber: '$pageNumber',
        pageSize: '$pageSize',
        minPrice: '$minPrice',
        maxPrice: '$maxPrice',
        status: '$status',
        furnishing: '$furnishing'
    })
    wiredResult({ data }) {
        if (data) {
            this.properties = data.records;
            this.totalRecords = data.total;
        }
    }

    handleFilterChange(event) {
        this[event.target.name] = event.target.value;
        this.pageNumber = 1;
    }

    nextPage() {
        if (this.pageNumber * this.pageSize < this.totalRecords) {
            this.pageNumber++;
        }
    }

    previousPage() {
        if (this.pageNumber > 1) {
            this.pageNumber--;
        }
    }
}