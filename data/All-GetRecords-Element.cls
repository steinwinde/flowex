public with sharing class AllGetRecordsElements {
    
    private Account record;
    public String MyDepartment = null;
    private Contact Get_Children_A = null;
    private Contact Get_Children_B = null;
    private Contact Get_Children_C = null;
    private Contact Get_Children_D = null;
    private List<Contact> Get_Children_E = new List<Contact>();
    private List<Contact> Get_Children_F = new List<Contact>();
    private List<Contact> Get_Children_G = new List<Contact>();
    
    public AllGetRecordsElements(Account record, String MyDepartment) {
        this.record = record;
        this.MyDepartment = MyDepartment;
        run();
    }
    
    private void run() {
        Get_Children_A = getContact();
        Get_Children_B = getContact1();
        populateContact();
        populateContact1();
        Get_Children_E = [SELECT Id FROM Contact WHERE AssistantName = 'Felix'];
        Get_Children_F = [SELECT Id, AssistantName FROM Contact WHERE Birthdate = :Date.newInstance(1968, 4, 22)];
        Get_Children_E = [SELECT Id, CleanStatus, Birthdate FROM Contact WHERE AssistantName = 'Felix'];
    }
    
    private Contact getContact() {
        return [SELECT Id FROM Contact WHERE AccountId = :record.Id LIMIT 1] ?? null;
    }
    
    private Contact getContact1() {
        return [SELECT Id, Birthdate FROM Contact WHERE AccountId = :record.Id LIMIT 1] ?? null;
    }
    
    private void populateContact() {
        List<Contact> l = [SELECT Id, Department FROM Contact WHERE AccountId = :record.Id LIMIT 1];
        if(l.size()!=0) {
            Get_Children_A.Id = l[0].Id;
            Get_Children_A.Department = l[0].Department;
        }
    }
    
    private void populateContact1() {
        List<Contact> l = [SELECT Department FROM Contact WHERE AccountId = :record.Id LIMIT 1];
        if(l.size()!=0) {
            MyDepartment = l[0].Department;
        } else {
            MyDepartment = null;
        }
    }
}
