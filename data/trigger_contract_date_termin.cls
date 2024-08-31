public with sharing class TriggerContractDateTermine {
    
    // TODO: Add a WHERE clause like in the following SELECT to the query that populates the records passed into the class:
    // [SELECT Id FROM Contract WHERE Statut__c = 'Terminé'];
    
    public TriggerContractDateTermine() {
        run();
    }
    
    private void run() {
        ((Contract)Trigger.new[0]).Date_statut_termine__c = Date.today();
    }
}

