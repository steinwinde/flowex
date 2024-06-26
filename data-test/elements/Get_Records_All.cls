public with sharing class GetRecordsAll {
    
    private static final String Constantfornotequal = 'Foo';
    private Account record;
    private Account SomeAccount = null;
    private Boolean SomeBoolean = null;
    private String SomeId = null;
    private List<Account> SomeRecordCollection = new List<Account>();
    private String SomeText = null;
    private List<Account> All_Records_Automatically = new List<Account>();
    private List<Account> All_records_Choose_fields_and_assign_variables = new List<Account>();
    private List<Account> All_Records_Choose_fields_and_let_Salesforce = new List<Account>();
    private Account Get_my_records_only_the_first_Automatically_store = null;
    private Account Only_the_first_Automatically_With_additions = null;
    private Account Only_the_first_choose_fields_and_assign_Together = null;
    private Account Only_the_first_Choose_fields_and_let_Salesforce = null;
    private Account Only_the_first_Choose_fields_and_let_Salesforce_with_additions = null;
    private Account Only_the_first_Choose_fields_assign_In_separate = null;
    private Account When_no_records_are_assigned_set_null = null;
    
    public GetRecordsAll(Account record) {
        this.record = record;
        run();
    }
    
    private void run() {
        Get_my_records_only_the_first_Automatically_store = getAccount();
        Only_the_first_Automatically_With_additions = getAccount1();
        Only_the_first_Choose_fields_and_let_Salesforce = getAccount2();
        Only_the_first_Choose_fields_and_let_Salesforce_with_additions = getAccount3();
        populateAccount();
        populateAccount1();
        populateAccount2();
        All_Records_Automatically = [SELECT Id FROM Account ORDER BY Industry DESC];
        All_Records_Choose_fields_and_let_Salesforce = [SELECT Id, BillingCity FROM Account ORDER BY AccountSource ASC];
        SomeRecordCollection = [SELECT Id, BillingCountry FROM Account];
    }
    
    private Account getAccount() {
        return [SELECT Id FROM Account WHERE BillingCity = :record.Id LIMIT 1] ?? null;
    }
    
    private Account getAccount1() {
        return [SELECT Id FROM Account WHERE AccountNumber = '11' OR AccountSource != :Constantfornotequal ORDER BY BillingCity DESC LIMIT 1] ?? null;
    }
    
    private Account getAccount2() {
        return [SELECT Id, OwnerId FROM Account LIMIT 1] ?? null;
    }
    
    private Account getAccount3() {
        return [SELECT Id FROM Account WHERE ((AccountNumber = '11' AND AccountSource = 'Web') OR BillingCity = 'Paris') AND BillingCountry != 'Germany' ORDER BY Sic ASC LIMIT 1] ?? null;
    }
    
    private void populateAccount() {
        List<Account> l = [SELECT Id FROM Account LIMIT 1];
        if(l.size()!=0) {
            SomeAccount.Id = l[0].Id;
        }
    }
    
    private void populateAccount1() {
        List<Account> l = [SELECT AccountSource, IsDeleted FROM Account LIMIT 1];
        if(l.size()!=0) {
            SomeText = l[0].AccountSource;
            SomeBoolean = l[0].IsDeleted;
        }
    }
    
    private void populateAccount2() {
        List<Account> l = [SELECT OwnerId FROM Account WHERE AccountSource = 'Purchased List' LIMIT 1];
        if(l.size()!=0) {
            SomeId = l[0].OwnerId;
        } else {
            SomeId = null;
        }
    }
}
