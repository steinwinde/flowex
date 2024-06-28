import {camelize} from '../../utils.js';
import { soql } from '../../result-builder/soql/soql-query.js';
import { BasicAction } from './basic-action.js';

// In an email alert, the "actionName" holds both the name of the object and the "Unique Name" of the alert, e.g.
// "Contact.Send_me_home".
// Email Alerts are not available in Apex (if one does not want to resort to REST calls). What one would
// want to do is: Implement the sending of emails with the parameters configured on the alert:
// recipient(s), email template
export default class EmailAlert implements BasicAction {

    private body: string;
    private parameterTypes = new Map<string, string>(
        [['SObjectRowId', 'Id']]
    );
    
    constructor(name: string, actionName: string, inputParams: Map<string, string>) {

        const ar: string[] = actionName.split('.');
        // const obj: string = ar[0];
        const uniqueName: string = ar[1];
        // const sid: string = inputParams.get('SObjectRowId')!;
        // const ref: string = camelize(sid.split('.')[0] + 'Id', false);
        const soqlStatement = soql().select('Id').from('EmailTemplate').where('DeveloperName = \'...\'').exposeField('Id').build();
        this.body = `// TODO: Provide DeveloperName of the email template configured on ${uniqueName}
Id templateId = ${soqlStatement};
// TODO: Create list of recipients as configured on ${uniqueName}
String[] toAddresses = new String[] {''}; 

Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
mail.setTargetObjectId(UserInfo.getUserId());
mail.setTreatTargetObjectAsRecipient(false);
mail.setTemplateId(templateId);
mail.setToAddresses(toAddresses);
// TODO: Configure subject and body of email configured on ${uniqueName}
mail.setSubject('');
mail.setPlainTextBody('');
Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });`;
    }

    getBody(): string {
        return this.body;
    }

    getParameterTypes(): Map<string, string> {
        return this.parameterTypes;
    }
}