public with sharing class DeleteFilteredChildContacts {
    
    private Account record;
    private Contact currentItem_Filter_Paris = null;
    private List<Contact> Get_Child_Contacts_from_Paris = new List<Contact>();
    private List<Contact> Filter_Paris = new List<Contact>();
    
    public DeleteFilteredChildContacts(Account record) {
        this.record = record;
        run();
    }
    
    private void run() {
        Get_Child_Contacts_from_Paris = [SELECT MailingCity FROM Contact WHERE AccountId = :record.Id];
        for(Contact currentItem_Filter_Paris: Get_Child_Contacts_from_Paris) {
            if(currentItem_Filter_Paris.MailingCity == 'Paris') {
                Filter_Paris.add(currentItem_Filter_Paris);
            }
        }
        delete Filter_Paris;
    }
}
