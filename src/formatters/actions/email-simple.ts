import { BasicAction } from "./basic-action.js";

export default class EmailSimple implements BasicAction {

    private body: string;
    private parameterTypes = new Map<string, string>([
        ['emailAddresses', 'String'], 
        ['emailAddressesArray', 'List<String>'],
        ['senderType', 'String'],
        ['senderAddress', 'String'],
        ['emailBody', 'String'],
        ['sendRichBody', 'Boolean'],
        ['useLineBreaks', 'Boolean'],
        ['relatedRecordId', 'Id'],
        ['recipientId', 'Id'],
        ['logEmailOnSend', 'Boolean'],
        ['emailTemplateId', 'Id'],
        ['addThreadingTokenToBody', 'Boolean'],
        ['addThreadingTokenToSubject', 'Boolean']
    ]);

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

    getBody(): string {
        return this.body;
    }

    getParameterTypes(): Map<string, string> {
        return this.parameterTypes;
    }
}