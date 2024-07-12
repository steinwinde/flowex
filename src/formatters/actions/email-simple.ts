import { BasicAction } from "./basic-action.js";

// Flow Core Action: Send Email
// https://help.salesforce.com/s/articleView?id=sf.flow_ref_elements_actions_sendemail.htm&type=5
export default class EmailSimple implements BasicAction {

    private body: string;
    private parameterTypes = new Map<string, string>([
        ['addThreadingTokenToBody', 'Boolean'], // TODO
        ['addThreadingTokenToSubject', 'Boolean'], // TODO
        ['emailAddresses', 'String'],
        ['emailAddressesArray', 'List<String>'],
        ['emailBody', 'String'],
        ['emailSubject', 'String'],
        ['emailTemplateId', 'Id'],
        ['logEmailOnSend', 'Boolean'],
        ['recipientId', 'Id'],
        ['relatedRecordId', 'Id'], // TODO
        ['senderAddress', 'String'],
        ['senderType', 'String'], // TODO
        ['sendRichBody', 'Boolean'],
        ['useLineBreaks', 'Boolean'] // TODO
    ]);

    // TODO: Inconsistencies in the configured parameters are kept here; this could be made dependent on a CLI flag
    constructor(actionName: string, inputParams: Map<string, string>) {

        this.body = `Messaging.reserveSingleEmailCapacity(1);${NL}`
        + `Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();${NL}`;
        
        if(inputParams.get('logEmailOnSend') === 'true') {
            this.body += `mail.setSaveAsActivity(true);${NL}`;
        }

        switch(inputParams.get('senderType')) {
            case 'CurrentUser': {
                // TODO
                break;
            }

            case 'DefaultWorkflowUser' : {
                // TODO
                break;
            }

            case 'OrgWideEmailAddress' : {
                // TODO
                break;
            }
        }

        if(inputParams.get('senderAddress')) {
            this.body += `OrgWideEmailAddress[] owea = [SELECT Id FROM OrgWideEmailAddress WHERE Address =: senderAddress];${NL}`
                + `if(owea.size() > 0) {${NL}`
                + `    mail.setOrgWideEmailAddressId(owea.get(0).Id);${NL}`
                + `}${NL}`;
        }
        
        if(inputParams.get('recipientId') || inputParams.get('emailAddresses') || inputParams.get('emailAddressesArray')) {
            this.body += `List<String> toAddresses = new List<String>();${NL}`
            if(inputParams.get('recipientId')) {
                this.body += `mail.setTargetObjectId(recipientId);${NL}`;
                this.body += `toAddresses.add(recipientId);${NL}`;
            }

            if(inputParams.get('emailAddresses')) {
                // "comma-delimited list of the recipients' email addresses"
                this.body += `toAddresses.addAll(emailAddresses.split(','));${NL}`;
            }

            if(inputParams.get('emailAddressesArray')) {
                this.body += `toAddresses.addAll(emailAddressesArray);${NL}`;
            }

            this.body += `mail.setToAddresses(toAddresses);${NL}`
        }

        if(inputParams.get('emailSubject')) {
            this.body += `mail.setSubject(emailSubject);${NL}`;
        }

        if(inputParams.get('emailBody')) {
            this.body += inputParams.get('sendRichBody') === 'true' ? `mail.setHtmlBody(emailBody);${NL}` : `mail.setPlainTextBody(emailBody);${NL}`;
        }

        if(inputParams.get('emailTemplateId')) {
            this.body += `mail.setTemplateId(emailTemplateId);${NL}`;
        }

        this.body += `Messaging.sendEmail(new Messaging.SingleEmailMessage[] { mail });`;
    }

    getBody(): string {
        return this.body;
    }

    getParameterTypes(): Map<string, string> {
        return this.parameterTypes;
    }
}