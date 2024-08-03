# FlowEx

A command line tool to convert Salesforce Flows into Apex code


## Development

FlowEx is designed to become a [sf](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_unified.htm) plug-in in the future, but is currently stand-alone. For options, see "Run FlowEx" below.

Here's a quick way to run and test source code modifications with a suitable Flow definition (example based on a Windows prompt):

```sh-session
[project directory].\bin\dev apex .\Order_Alignment.flow-meta.xml
```

This does not require to transpile explicitly.

An earlier version of the source code is [used in the context of a Node.js web server](https://www.steinwinde.com/flowex). The source has also been compiled with `oclif pack win`, but not tested as such.

Any relevant code change should come with TypeScript test modules. The project utilizes [mocha](https://mochajs.org/). Much of the logic is not based on [explicit Salesforce documentation](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_visual_workflow.htm), but on knowledge gained by inspecting Flow definitions downloaded from orgs.


## What happens during execution

FlowEx is based on [oclif](https://oclif.io/). The entry point can be found [here](src/commands/apex/index.ts).

From there, the tool proceeds roughly according to the following steps:

- It parses the Flow definition. This is somewhat based on a recent version of [Salesforce's Metadata WSDL](src/types/metadata.xml) (download from your Salesforce org via Setup - Integrations - API). It utilizes [xml2js](https://www.npmjs.com/package/xml2js) to generate a memory representation of the Flow.

- It then extracts relevant information by looking at Flow elements one-by-one, in several cycles. As everything else in this project, the design here doesn't aim at efficiency and briefness, but at testability and readability.

- A first internal representation of the Apex is generated.

- If variables are not all global (like in a Flow execution context in Salesforce, see "globalVariables"), the future place of variables, parameters and return values is calculated.

- The literal Apex strings are compiled and send to the output.


## Run FlowEx

Here's what a stand-alone use of FlowEx would look like.
```
USAGE
  $ flowex apex FLOW [--globalVariables] [--noversion] [--silent] [--verbose]

ARGUMENTS
  FLOW  The Flow definition file (a file with the format extension "flow-meta.xml")

FLAGS
  -g, --globalVariables  (optional) Make all variables class fields, i.e. keep them global like in the Flow
  -n, --noversion  (optional) Do not include version information in output
  -s, --silent  (optional) Be silent. Do not write to standard output
  -v, --verbose  (optional) Verbose debug output

DESCRIPTION
  A command line tool to convert Salesforce Flows into Apex code

EXAMPLES
  $ flowex apex Order_Alignment.flow-meta.xml
```

## Limitations

The current version of the code is mostly based on work from summer 2022 and the then metadata format and Flow capabilities. The code has never attempted to cover formulas. It has never covered all available Flow elements and options. The produced Apex has significant design deficiencies, e.g. it is not bulkified.

The produced Apex should never be used as such.

## A word on the case for converting a Flow to Apex

When Apex and Flow look like possible options to implement a requirement, Salesforce recommends Flows. Companies agree: The number of those who feel (and in many cases are) capable of developing and maintaining Flows is much larger than those that can write Apex, and they tend to be less expensive.

One consequence of the partiality of the main actors is the presence of logic implemented in Flows that better was implemented in Apex - not necessarily when it was set up initially, but definitely in its evolved shape, when we come across it.

This tool doesn't take a position in the battle of Flows and Apex. There are excellent articles discussing the subject (see [here](https://architect.salesforce.com/decision-guides/trigger-automation) and [here](https://architect.salesforce.com/decision-guides/build-forms)). Data volume, speed, complex logic and queries are commonly named as drivers to choose Apex. At some point, extending an existing Flow becomes untenable. At this point an automatic conversion comes in handy.

And there are much less considered reasons to convert a Flow to Apex: not in order to execute Apex, but for inspection. Think of 

- how you track changes between Flow versions in source control; 

- the amount of required screenshots necessary to state a question regarding Flows on StackExchange or Trailblazer Community groups; 

- what it takes to understand changes between an active and a more recent version of a Flow, when work stalled a while ago and you completely forgot its history; 

- or what it takes to understand similiarities of two Flows developed in different contexts. 

In all these situations comparing Apex is much better suited than comparing Flows in Flow builder or comparing the XML of Flow definitions.