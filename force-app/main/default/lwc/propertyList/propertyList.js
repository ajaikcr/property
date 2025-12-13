import { LightningElement, track } from 'lwc';
import getProperties from '@salesforce/apex/PropertiesController.getProperties';

export default class PropertyList extends LightningElement {

    @track properties;

    minPrice;
    maxPrice;
    status;
    furnishing;
    distanceKm;

    userLat;
    userLng;

    currentPage = 1;
    totalPages = 1;
    pageSize = 25;

    statusOptions = [
        { label: 'All', value: '' },
        { label: 'Available', value: 'Available' },
        { label: 'Occupied', value: 'Occupied' }
    ];

    furnishingOptions = [
        { label: 'All', value: '' },
        { label: 'Furnished', value: 'Furnished' },
        { label: 'Semi-Furnished', value: 'Semi-Furnished' },
        { label: 'Unfurnished', value: 'Unfurnished' }
    ];

    connectedCallback() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.userLat = position.coords.latitude;
                this.userLng = position.coords.longitude;
                this.loadData();
            },
            () => {
                this.loadData();
            }
        );
    }

    loadData() {
        getProperties({
            pageNumber: this.currentPage,
            pageSize: this.pageSize,
            minPrice: this.minPrice,
            maxPrice: this.maxPrice,
            status: this.status,
            furnishing: this.furnishing,
            userLat: this.userLat,
            userLng: this.userLng,
            distanceKm: this.distanceKm
        })
        .then(result => {
            this.properties = result.records;
            this.totalPages = result.totalPages;
        })
        .catch(error => {
            console.error(error);
        });
    }

    handleMinPrice(event) {
        this.minPrice = event.target.value;
        this.resetAndLoad();
    }

    handleMaxPrice(event) {
        this.maxPrice = event.target.value;
        this.resetAndLoad();
    }

    handleStatus(event) {
        this.status = event.target.value;
        this.resetAndLoad();
    }

    handleFurnishing(event) {
        this.furnishing = event.target.value;
        this.resetAndLoad();
    }

    handleDistance(event) {
        this.distanceKm = event.target.value;
        this.resetAndLoad();
    }

    resetAndLoad() {
        this.currentPage = 1;
        this.loadData();
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadData();
        }
    }

    handlePrev() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadData();
        }
    }

    get disablePrev() {
        return this.currentPage === 1;
    }

    get disableNext() {
        return this.currentPage === this.totalPages;
    }
}
