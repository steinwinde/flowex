public with sharing class TrickyDecisions {
    
    public String Address = null;
    private String XYZ = null;
    
    public TrickyDecisions(String Address) {
        this.Address = Address;
        run();
    }
    
    private void run() {
        XYZ = null;
        if(Address == null) {
            Address = '42';
        }
    }
}
