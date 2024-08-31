public with sharing class AssignBasedOnParent {
    
    // TODO: Rephrase this formula in Apex and assign it to the variable below:
    // IF(TEXT({!$Record.Status})='Obsolete',100,200) (scale: 0)
    private Integer LikelyEmployeeNumber = null;
    private Account Get_Account = null;
    
    public AssignBasedOnParent() {
        run();
    }
    
    private void run() {
        Get_Account = getAccount();
        if(Get_Account != null && Get_Account.Website != null) {
            if(((Asset)Trigger.new[0]).Status == 'Installed') {
                Get_Account.Active__c = 'Yes';
                updateAccount();
            }
        } else {
            Get_Account.Description = ((Asset)Trigger.new[0]).City;
            Get_Account.NumberOfEmployees += LikelyEmployeeNumber;
            updateAccount();
        }
    }
    
    private Account getAccount() {
        return [SELECT Id FROM Account WHERE Id = :((Asset)Trigger.new[0]).AccountId LIMIT 1] ?? null;
    }
    
    private void updateAccount() {
        update Get_Account;
    }
}

