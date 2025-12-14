public with sharing class PropertiesController {

    /* =====================================================
       LIST PROPERTIES (pagination + filters)
       ===================================================== */
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getProperties(
        Integer pageNumber,
        Integer pageSize,
        Decimal minPrice,
        Decimal maxPrice,
        String status,
        String furnishing
    ) {
        if (pageNumber == null || pageNumber < 1) pageNumber = 1;
        if (pageSize == null || pageSize < 1) pageSize = 25;

        List<String> conditions = new List<String>();
        conditions.add('Id != null');

        if (minPrice != null) conditions.add('Rent__c >= :minPrice');
        if (maxPrice != null) conditions.add('Rent__c <= :maxPrice');
        if (!String.isBlank(status)) {
            conditions.add('Status__c = :status');
        }
        if (!String.isBlank(furnishing)) {
            conditions.add('Furnishing_Status__c = :furnishing');
        }

        String whereClause = ' WHERE ' + String.join(conditions, ' AND ');
        Integer offsetVal = (pageNumber - 1) * pageSize;

        Integer total = (Integer) Database.countQuery(
            'SELECT COUNT() FROM Properties__c' + whereClause
        );

        List<Properties__c> records = Database.query(
            'SELECT Id, Name, Street__c, City__c, State__c, Country__c, ' +
            'Rent__c, Status__c, Furnishing_Status__c ' +
            'FROM Properties__c' +
            whereClause +
            ' ORDER BY CreatedDate DESC ' +
            'LIMIT :pageSize OFFSET :offsetVal'
        );

        return new Map<String, Object>{
            'records' => records,
            'total'   => total
        };
    }

    /* =====================================================
       CREATE PROPERTY
       ===================================================== */
    @AuraEnabled
    public static Id createProperty(Properties__c property) {

        if (property == null) {
            throw new AuraHandledException('Property details are required.');
        }

        insert property;
        return property.Id;
    }
}
