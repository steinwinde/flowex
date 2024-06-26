import { ApexComment } from '../../result-builder/section/apex-comment.js';
import {FlowWait} from '../../types/metadata.js';

export function getWaits(flowElem: FlowWait) : ApexComment {
    return new ApexComment('Pause elements resp. waits not yet supported');
}
