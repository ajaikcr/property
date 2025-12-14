import { LightningElement, api } from 'lwc';
import sendNow from '@salesforce/apex/LeaseManualReminderAction.sendNow';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CloseActionScreenEvent } from 'lightning/actions';

export default class SendLeaseReminder extends LightningElement {
    @api recordId;

    connectedCallback() {
        sendNow({ leaseId: this.recordId })
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Lease expiry reminder sent successfully',
                        variant: 'success'
                    })
                );
                this.dispatchEvent(new CloseActionScreenEvent());
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body ? error.body.message : 'Error sending reminder',
                        variant: 'error'
                    })
                );
            });
    }
}
