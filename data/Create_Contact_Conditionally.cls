public with sharing class CreateContactConditionally {
    
    private Contact Create_Contact = null;
    private Contact Get_Existing_Contacts = null;
    
    public CreateContactConditionally() {
        run();
    }
    
    private void run() {
        Get_Existing_Contacts = getContact();
        if(Get_Existing_Contacts != null && Get_Existing_Contacts.Birthdate == Date.newInstance(1968, 4, 22)) {
            // nothing to do
        } else {
            Create_Contact = new Contact(
                AccountId = ((Account)Trigger.new[0]).Id,
                AssistantName = [SELECT Name FROM Organization].Name,
                Birthdate = Date.newInstance(1968, 4, 22),
                CleanStatus = 'Acknowledged',
                Description = UserInfo.getSessionId(),
                Email = UserInfo.getUserEmail(),
                LastName = 'van Hove',
                OtherCity = [SELECT Name FROM Profile WHERE Id =: UserInfo.getProfileId()].Name
            );
            insert Create_Contact;
        }
    }
    
    private Contact getContact() {
        return [SELECT Id FROM Contact WHERE AccountId = :((Account)Trigger.new[0]).Id AND Birthdate = :Date.newInstance(1968, 4, 22) LIMIT 1] ?? null;
    }
}

