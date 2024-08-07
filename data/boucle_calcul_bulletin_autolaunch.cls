public with sharing class BoucleCalculBulletinAutolaunch {
    
    // Generated by FlowEx 0.1.1
    
    public Decimal brut_initial = null;
    public Decimal cumul_boucle = null;
    public Decimal net_payer_avant_impot = null;
    public Decimal var_base_complement_af = null;
    private Decimal var_base_cplt_URSSAF = null;
    public String var_bulletin_id = null;
    public Decimal var_ch_patronales_initial = null;
    public Decimal var_click_button = null;
    public String var_contact_id = null;
    public String var_contrat_salarie = null;
    public Date var_date_entree_salarie = null;
    public Date var_date_initialisation_compteur_cp = null;
    public Date var_date_initialisation_cumul_n = null;
    public Date var_date_initialisation_URSSAF = null;
    public Date var_debut_bulletin = null;
    public Date var_fin_periode_bulletin = null;
    public Decimal var_ind_comp_cp = null;
    public Decimal var_nap_initial = null;
    public Decimal var_nb_boucles = null;
    public Decimal var_net_imp_initial = null;
    public Decimal var_nouveau_brut = null;
    public Decimal var_nouveau_ch_patronales = null;
    public Decimal var_nouveau_nap = null;
    public Decimal var_nouveau_net_imposable = null;
    public Boolean var_report_conges = null;
    public Decimal var_SMIC_horaire_periode = null;
    public String var_taux_abattement = null;
    // TODO: Rephrase this formula in Apex and assign it to the variable below:
    // {!var_nap_initial}-{!var_nouveau_nap} (scale: 2)
    private Decimal diff_nouveau_nap_ancien_nap = null;
    // TODO: Rephrase this formula in Apex and assign it to the variable below:
    // {!var_ch_patronales_initial}-{!var_nouveau_ch_patronales} (scale: 2)
    private Decimal difference_ancien_nouveau_ch_patronales = null;
    // TODO: Rephrase this formula in Apex and assign it to the variable below:
    // {!brut_initial}-{!var_nouveau_brut} (scale: 2)
    private Decimal difference_entre_ancien_et_nouveau_brut = null;
    // TODO: Rephrase this formula in Apex and assign it to the variable below:
    // {!var_nouveau_net_imposable}-{!var_net_imp_initial} (scale: 2)
    private Decimal difference_nouveau_net_imp_ancien_net_impo = null;
    // TODO: Rephrase this formula in Apex and assign it to the variable below:
    // {!var_nb_boucles}+1 (scale: 0)
    private Decimal formula_ajout_boucle = null;
    // TODO: Rephrase this formula in Apex and assign it to the variable below:
    // {!var_click_button}+1 (scale: 0)
    private Decimal formula_click_button = null;
    // TODO: Rephrase this formula in Apex and assign it to the variable below:
    // {!var_click_button}*2 (scale: 0)
    private Decimal formula_click_buttonxboucles_possibles = null;
    // TODO: Rephrase this formula in Apex and assign it to the variable below:
    // {!var_nb_boucles}+1 (scale: 0)
    private Decimal formula_nb_boucles_plus_1 = null;
    private Paie_bulletin_entete__c reference_bulletin_sur_lequel_on_lance_les_calculs = null;
    
    public BoucleCalculBulletinAutolaunch(Decimal brut_initial, Decimal cumul_boucle, Decimal net_payer_avant_impot, Decimal var_base_complement_af, String var_bulletin_id, Decimal var_ch_patronales_initial, Decimal var_click_button, String var_contact_id, String var_contrat_salarie, Date var_date_entree_salarie, Date var_date_initialisation_compteur_cp, Date var_date_initialisation_cumul_n, Date var_date_initialisation_URSSAF, Date var_debut_bulletin, Date var_fin_periode_bulletin, Decimal var_ind_comp_cp, Decimal var_nap_initial, Decimal var_nb_boucles, Decimal var_net_imp_initial, Decimal var_nouveau_brut, Decimal var_nouveau_ch_patronales, Decimal var_nouveau_nap, Decimal var_nouveau_net_imposable, Boolean var_report_conges, Decimal var_SMIC_horaire_periode, String var_taux_abattement) {
        this.brut_initial = brut_initial;
        this.cumul_boucle = cumul_boucle;
        this.net_payer_avant_impot = net_payer_avant_impot;
        this.var_base_complement_af = var_base_complement_af;
        this.var_bulletin_id = var_bulletin_id;
        this.var_ch_patronales_initial = var_ch_patronales_initial;
        this.var_click_button = var_click_button;
        this.var_contact_id = var_contact_id;
        this.var_contrat_salarie = var_contrat_salarie;
        this.var_date_entree_salarie = var_date_entree_salarie;
        this.var_date_initialisation_compteur_cp = var_date_initialisation_compteur_cp;
        this.var_date_initialisation_cumul_n = var_date_initialisation_cumul_n;
        this.var_date_initialisation_URSSAF = var_date_initialisation_URSSAF;
        this.var_debut_bulletin = var_debut_bulletin;
        this.var_fin_periode_bulletin = var_fin_periode_bulletin;
        this.var_ind_comp_cp = var_ind_comp_cp;
        this.var_nap_initial = var_nap_initial;
        this.var_nb_boucles = var_nb_boucles;
        this.var_net_imp_initial = var_net_imp_initial;
        this.var_nouveau_brut = var_nouveau_brut;
        this.var_nouveau_ch_patronales = var_nouveau_ch_patronales;
        this.var_nouveau_nap = var_nouveau_nap;
        this.var_nouveau_net_imposable = var_nouveau_net_imposable;
        this.var_report_conges = var_report_conges;
        this.var_SMIC_horaire_periode = var_SMIC_horaire_periode;
        this.var_taux_abattement = var_taux_abattement;
        run();
    }
    
    private void run() {
        referenceBulletinSurLequelOnLanceLesCalculs();
    }
    
    private void referenceBulletinSurLequelOnLanceLesCalculs() {
        populatePaieBulletinEntetec();
        CalculLibellesBulletin calcul_libelles = new CalculLibellesBulletin(var_bulletin_id);
        var_bulletin_id = calcul_libelles.varBulletinId;
        CalculDuBulletin lance_calcul_bulletin = new CalculDuBulletin(var_taux_abattement, var_SMIC_horaire_periode, var_bulletin_id);
        var_nouveau_nap = lance_calcul_bulletin.netPayerBulletin;
        CalculDesCumulsDeBulletin lance_le_calcul_des_cumuls = new CalculDesCumulsDeBulletin(var_contact_id, var_contrat_salarie, var_date_entree_salarie, var_date_initialisation_compteur_cp, var_date_initialisation_cumul_n, var_date_initialisation_URSSAF, var_debut_bulletin, var_fin_periode_bulletin, var_report_conges, var_bulletin_id);
        var_bulletin_id = lance_le_calcul_des_cumuls.varBulletinId;
        updatemajNbBouclesSurBulletin();
        if(var_nb_boucles >= formula_click_buttonxboucles_possibles) {
            updatemajBulletinClickButton();
            
        } else {
            referenceBulletinSurLequelOnLanceLesCalculs();
            
        }
    }
    
    private void populatePaieBulletinEntetec() {
        List<Paie_bulletin_entete__c> l = [SELECT Brut_bulletin__c, Cotisations_patronales_bulletin__c, Cumul_imposable__c, Fin_de_periode__c, Net_bulletin_avant_impot__c, tech_click_button__c, tech_nb_boucles_calcul__c FROM Paie_bulletin_entete__c WHERE Id = :var_bulletin_id LIMIT 1];
        if(l.size()!=0) {
            brut_initial = l[0].Brut_bulletin__c;
            var_ch_patronales_initial = l[0].Cotisations_patronales_bulletin__c;
            var_net_imp_initial = l[0].Cumul_imposable__c;
            var_fin_periode_bulletin = l[0].Fin_de_periode__c;
            var_nap_initial = l[0].Net_bulletin_avant_impot__c;
            var_click_button = l[0].tech_click_button__c;
            var_nb_boucles = l[0].tech_nb_boucles_calcul__c;
        }
    }
    
    private void updatemajNbBouclesSurBulletin() {
        List<Paie_bulletin_entete__c> l = [SELECT Id FROM Paie_bulletin_entete__c WHERE Id = :var_bulletin_id];
        for(Paie_bulletin_entete__c item: l) {
            item.tech_nb_boucles_calcul__c = formula_ajout_boucle;
        }
        update l;
    }
    
    private void updatemajBulletinClickButton() {
        List<Paie_bulletin_entete__c> l = [SELECT Id FROM Paie_bulletin_entete__c WHERE Id = :var_bulletin_id];
        for(Paie_bulletin_entete__c item: l) {
            item.tech_click_button__c = formula_click_button;
        }
        update l;
    }
}

