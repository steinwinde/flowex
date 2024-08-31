public with sharing class UpdateAllChildRecords {
    
    private List<Contact> Get_Contacts = new List<Contact>();
    
    public UpdateAllChildRecords() {
        run();
    }
    
    private void run() {
        Get_Contacts = [SELECT Id FROM Contact WHERE AccountId = :((Account)Trigger.new[0]).Id];
        iterateContacts();
    }
    
    private void iterateContacts() {
        for(Contact Iterate_Contacts: Get_Contacts) {
            Iterate_Contacts.AssistantName = ((Account)Trigger.new[0]).Name;
        }
        update Get_Contacts;
    }
}

