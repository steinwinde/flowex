public with sharing class DeleteRecordsAll {
    
    private List<Account> ManyRecords = new List<Account>();
    private Account SomeRecord = null;
    
    public DeleteRecordsAll() {
        run();
    }
    
    private void run() {
        SomeRecord = ((Account)Trigger.new[0]);
        ManyRecords.add(SomeRecord);
        delete SomeRecord;
        delete ManyRecords;
        delete [SELECT Id FROM Account WHERE (BillingCountry = 'France' AND BillingCity = 'Paris') OR BillingCountry LIKE '%Germany%'];
    }
}

