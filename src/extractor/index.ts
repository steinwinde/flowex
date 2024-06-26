import { Builder } from '../result-builder/builder.js';
import {
    Flow,
    FlowChoice
} from '../types/metadata.js';
import {soql} from '../result-builder/soql/soql-query.js';
import {CollectionProcessorVarProcessor} from './traversals/collection-processor.js';
import {DependentElementProcessor} from './traversals/dependent-elements.js';
import {IndependentElementProcessor} from './traversals/independent-elements.js';
import {LoopBelongingsProcessor} from './traversals/loop-belonging.js';
import { Variable } from '../types/variable.js';
import { Node } from '../types/node.js';
import { MethodScout } from './traversals/method-scout.js';
import { Method } from '../types/method.js';

// As we walk through the whole shebang, all elements are processed and independent elements (like variables) are extracted.
// The later walk by pathfinder will have a tree/network route.
export class Knowledge {

    /** general purpose results from XML analysis */
    public triggerType: string | undefined = undefined;
    /** convenience variable (triggerType has this information too) */
    public recordBeforeSave = false;

    /** all nodes, including the start node, key is the name of the FlowElement */
    public name2node = new Map<string, Node>();

    /** all methods */
    // public methods = new Map<string, Method>();
    /** methods required to generate either due to double reference to a node or due to action */
    public requiredMethods = new Set<string>();

    // /** either 1 or 2, 2 stating "must be rendered as method, because targeted by more than one node" */
    // public target2makeMethod= new Map<string, boolean>();

    /** fields of objects that are needed by elements; note that this is suboptimal, because
      * GetRecords e.g. querying Contacts might exist several times with different requirements
      * regarding fields; but the current solution will never require too few fields
      * */
    public objects2Fields: Map<string, string[]> = new Map<string, string[]>();
    /** types of GetRecords (and other?) variables */
    public var2type = new Map<string, Variable>();
    /** "special queries" like User (current user), Organization (actual org), collecting fields for each */
    public queryObject2fields = new Map<string, string[]>();
    /** Choices available for screen UI stubs */
    public choices : Map<string, FlowChoice> = new Map<string, FlowChoice>();

    /** Apex class builder */
    public builder: Builder;

    constructor(flow: Flow, version: null | string, globalVariables: boolean) {

        // e.g. see test\formatters\elements\record-lookup.test.ts
        if (flow.label.length === 0 || flow.label[0] === 'Test') {
            // test run
            this.builder = Builder.getInstance('Test', version, globalVariables);
            return;
        }

        const runInMode = flow.runInMode ? flow.runInMode[0] : 'SystemModeWithSharing';
        this.builder = Builder.getInstance(flow.label[0], version, globalVariables, runInMode);

        new IndependentElementProcessor(flow, this, this.queryObject2fields).run();
        new DependentElementProcessor(flow, this, this.queryObject2fields).run();
        new CollectionProcessorVarProcessor(this).run();
        new LoopBelongingsProcessor(this).run();
        this.populateRequiredMethods();

        if (this.queryObject2fields.size > 0) {
            this.addQueriesToClass();
        }
    }

    private populateRequiredMethods(): void {
        const connectorNodes = new Set<string>();
        for(const node of this.name2node.values()) {
            const targets = node.targets?.getAll();
            if(!targets) continue;
            for(const target of targets) {
                if(connectorNodes.has(target)) {
                    this.requiredMethods.add(target);
                } else {
                    connectorNodes.add(target);
                }
            }
        }
    }

    // TODO: does this work? (afore question is from the original code before 2024)
    // TODO: Is it possible the query returns more than one record, i.e. does not use a WHERE with an Id?
    private addQueriesToClass(): void {
        for (const [k, v] of this.queryObject2fields) {

            // In 2024 we continue to use the type as the planned name of the variable
            const apexVariable = this.builder.getMainClass().registerVariable(k).registerType(k);

            const soqlQuery = soql().select(v).from(k);
            if(k === 'User') {
                soqlQuery.where('Id =: UserInfo.getUserId()');
            }

            apexVariable.registerRightHand(soqlQuery);
        }
    }
}
