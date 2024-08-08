# FlowEx

A plugin for sf to convert Salesforce Flows into Apex code

## Install and Run FlowEx for end users

Here's the short way to make use of FlowEx to translate ServicesFlow to Apex:

```
sf plugins install flowex
sf flowex --input-file .\data\ServicesFlow.flow-meta.xml
```

## Install and Run FlowEx for developers

Alternatively, if you have [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) and want to play with the source, clone the repository:

```
git clone https://github.com/steinwinde/flowex.git
cd .\flowex\
npm install
```

Ignore the warnings. At this point a Flow definition file (\*.flow-meta.xml) can be parsed and the resulting Apex sent to standard output. The following uses a Flow definition, which is part of the repository for testing purposes:

```
.\bin\dev.cmd flowex --input-file .\data\All-GetRecords-Element.flow-meta.xml
```

Now get the local code working as a plugin of sf:

```
npm run build
sf plugins link .
```

FlowEx is a sf plugin now:

```
sf flowex --input-file .\data\All-GetRecords-Element.flow-meta.xml
```

## FlowEx development

Any relevant code change should come with TypeScript test modules. The project utilizes [mocha](https://mochajs.org/). Much of the logic is not based on [explicit Salesforce documentation](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_visual_workflow.htm), but on knowledge gained by inspecting Flow definitions downloaded from orgs.

## What happens during execution

FlowEx is based on [oclif](https://oclif.io/). The entry point can be found [here](src/commands/apex/index.ts).

From there, the tool proceeds roughly according to the following steps:

- It parses the Flow definition. This is somewhat based on a recent version of [Salesforce's Metadata WSDL](src/types/metadata.xml) (download from your Salesforce org via Setup - Integrations - API). It utilizes [xml2js](https://www.npmjs.com/package/xml2js) to generate a memory representation of the Flow.

- It then extracts relevant information by looking at Flow elements one-by-one, in several cycles. As everything else in this project, the design here doesn't aim at efficiency and briefness, but at testability and readability.

- A first internal representation of the Apex is generated.

- If variables are not all global (like in a Flow execution context in Salesforce, see "globalVariables"), the future place of variables, parameters and return values is calculated.

- The literal Apex strings are compiled and send to the output.

## Limitations

The current version of the code is mostly based on work from summer 2022 and the then metadata format and Flow capabilities. The code has never attempted to cover formulas. It has never covered all available Flow elements and options. The produced Apex has significant design deficiencies, e.g. it is not bulkified.

The produced Apex should never be used as such.

## Why convert a Flow to Apex?

When Apex and Flow look like possible options to implement a requirement, Salesforce recommends Flows. Companies agree: The number of those who feel (and in many cases are) capable of developing and maintaining Flows is much larger than those that can write Apex, and they tend to be less expensive.

One consequence of the partiality of the main actors is the presence of logic implemented in Flows that better was implemented in Apex - not necessarily when it was set up initially, but definitely in its evolved shape, when we come across it.

This tool doesn't take a position in the battle of Flows and Apex. There are excellent articles discussing the subject (see [here](https://architect.salesforce.com/decision-guides/trigger-automation) and [here](https://architect.salesforce.com/decision-guides/build-forms)). Data volume, speed, complex logic and queries are commonly named as drivers to choose Apex. At some point, extending an existing Flow becomes untenable. At this point an automatic conversion comes in handy.

And there are much less considered reasons to convert a Flow to Apex: not in order to execute Apex, but for inspection. Think of

- how you track changes between Flow versions in source control;

- the amount of required screenshots necessary to state a question regarding Flows on StackExchange or Trailblazer Community groups;

- what it takes to understand changes between an active and a more recent version of a Flow, when work stalled a while ago and you completely forgot its history;

- or what it takes to understand similiarities of two Flows developed in different contexts.

In all these situations comparing Apex is much better suited than comparing Flows in Flow builder or comparing the XML of Flow definitions.
