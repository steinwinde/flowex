public with sharing class UpdateConditional {
    
    // TODO: Add a WHERE clause like in the following SELECT to the query that populates the records passed into the class:
    // [SELECT Id FROM Account WHERE ((BillingCity = 'Hamburg' AND AccountSource LIKE '%Web%') OR Name LIKE 'Felix%') AND IsDeleted = false];
    
    private Account record;
    
    public UpdateConditional(Account record) {
        this.record = record;
        run();
    }
    
    private void run() {
        if((record.BillingCity == null) || record.BillingCountry.contains('Germ')) {
            record.BillingCountry = [SELECT Country FROM Organization].Country;
            update record;
        }
    }
}
