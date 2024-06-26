public with sharing class TriggerContractDateTermine {
    
    // TODO: Add a WHERE clause like in the following SELECT to the query that populates the records passed into the class:
    // [SELECT Id FROM Contract WHERE Statut__c = 'Terminé'];
    
    private Contract record;
    
    public TriggerContractDateTermine(Contract record) {
        this.record = record;
        run();
    }
    
    private void run() {
        record.Date_statut_termine__c = Date.today();
    }
}
