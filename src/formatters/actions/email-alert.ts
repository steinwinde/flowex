import {Parameter} from '../../types/parameter.js';
import {camelize} from '../../utils.js';
import {Action} from './action-builder.js';
import { soql } from '../../result-builder/soql/soql-query.js';

export default class EmailAlert implements Action {
    methodParameters: Parameter[] = [];
    body: string;

    // In an email alert, the "actionName" holds both the name of the object and the "Unique Name" of the alert, e.g.
    // "Contact.Send_me_home".
    // Email Alerts are not available in Apex (if one does not want to resort to REST calls). What one would
    // want to do is: Implement the sending of emails with the parameters configured on the alert:
    // recipient(s), email template
    constructor(name: string, actionName: string, inputParams: Map<string, string>) {
        const ar: string[] = actionName.split('.');
        // const obj: string = ar[0];
        const uniqueName: string = ar[1];
        const sid: string = inputParams.get('SObjectRowId')!;
        const ref: string = camelize(sid.split('.')[0] + 'Id', false);
        this.methodParameters.push(new Parameter(ref, sid, 'Id'));
        const soqlStatement = soql().select('Id').from('EmailTemplate').where('DeveloperName = \'...\'').exposeField('Id').build();
        const s = `// TODO: Provide DeveloperName of the email template configured on ${uniqueName}
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
        this.body = s;
    }
}
