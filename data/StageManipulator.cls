public with sharing class StageManipulator {
    
    private static final List<String> Stages = new List<String>{'My_First_Stage_Var', 'My_rather_middle_stage'};
    private String ShowCurrentStage = null;
    private String Copy_1_of_Copy_2_of_ShowCurrentStage = null;
    private String Copy_1_of_AllStagesAvailable = null;
    private String Copy_1_of_ShowCurrentStage = null;
    private String AllStagesAvailable = null;
    private List<Integer> ActiveStages = new List<Integer>{};
    private Integer CurrentStage = null;
    
    public StageManipulator() {
        run();
    }
    
    private void run() {
        // UI "Info_at_the_beginning" begin (all assignments are stubs)
        // UI end
        CurrentStage = 0;
        ActiveStages.add(0);
        // UI "Info_in_the_middle" begin (all assignments are stubs)
        // UI end
        CurrentStage = 1;
        ActiveStages.add(1);
        // UI "Info_in_the_end" begin (all assignments are stubs)
        // UI end
    }
}
