import { LightningElement, track } from 'lwc';
import createProperty from '@salesforce/apex/PropertiesController.createProperty';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CreateProperty extends LightningElement {

    @track property = {};
    propertyId;
    uploadedFiles = [];
    isSaving = false;

    get disableSave() {
        return this.isSaving;
    }

    get buttonLabel() {
        return this.propertyId ? 'Property Created' : 'Save Property';
    }

    get typeOptions() {
        return [
            { label: 'Residential', value: 'Residential' },
            { label: 'Commercial', value: 'Commercial' }
        ];
    }

    get furnishingOptions() {
        return [
            { label: 'Furnished', value: 'Furnished' },
            { label: 'Semi-Furnished', value: 'Semi-Furnished' },
            { label: 'Unfurnished', value: 'Unfurnished' }
        ];
    }

    get statusOptions() {
        return [
            { label: 'Available', value: 'Available' },
            { label: 'Occupied', value: 'Occupied' }
        ];
    }

    handleChange(event) {
        this.property[event.target.name] = event.target.value;
    }

    async handleSave() {
        if (this.propertyId) {
            return; // already saved
        }

        this.isSaving = true;

        try {
            const id = await createProperty({ property: this.property });
            this.propertyId = id;

            this.showToast(
                'Success',
                'Property created. Please upload at least one image.',
                'success'
            );

        } catch (error) {
            this.showToast(
                'Error',
                error.body?.message || 'Error creating property',
                'error'
            );
        } finally {
            this.isSaving = false;
        }
    }

    handleUploadFinished(event) {
        this.uploadedFiles = event.detail.files;

        this.showToast(
            'Images Uploaded',
            `${this.uploadedFiles.length} image(s) uploaded successfully`,
            'success'
        );
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }
}
