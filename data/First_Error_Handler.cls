public with sharing class FirstErrorHandler {
    
    private Account record;
    private Decimal x = null;
    private Contact Get_Contacts = null;
    
    public FirstErrorHandler(Account record) {
        this.record = record;
        run();
    }
    
    private void run() {
        getContacts();
    }
    
    private void getContacts() {
        try {
            Get_Contacts = getContact();
        } catch(Exception e) {
            mySendFriendly();
            return;
        }
        if(Get_Contacts != null) {
            illogical();
        } else {
            illogical();
        }
    }
    
    private Contact getContact() {
        return [SELECT Id FROM Contact WHERE AccountId = :record.Id LIMIT 1] ?? null;
    }
    
    private void mySendFriendly() {
        try {
            Messaging.reserveSingleEmailCapacity(1);
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            String[] toAddresses = new String[] {'fvanhove@gmx.de'}; 
            mail.setToAddresses(toAddresses);
            mail.setSubject('Foobar');
            mail.setPlainTextBody(CurrentStage);
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
        } catch(Exception e) {
            x = 88.0;
            getContacts();
            return;
        }
        illogical();
    }
    
    private void illogical() {
        x = 11.0;
    }
}
