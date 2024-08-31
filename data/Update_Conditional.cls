public with sharing class UpdateConditional {
    
    // TODO: Add a WHERE clause like in the following SELECT to the query that populates the records passed into the class:
    // [SELECT Id FROM Account WHERE ((BillingCity = 'Hamburg' AND AccountSource LIKE '%Web%') OR Name LIKE 'Felix%') AND IsDeleted = false];
    
    public UpdateConditional() {
        run();
    }
    
    private void run() {
        if((((Account)Trigger.new[0]).BillingCity == null) || ((Account)Trigger.new[0]).BillingCountry.contains('Germ')) {
            ((Account)Trigger.new[0]).BillingCountry = [SELECT Country FROM Organization].Country;
            update Trigger.new[0];
        }
    }
}

