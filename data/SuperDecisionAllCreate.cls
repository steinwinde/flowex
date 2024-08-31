public with sharing class SuperDecisionAllCreate {
    
    // TODO: Add a WHERE clause like in the following SELECT to the query that populates the records passed into the class:
    // [SELECT Id FROM Account WHERE AccountNumber != '13' OR BillingCountry != 'Germany'];
    
    private List<Account> CCCListCCC = new List<Account>();
    public Account MyCCCList = null;
    // TODO: Rephrase this formula in Apex and assign it to the variable below:
    // TODAY()
    private Date MyToday = null;
    private Account Create_B = null;
    
    public SuperDecisionAllCreate(List<Account> CCCListCCC, Account MyCCCList) {
        this.CCCListCCC = CCCListCCC;
        this.MyCCCList = MyCCCList;
        run();
    }
    
    private void run() {
        if((((Account)Trigger.new[0]).Rating == 'Hot') && (((Account)Trigger.new[0]).NumberOfEmployees <= 5555555.0)) {
            if(MyToday == Date.newInstance(1968, 4, 22)) {
                insert Trigger.new[0];
            } else {
                Create_B = new Account(Name = 'BBB');
                insert Create_B;
            }
        } else if(((Account)Trigger.new[0]).AnnualRevenue == 42.0) {
            insert CCCListCCC;
        } else if(((Account)Trigger.new[0]).Fax.contains('22')) {
            insert CCCListCCC;
        }
    }
}

