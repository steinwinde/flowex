public with sharing class RunSubflows {
    
    private static final String SomeConstantThatismycontainer = 'false';
    private static final String SomeStringForAnInput = 'Odessa';
    private Account record;
    private String OutputOfMultiselectPicklist = null;
    private List<Decimal> SomeNumberInputButMulti = new List<Decimal>();
    private List<Decimal> SomeNumbersFromSubflow = new List<Decimal>();
    private String SomeTextOutput = null;
    private String SomeTextVariable = null;
    private Subflow1 Calling_the_subflow_1_again = null;
    private Subflow2 Calling_the_Subflow_2 = null;
    
    public RunSubflows(Account record) {
        this.record = record;
        run();
    }
    
    private void run() {
        Subflow1 Calling_the_Subflow_1 = new Subflow1();
        Calling_the_subflow_1_again = new Subflow1();
        SomeNumbersFromSubflow = Calling_the_subflow_1_again.InOutNumberMultiVariable;
        SomeTextOutput = Calling_the_subflow_1_again.InOutStringVariable;
        OutputOfMultiselectPicklist = Calling_the_subflow_1_again.OutMultiselectPicklist;
        Calling_the_Subflow_2 = new Subflow2(SomeNumberInputButMulti, SomeStringForAnInput);
        SomeNumbersFromSubflow = Calling_the_Subflow_2.InOutNumberMultiVariable;
        SomeTextOutput = Calling_the_Subflow_2.InOutStringVariable;
        SomeTextVariable = Calling_the_Subflow_2.OutMultiselectPicklist;
    }
}

public with sharing class Subflow1 {
    
    public List<Decimal> InOutNumberMultiVariable = new List<Decimal>();
    public String InOutStringVariable = null;
    public String OutMultiselectPicklist = null;
    
    public Subflow1() {
    }
}

public with sharing class Subflow2 {
    
    public List<Decimal> InOutNumberMultiVariable = new List<Decimal>();
    public String InOutStringVariable = null;
    public String OutMultiselectPicklist = null;
    
    public Subflow2(List<Decimal> InOutNumberMultiVariable, String InOutStringVariable) {
        this.InOutNumberMultiVariable = InOutNumberMultiVariable;
        this.InOutStringVariable = InOutStringVariable;
    }
}
