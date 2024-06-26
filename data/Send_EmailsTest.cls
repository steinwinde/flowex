@IsTest
private class SendEmailsTest {
    
    @IsTest
    private static void testAll() {
        Account a = [SELECT Id FROM Account];
        Test.startTest();
        SendEmails se = new SendEmails(a);
        Test.stopTest();
        List<Contact> l = se.Get_Contacts;
        for(Contact c: l) {
            System.debug(c.AssistantName);
        }
    }
    
	@TestSetup
    private static void testSetup() {
        Account a = new Account(Name = 'Hamburger Hafen');
        insert a;
        Date d = Date.newInstance(1910, 1, 1);
        Contact c0 = new Contact(LastName = 'Abel', AssistantName = 'Mu', Birthdate = d);
        Contact c1 = new Contact(LastName = 'Bebel', AssistantName = 'Nu', Birthdate = d);
        Contact c2 = new Contact(LastName = 'Cobel', AssistantName = 'Aga', Birthdate = d);
        Contact c3 = new Contact(LastName = 'Dibel', AssistantName = 'Bega', Birthdate = d);
        Contact c4 = new Contact(LastName = 'Ebel', AssistantName = 'Xen', Birthdate = d);
        insert new List<Contact>{c0, c1, c2, c3, c4};
        
    }
}