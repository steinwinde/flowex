public with sharing class SendEmails {
    
    public class ContactWrapper implements Comparable {
        Contact c;
        public ContactWrapper(Contact c) {
            this.c = c;
        }
        public Integer compareTo(Object obj) {
            ContactWrapper compareTo = (ContactWrapper) obj;
            Integer result = 0;
            if(c.AssistantName > compareTo.c.AssistantName) {
                result = 1;
            }
            return result;
        }
    }
    
    private Account record;
    private List<Contact> Get_Contacts = new List<Contact>();
    private List<Contact> Get_newly_sorted = new List<Contact>();
    private OmnichannelChatQueuesChat Foofoo = null;
    
    public SendEmails(Account record) {
        this.record = record;
        run();
    }
    
    private void run() {
        Get_Contacts = [SELECT AssistantName FROM Contact WHERE Birthdate < :Date.newInstance(1968, 4, 22) ORDER BY Birthdate DESC];
        loopOverPeople();
    }
    
    private void loopOverPeople() {
        for(Contact Loop_over_people: Get_Contacts) {
            goodFriend(Loop_over_people.Id);
        }
        sortGetNewlySorted();
        Foofoo = new OmnichannelChatQueuesChat();
    }
    
    private void goodFriend(Id loopOverPeopleId) {
        // TODO: Provide DeveloperName of the email template configured on Send_me_home
        Id templateId = [SELECT Id FROM EmailTemplate WHERE DeveloperName = '...'].Id;
        // TODO: Create list of recipients as configured on Send_me_home
        String[] toAddresses = new String[] {''}; 
        
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setTargetObjectId(UserInfo.getUserId());
        mail.setTreatTargetObjectAsRecipient(false);
        mail.setTemplateId(templateId);
        mail.setToAddresses(toAddresses);
        // TODO: Configure subject and body of email configured on Send_me_home
        mail.setSubject('');
        mail.setPlainTextBody('');
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
    }
    
    private void sortGetNewlySorted() {
        List<ContactWrapper> wrapperList = new List<ContactWrapper>();
        for(Contact item: Get_Contacts) {
            wrapperList.add(new ContactWrapper(item));
        }
        wrapperList.sort();
        Get_Contacts.clear();
        for(Integer i=0; i<wrapperList.size() && i<3; i++) {
            Get_Contacts.add(wrapperList[i].c);
        }
    }
}

public with sharing class OmnichannelChatQueuesChat {
    
    public OmnichannelChatQueuesChat() {
    }
}
