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
            if(Get_Contacts != null) {
                illogical();
            } else {
                illogical();
            }
        } catch(Exception e) {
            try {
                mySendFriendly(CurrentStage, 'fvanhove@gmx.de', 'Foobar');
                illogical();
            } catch(Exception e) {
                x = 88.0;
                getContacts();
                return;
            }
            return;
        }
    }
    
    private Contact getContact() {
        return [SELECT Id FROM Contact WHERE AccountId = :record.Id LIMIT 1] ?? null;
    }
    
    private void illogical() {
        x = 11.0;
    }
    
    private void mySendFriendly(String emailBody, String emailAddresses, String emailSubject) {
        Messaging.reserveSingleEmailCapacity(1);
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setSaveAsActivity(false);
        List<String> toAddresses = new List<String>();
        toAddresses.addAll(emailAddresses.split(','));
        mail.setToAddresses(toAddresses);
        mail.setSubject(emailSubject);
        mail.setPlainTextBody(emailBody);
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
    }
}
