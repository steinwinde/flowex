public with sharing class InformUsersAnAccountGotUpdated {
    
    private Account record;
    
    public InformUsersAnAccountGotUpdated(Account record) {
        this.record = record;
        run();
    }
    
    private void run() {
        wARNING(record.Id);
    }
    
    private void wARNING(Id recordId) {
        // TODO: Provide DeveloperName of the email template configured on Inform_users_an_Account_has_changed
        Id templateId = [SELECT Id FROM EmailTemplate WHERE DeveloperName = '...'].Id;
        // TODO: Create list of recipients as configured on Inform_users_an_Account_has_changed
        String[] toAddresses = new String[] {''}; 
        
        Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
        mail.setTargetObjectId(UserInfo.getUserId());
        mail.setTreatTargetObjectAsRecipient(false);
        mail.setTemplateId(templateId);
        mail.setToAddresses(toAddresses);
        // TODO: Configure subject and body of email configured on Inform_users_an_Account_has_changed
        mail.setSubject('');
        mail.setPlainTextBody('');
        Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });
    }
}
