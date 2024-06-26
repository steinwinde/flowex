public with sharing class DeleteRecordsAll {
    
    private Account record;
    private List<Account> ManyRecords = new List<Account>();
    private Account SomeRecord = null;
    
    public DeleteRecordsAll(Account record) {
        this.record = record;
        run();
    }
    
    private void run() {
        SomeRecord = record;
        ManyRecords.add(SomeRecord);
        delete SomeRecord;
        delete ManyRecords;
        delete [SELECT Id FROM Account WHERE (BillingCountry = 'France' AND BillingCity = 'Paris') OR BillingCountry LIKE '%Germany%'];
    }
}
