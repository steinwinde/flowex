import { FlowRunInMode } from '../types/metadata.js';
import { camelize } from '../utils.js';
import { ApexClass } from './cls/apex-class.js';
import { ApexMainClass } from './cls/apex-class-main.js';
import { ApexSubflowClass } from './cls/apex-class-subflow.js';

export class Builder {
  private static instance: Builder;
  private static version: null | string;
  private mainClass: ApexMainClass;
  // other top level classes, e.g. for subflows (but not for inner classes e.g. for Comparable)
  private otherClasses = new Map<string, ApexClass>();

  private constructor(name: string, localVariables: boolean, flowRunInMode?: FlowRunInMode) {
    const className = Builder.getClassName(name);
    this.mainClass = new ApexMainClass(className, localVariables, flowRunInMode);
    if (Builder.version !== null) {
      this.mainClass.registerVersionComment(Builder.version);
    }
  }

  // replaces the constructor calls to new Programmer() in the Knowledge class
  public static getInstance(
    name: string,
    version: null | string,
    localVariables: boolean,
    flowRunInMode?: FlowRunInMode
  ): Builder {
    Builder.version = version;
    const isTestContext = typeof global.it === 'function';
    if (isTestContext || this.instance === undefined) {
      this.instance = new Builder(name, localVariables, flowRunInMode);
    }

    return this.instance;
  }

  private static getClassName(originalName: string): string {
    let name = camelize(originalName, true).replaceAll(/-|_/g, '');

    const CLASS_NAME_CHARACTER_LIMIT = 40;
    if (name.length > CLASS_NAME_CHARACTER_LIMIT) {
      name = name.slice(0, CLASS_NAME_CHARACTER_LIMIT);
    }

    return name;
  }
  public getMainClass(): ApexMainClass {
    return this.mainClass;
  }

  // the <subflows> element has both a <name> and a <flowName>
  public registerSubflow(flowName: string): ApexSubflowClass {
    // flowName is the name of the future outer class (and its constructor) - make sure it's upper case!
    // name is the instance variable used to instantiate and refer to the subflow (existing code (2024-05-02)
    // starts the name with upper case for some reason - we keep it for now)
    const className = Builder.getClassName(flowName);

    if (this.otherClasses.has(className)) {
      return this.otherClasses.get(className) as ApexSubflowClass;
    }

    const subflowClass = new ApexSubflowClass(className);
    this.otherClasses.set(className, subflowClass);
    return subflowClass;
  }

  public getSubflow(flowName: string): ApexSubflowClass {
    const className = Builder.getClassName(flowName);
    return this.otherClasses.get(className) as ApexSubflowClass;
  }

  // returns resulting code in a single string; for now this will be the code of an Apex class,
  // potentially with the addition of a stub for a class representing the subflow;
  public build(): Map<string, string> {
    let content = this.mainClass.build();
    let name = this.mainClass.getName();
    const result = new Map<string, string>();
    result.set(name, content);
    for (const otherClass of this.otherClasses.values()) {
      content = global.NL + global.NL + otherClass.build();
      name = otherClass.getName();
      result.set(name, content);
    }

    return result;
  }
}