public with sharing class CalculLibellesBulletin {
    public Object varBulletinId;
    public Object varBaseCpltAf;
    public Object varBaseCpltUrssaf;
    public CalculLibellesBulletin(Object varBulletinId) {
        this.varBulletinId = varBulletinId;
    }
}

public with sharing class CalculDuBulletin {
    public Object varBulletinId;
    private Object varTauxAbattement;
    private Object varSMICHorairePeriode;
    public Object cumulChargesPatronales;
    public Object cumulSommeMontantsBRUT;
    public Object netPayerBulletin;
    public CalculDuBulletin(Object varBulletinId, Object varTauxAbattement, Object varSMICHorairePeriode) {
        this.varBulletinId = varBulletinId;
        this.varTauxAbattement = varTauxAbattement;
        this.varSMICHorairePeriode = varSMICHorairePeriode;
    }
}

public with sharing class CalculDesCumulsDeBulletin {
    public Object varBulletinId;
    private Object varContactId;
    private Object varContratSalarie;
    private Object varDateEntreeSalarie;
    private Object varDateInitialisationCompteurCp;
    private Object varDateInitialisationCumulN;
    private Object varDateInitialisationURSSAF;
    private Object varDebutBulletin;
    private Object varFinPeriodeBulletin;
    private Object varReportConges;
    public Object sommeNetImposable;
    public CalculDesCumulsDeBulletin(Object varBulletinId, Object varContactId, Object varContratSalarie, Object varDateEntreeSalarie, Object varDateInitialisationCompteurCp, Object varDateInitialisationCumulN, Object varDateInitialisationURSSAF, Object varDebutBulletin, Object varFinPeriodeBulletin, Object varReportConges) {
        this.varBulletinId = varBulletinId;
        this.varContactId = varContactId;
        this.varContratSalarie = varContratSalarie;
        this.varDateEntreeSalarie = varDateEntreeSalarie;
        this.varDateInitialisationCompteurCp = varDateInitialisationCompteurCp;
        this.varDateInitialisationCumulN = varDateInitialisationCumulN;
        this.varDateInitialisationURSSAF = varDateInitialisationURSSAF;
        this.varDebutBulletin = varDebutBulletin;
        this.varFinPeriodeBulletin = varFinPeriodeBulletin;
        this.varReportConges = varReportConges;
    }
}

