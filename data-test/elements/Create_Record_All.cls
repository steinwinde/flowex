public with sharing class CreateRecordAll {
    
    private Account record;
    private Account AnotherAccount = null;
    private List<Account> ManyAccounts = new List<Account>();
    private Account Create_One_Use_Separate_Resources = null;
    
    public CreateRecordAll(Account record) {
        this.record = record;
        run();
    }
    
    private void run() {
        AnotherAccount = record;
        AnotherAccount.Id = '';
        insert AnotherAccount;
        Create_One_Use_Separate_Resources = new Account(BillingCity = 'Hamburg');
        insert Create_One_Use_Separate_Resources;
        Account Create_One_Use_Separate = new Account(BillingCity = 'Hamburg');
        insert Create_One_Use_Separate;
        AnotherAccount.Id = Create_One_Use_Separate.Id;
        insert ManyAccounts;
    }
}
