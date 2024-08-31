public with sharing class TextAssignments {
    
    private List<String> CommonVars = new List<String>();
    private String SingleText = null;
    private List<String> TextList = new List<String>();
    
    public TextAssignments() {
        run();
    }
    
    private void run() {
        SingleText = 'ABC';
        SingleText += 'DEF';
        SingleText += 'GHI';
        TextList.add(SingleText);
        CommonVars.add('ABC');
        CommonVars.add('Abel');
        TextList.add(0, '0123456789');
        TextList.add(0, 'XYZ');
        for(Integer i=0; i<TextList.size(); i++) {
            if(TextList.get(i).equals('0123456789')) {
                TextList.remove(i);
                break;
            }
        }
        for(Integer i=0; i<TextList.size(); i++) {
            if(TextList.get(i).equals('XYZ')) {
                for(Integer j=TextList.size()-1; j>i; j--) {
                    TextList.remove(j);
                }
                break;
            }
        }
        TextList.add('Fung\'us');
        TextList.remove(1);
        TextList.add('666');
        for(Integer i=0; i<TextList.size(); i++) {
            if(TextList.get(i).equals('Fung\'us')) {
                for(Integer j=i-1; j>=0; j--) {
                    TextList.remove(j);
                }
                break;
            }
        }
        TextList.add('Abel');
        for(Integer i=TextList.size()-1; i>=0; i--) {
            if(!CommonVars.contains(TextList.get(i))) {
                TextList.remove(i);
            }
        }
        for(Integer i=TextList.size()-1; i>=0; i--) {
            if(TextList.get(i).equals('Abel')) {
                TextList.remove(i);
            }
        }
    }
}

