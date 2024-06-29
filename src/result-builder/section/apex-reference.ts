import { ApexSection } from './apex-section.js';
import { VAR_RECORD } from '../apex-variable.js';
import { soql } from '../soql/soql-query.js';

// TODO: This should hold a variable and the build method should be called in the context of parent section builds
// or why is this an ApexSection?
export class ApexReference extends ApexSection {

    private reference: string = '';

    set(reference: string): ApexReference {
        this.reference = ApexReference.getReference(reference);
        super.addStringSection(this.reference);
        
        return this;
    }

    // TODO: Is this always correct? Is there no better way?
    isField(): boolean {
        return  !this.reference.startsWith('$') 
            && !this.reference.endsWith(']') 
            && this.reference.includes('.');
    }

    getFirstPart(): string {
        if (this.isField()) {
            const obj: string = this.reference.split('.')[0];
            return obj;
        }

        return this.reference;
    }

    // -----------------------------------------------------------------------------------------------------------------
    // private
    // -----------------------------------------------------------------------------------------------------------------

    // TODO: Unnecessarily static
    private static getReference(s: string) : string {
        if (!s.includes('.')) {
            if (s === '$Record') {
                return VAR_RECORD;
            }
    
            return s;
        }
    
        // potentially many dots resp. parents
        const ind = s.indexOf('.');
        const left = s.slice(0, Math.max(0, ind));
        const right = s.slice(1 + ind, s.length);
    
        // list of options is gleaned from the New Create Records dialogue:
        switch (left) {
        case '$Api': {
            if (right === 'Session_ID') {
                const result = 'UserInfo.getSessionId()';
                // return Variable.getInstance4RightHand(result);
                return result;
            }
    
            // WSDL SOAP endpoints including version, something like:
            //   $Api.Enterprise_Server_URL_220
            //   $Api.Enterprise_Server_URL_420
            //   etc.
            // return Variable.getInstance4RightHandVariable('wsdlSoapEndpoint', 'String', right, true, true);
            return right;
        }
    
        case '$Flow': {
            return ApexReference.getFlow(right);
        }
    
        case '$GlobalConstant': {
            // either EmptyString or True or False
            const result: string = right === 'EmptyString' ? 'null' : right.toLowerCase();
            // return Variable.getInstance4RightHand(v);
            return result;
        }
    
        case '$Organization': {
            return ApexReference.getOrganization(right);
        }
    
            // return 'o.' + right;
        case '$Profile': {
            return ApexReference.getProfile(right);
        }
    
        case '$Record': {
            const v : string = 'record.' + right;
            // return Variable.getInstance4RightHandVariable('is ignored', 'is ignored', v, false, false);
            return v;
        }
    
        // case '$Record_Prior':
        //     return getRecordPrior(right);
        case '$System': {
            return ApexReference.getSystem(right);
        }
    
        case '$User': {
            return ApexReference.getUser(right);
        }
    
        case '$UserRole': {
            return ApexReference.getUserRole(right);
        }
        }
    
        // return Variable.getInstance4RightHand(s);
        return s;
    }

    private static getFlow(right: string) : string {
        // https://help.salesforce.com/s/articleView?id=sf.flow_ref_resources_system_variables.htm&type=5
        // Not all of below make sense in an Apex context, but we can still provide them
        // something like:
        // $Flow.CurrentDate
        // $Flow.CurrentStage
        // $Flow.InterviewGuid
        switch (right) {
            case 'CurrentDate': {
                return 'Date.today()';
            }
        
            case 'CurrentDateTime':
            case 'InterviewStartTime': {
                return 'Date.now()';
            }
        
            case 'ActiveStages':
            case 'CurrentStage': {
                return right;
            }

            // case 'CurrentRecord':
            // case 'InterviewGuid':
            // case 'FaultMessage': 
            default: {
                return `'${right}'`;
            }
        }
    }
    
    private static getOrganization(right: string) : string {
        // TODO: the following worked for me for all choices but "GoogleAppsDomain"; not
        // sure, if this is due to my org config
        const s = soql().select(right).from('Organization').exposeField(right).build();
        // return Variable.getInstance4RightHand(s);
        return s;
    }
    
    private static getProfile(right: string) : string {
        // referring to current user's profile
        if (right === 'Id') {
            // return Variable.getInstance4RightHand('UserInfo.getProfileId()');
            return 'UserInfo.getProfileId()';
        }
    
        // TODO: the following worked for me for all choices but "UsageType"; not
        // sure, if this is due to my org config
        const s = soql().select(right).from('Profile').where('Id =: UserInfo.getProfileId()').exposeField(right).build();
        // return Variable.getInstance4RightHand(s);
        return s;
    }
    
    // TODO: implement along with dummy call from Trigger
    // private static getRecordPrior(right: string) : Variable {
    //     return...
    // }
    
    private static getSystem(right: string) : string {
        if (right === 'OriginDateTime') {
            // https://developer.salesforce.com/docs/atlas.en-us.pages.meta/pages/pages_variables_global_systemorigindatetime.htm
            // return Variable.getInstance4RightHand('Date.newInstance(1900, 1, 1)');
            return 'Date.newInstance(1900, 1, 1)';
        }
    
        // TODO: haven't found any other fields - are there?!
        // TODO: is this meaningful?
        // return Variable.getInstance4RightHand('null');
        // TODO: is this meaningful?
        return right;
    }
    
    private static getUser(right: string) : string {
        // probably not relevant for the flows that are supported for a start
        const m: Map<string, string> = new Map<string, string>([
            ['Id', 'UserInfo.getUserId()'],
            ['FirstName', 'UserInfo.getFirstName()'],
            ['LastName', 'UserInfo.getLastName()'],
            ['UITheme', 'UserInfo.getUiTheme()'],
            ['UIThemeDisplayed', 'UserInfo.getUiThemeDisplayed()'],
            ['Email', 'UserInfo.getUserEmail()'],
            ['Username', 'UserInfo.getUserName()'],
            ['UserRoleId', 'UserInfo.getUserRoleId()'],
            ['UserType', 'UserInfo.getUserType()'],
            ['ProfileId', 'UserInfo.getProfileId()'],
        ]);
    
        if (m.has(right)) {
            // return Variable.getInstance4RightHand(m.get(right)!);
            return m.get(right)!;
        }
    
        // Address, Alias, City, CommunityNickname, CompanyName, ContactId, Country, Department, Division, EmployeeNumber
        // Extension, Fax, FederationIdentifier, GeocodeAccuracy
        // IsActive, LanguageLocaleKey, Latitude, LocaleSidKey,
        // Longitude, ManagerId, MobilePhone, Phone, PostalCode, Signature, State, Street, TimeZoneSidKey, Title,
        if (right !== 'StartDay' && right !== 'EndDay') {
            return soql().select(right).from('User').where('Id =: UserInfo.getUserId()').build();
        }
    
        // TODO: where to get the fields StartDay and EndDay from?! Didn't work via SOQL for me.
    
        // TODO: is this meaningful?
        // return Variable.getInstance4RightHand('null');
        return right;
    }
    
    private static getUserRole(right: string) : string {
        if (right === 'Id') {
            // return Variable.getInstance4RightHand('UserInfo.getUserRoleId()');
            return 'UserInfo.getUserRoleId()';
        }
    
        return soql().select(right).from('UserRole').where('Id = : UserInfo.getUserRoleId()').build();
    }
}