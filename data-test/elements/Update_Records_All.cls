public with sharing class UpdateRecordsAll {
    
    private Account record;
    private List<Account> MyCollection = new List<Account>();
    
    public UpdateRecordsAll(Account record) {
        this.record = record;
        run();
    }
    
    private void run() {
        record.BillingCountry = 'France';
        update record;
        if((record.BillingCity == 'Paris') || (record.BillingCountry == 'Germany')) {
            record.BillingCountry = 'Georgia';
            update record;
        }
        update record;
        update MyCollection;
        updateUpdateRecordsSpecifyConditionsAll();
        updateUpdateRecordsSpecifyConditionsSpecify();
    }
    
    private void updateUpdateRecordsSpecifyConditionsAll() {
        List<Account> l = [SELECT Id FROM Account];
        for(Account item: l) {
            item.BillingCountry = 'Georgia';
        }
        update l;
    }
    
    private void updateUpdateRecordsSpecifyConditionsSpecify() {
        List<Account> l = [SELECT Id FROM Account WHERE AccountSource != 'Phone Inquiry'];
        for(Account item: l) {
            item.BillingCountry = 'Georgia';
        }
        update l;
    }
}
