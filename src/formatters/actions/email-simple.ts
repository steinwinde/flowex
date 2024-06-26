import {Parameter} from '../../types/parameter.js';
import {Action} from './action-builder.js';

export default class EmailSimple implements Action {
    methodParameters: Parameter[] = [];
    // eslint-disable-next-line perfectionist/sort-classes
    body: string;

    constructor(actionName: string, inputParams: Map<string, string>) {
        let toAddress = inputParams.get('emailAddressesArray');
        if (!toAddress) {
            toAddress = inputParams.get('emailAddresses');
        }

        const subject = inputParams.get('emailSubject');
        const emailBody = inputParams.get('emailBody');
        // copied from
        // https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_forcecom_email_outbound.htm
        // TODO: body contains line breaks
        this.body = `Messaging.reserveSingleEmailCapacity(1);
Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
String[] toAddresses = new String[] {${toAddress}}; 
mail.setToAddresses(toAddresses);
mail.setSubject(${subject});
mail.setPlainTextBody(${emailBody});
Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });`;
    }
}
