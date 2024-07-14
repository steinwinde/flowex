/* eslint-disable complexity */
import { BasicAction } from "./basic-action.js";
import { Command } from '@oclif/core'

// TODO: Much of this is tentative, only a start and needs testing
// Flow Core Action: Send Email
// https://help.salesforce.com/s/articleView?id=sf.flow_ref_elements_actions_sendemail.htm&type=5
export default class EmailSimple implements BasicAction {

    private body: string;
    private parameterTypes = new Map<string, string>([
        ['addThreadingTokenToBody', 'Boolean'],
        ['addThreadingTokenToSubject', 'Boolean'],
        ['emailAddresses', 'String'],
        ['emailAddressesArray', 'List<String>'],
        ['emailBody', 'String'],
        ['emailSubject', 'String'],
        ['emailTemplateId', 'Id'],
        ['logEmailOnSend', 'Boolean'],
        ['recipientId', 'Id'],
        ['relatedRecordId', 'Id'],
        ['senderAddress', 'String'],
        ['senderType', 'String'],
        ['sendRichBody', 'Boolean'],
        // TODO: I don't see how this can be represented in Apex
        ['useLineBreaks', 'Boolean']
    ]);

    // TODO: Inconsistencies in the configured parameters are kept here; this could be made dependent on a CLI flag
    constructor(actionName: string, inputParams: Map<string, string>) {

        this.body = `Messaging.reserveSingleEmailCapacity(1);${NL}`
        + `Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();${NL}`;
        
        if(inputParams.get('addThreadingTokenToBody') === 'true' || inputParams.get('addThreadingTokenToSubject') === 'true') {
            this.body += `Id relatedId = Id.valueOf(relatedRecordId);${NL}`
                + `String formattedToken = EmailMessages.getFormattedThreadingToken(relatedId);${NL}`;
        }

        // https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_classes_email_outbound_base.htm
        // TODO: This seems the default in Apex, but apparently not in Flow
        this.body += inputParams.get('logEmailOnSend') === 'true'
            ? `mail.setSaveAsActivity(true);${NL}` 
            : `mail.setSaveAsActivity(false);${NL}`;

        switch(inputParams.get('senderType')) {
            case 'DefaultWorkflowUser' : {
                // TODO: Of diminishing importance, but to my knowledge it's impossible to retrieve the user in Apex
                // - and could we even make use of it?!
                break;
            }

            case 'OrgWideEmailAddress' : {
                // TODO: I suppose this is dealt with by the 'senderAddress' parameter handling?!
                break;
            }

            // 'CurrentUser' is the default
            default: {
                // TODO: Not sure what to do here
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

        if(inputParams.get('relatedRecordId')) {
            // TODO: not sure this is correct: "If you specify a contact for the targetObjectId field, you can specify an optional whatId as well."
            // There is more documentation...
            // https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_classes_email_outbound_single.htm#apex_Messaging_SingleEmailMessage_setWhatId
            this.body += `mail.setWhatId(relatedRecordId);${NL}`;
        }

        if(inputParams.get('emailSubject')) {
            this.body += inputParams.get('addThreadingTokenToSubject') === 'true' 
                ? `mail.setSubject(emailSubject + '[ ' + formattedToken + ' ]');${NL}` 
                : `mail.setSubject(emailSubject);${NL}`;
        }

        if(inputParams.get('emailBody')) {
            if(inputParams.get('addThreadingTokenToBody') === 'true') {
                this.body += inputParams.get('sendRichBody') === 'true' 
                    ? `mail.setHtmlBody(emailBody + '<br><br>' + formattedToken);${NL}` 
                    : `mail.setPlainTextBody(emailBody + '\n\n' + formattedToken);${NL}`;
            } else {
                this.body += inputParams.get('sendRichBody') === 'true' 
                ? `mail.setHtmlBody(emailBody);${NL}` 
                : `mail.setPlainTextBody(emailBody);${NL}`;
            }
        }

        if(inputParams.get('emailTemplateId')) {
            this.body += `mail.setTemplateId(emailTemplateId);${NL}`;

            if(inputParams.get('useLineBreaks') === 'true') {
                console.warn('EmailSimple: useLineBreaks is not supported in Apex');
            }
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