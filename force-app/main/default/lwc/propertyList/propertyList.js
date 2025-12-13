import { LightningElement, track } from 'lwc';
import getProperties from '@salesforce/apex/PropertiesController.getProperties';
import getNearbyProperties from '@salesforce/apex/PropertiesController.getNearbyProperties';

export default class PropertyList extends LightningElement {

    @track properties = [];
    @track totalRecords = 0;
    @track loading = false;

    pageNumber = 1;
    pageSize = 25;

    minPrice;
    maxPrice;
    status = '';
    furnishing = '';

    distanceKm = 5;
    userLat;
    userLng;

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
        this.loadProperties();
    }

    // -------------------------
    // MAIN PROPERTY LIST
    // -------------------------
    loadProperties() {
        this.loading = true;

        getProperties({
            pageNumber: this.pageNumber,
            pageSize: this.pageSize,
            minPrice: this.minPrice,
            maxPrice: this.maxPrice,
            status: this.status,
            furnishing: this.furnishing
        })
        .then(result => {
            this.properties = result.records;
            this.totalRecords = result.total;
            this.loading = false;
        })
        .catch(error => {
            console.error(error);
            this.loading = false;
        });
    }

    // -------------------------
    // NEARBY SEARCH
    // -------------------------
    handleDistanceChange(event) {
        this.distanceKm = parseFloat(event.target.value);
    }

    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                this.userLat = position.coords.latitude;
                this.userLng = position.coords.longitude;
            });
        }
    }

    loadNearby() {
        if (!this.userLat || !this.userLng || !this.distanceKm) {
            alert('Please allow location access and enter distance.');
            return;
        }

        this.loading = true;

        getNearbyProperties({
            userLat: this.userLat,
            userLng: this.userLng,
            distanceKm: this.distanceKm
        })
        .then(result => {
            this.properties = result;
            this.totalRecords = result.length;
            this.loading = false;
        })
        .catch(error => {
            console.error(error);
            this.loading = false;
        });
    }

    // -------------------------
    // PAGINATION
    // -------------------------
    nextPage() {
        this.pageNumber += 1;
        this.loadProperties();
    }

    prevPage() {
        if (this.pageNumber > 1) {
            this.pageNumber -= 1;
            this.loadProperties();
        }
    }

    get disablePrev() {
        return this.pageNumber === 1 || this.loading;
    }

    get disableNext() {
        return (this.pageNumber * this.pageSize) >= this.totalRecords || this.loading;
    }
}
