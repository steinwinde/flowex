public with sharing class UpdateAllChildRecords {
    
    private Account record;
    private List<Contact> Get_Contacts = new List<Contact>();
    
    public UpdateAllChildRecords(Account record) {
        this.record = record;
        run();
    }
    
    private void run() {
        Get_Contacts = [SELECT Id FROM Contact WHERE AccountId = :record.Id];
        iterateContacts();
    }
    
    private void iterateContacts() {
        for(Contact Iterate_Contacts: Get_Contacts) {
            Iterate_Contacts.AssistantName = record.Name;
        }
        update Get_Contacts;
    }
}
