public with sharing class LeaseManualReminderAction {

    @AuraEnabled
    public static void sendNow(Id leaseId) {

        try {
            Lease_Agreement__c lease = [
                SELECT Id, End_Date__c
                FROM Lease_Agreement__c
                WHERE Id = :leaseId
                LIMIT 1
            ];

            if (lease.End_Date__c == null) {
                throw new AuraHandledException('Lease end date is missing.');
            }

            Integer daysLeft = Date.today().daysBetween(lease.End_Date__c);

            // Call existing service
            LeaseExpiryEmailService.sendExpiryReminders(daysLeft);

        } catch (Exception e) {
            ErrorLogService.logError(
                'LeaseManualReminderAction',
                e.getMessage(),
                e.getStackTraceString()
            );
            throw new AuraHandledException('Unable to send reminder.');
        }
    }
}
