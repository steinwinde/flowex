public with sharing class UpdateRecordsAll {
    
    private List<Account> MyCollection = new List<Account>();
    
    public UpdateRecordsAll() {
        run();
    }
    
    private void run() {
        ((Account)Trigger.new[0]).BillingCountry = 'France';
        update Trigger.new[0];
        if((((Account)Trigger.new[0]).BillingCity == 'Paris') || (((Account)Trigger.new[0]).BillingCountry == 'Germany')) {
            ((Account)Trigger.new[0]).BillingCountry = 'Georgia';
            update Trigger.new[0];
        }
        update Trigger.new[0];
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

