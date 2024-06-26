public with sharing class AssignBasedOnParent {
    
    private Asset record;
    // TODO: Rephrase this formula in Apex and assign it to the variable below:
    // IF(TEXT({!$Record.Status})='Obsolete',100,200) (scale: 0)
    private Integer LikelyEmployeeNumber = null;
    private Account Get_Account = null;
    
    public AssignBasedOnParent(Asset record) {
        this.record = record;
        run();
    }
    
    private void run() {
        Get_Account = getAccount();
        if(Get_Account != null && Get_Account.Website != null) {
            if(record != null && record.Status == 'Installed') {
                Get_Account.Active__c = 'Yes';
                updateAccount();
            }
        } else {
            Get_Account.Description = record.City;
            Get_Account.NumberOfEmployees += LikelyEmployeeNumber;
            updateAccount();
        }
    }
    
    private Account getAccount() {
        return [SELECT Id FROM Account WHERE Id = :record.AccountId LIMIT 1] ?? null;
    }
    
    private void updateAccount() {
        update Get_Account;
    }
}
