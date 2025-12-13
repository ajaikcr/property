public with sharing class PropertiesController {
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

        String whereClause = ' WHERE Id != null ';
        if (minPrice != null) {
            whereClause += ' AND Rent__c >= ' + String.valueOf(minPrice);
        }
        if (maxPrice != null) {
            whereClause += ' AND Rent__c <= ' + String.valueOf(maxPrice);
        }
        if (status != null && status.trim().length() > 0) {
            whereClause += ' AND Status__c = \'' + String.escapeSingleQuotes(status) + '\'';
        }
        if (furnishing != null && furnishing.trim().length() > 0) {
            whereClause += ' AND Furnishing_Status__c = \'' + String.escapeSingleQuotes(furnishing) + '\'';
        }

        // total count using same whereClause
        String countQuery = 'SELECT COUNT() FROM Properties__c' + whereClause;
        Integer totalCount = (Integer) Database.countQuery(countQuery);

        Integer offsetValue = (pageNumber - 1) * pageSize;
        String dataQuery = 'SELECT Id, Name, Street__c, City__c, Rent__c, Status__c, Furnishing_Status__c, Latitude__c, Longitude__c' +
                           ' FROM Properties__c' + whereClause +
                           ' ORDER BY CreatedDate DESC LIMIT ' + String.valueOf(pageSize) +
                           ' OFFSET ' + String.valueOf(offsetValue);

        List<SObject> results = Database.query(dataQuery);

        Map<String, Object> response = new Map<String, Object>();
        response.put('records', results);
        response.put('total', totalCount);
        return response;
    }
    @AuraEnabled(cacheable=true)
    public static List<Properties__c> getNearbyProperties(
    Decimal userLat,
    Decimal userLng,
    Decimal distanceKm
    ) {
    if (userLat == null || userLng == null || distanceKm == null) {
        return new List<Properties__c>();
    }

    // Haversine formula using SOQL
    String query =
        'SELECT Id, Name, Street__c, City__c, Rent__c, Status__c, ' +
        'Furnishing_Status__c, Latitude__c, Longitude__c ' +
        'FROM Properties__c ' +
        'WHERE ( ' +
            'ACOS( ' +
                'SIN(RADIANS(:userLat)) * SIN(RADIANS(Latitude__c)) + ' +
                'COS(RADIANS(:userLat)) * COS(RADIANS(Latitude__c)) * ' +
                'COS(RADIANS(Longitude__c) - RADIANS(:userLng)) ' +
            ') * 6371 ' +     // Earth radius in KM
        ') <= :distanceKm';

    return Database.query(query);
}

    
}
