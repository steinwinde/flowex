# summary

Plugin to convert a Flow to Apex.

# description

More information about a command. Don't repeat the summary.

# examples

- <%= config.bin %> <%= command.id %>

# flags.input-file.summary

Path to \*.flow-meta.xml, the relevant Flow file.

# flags.input-file.description

E.g. .\data\Process-Orders.flow-meta.xml

# flags.output-directory.summary

Directory to write the result to.

# flags.output-directory.description

The result of the process is written to files in the given directory. At least one Apex class is written.

# flags.local-variables.summary

Aim at making variables method local, i.e. not like in Flow execution.

# flags.local-variables.description

Variables that are configured in the Flow Builder are valid everywhere in the Flow. In Apex this is bad practice. Flowex can be asked to try to make variables local.

# flags.no-version.summary

Do not include version information in output.

# flags.no-version.description

Normally Flowex writes its version into generated Apex. This can be supressed.

# flags.silent.summary

Be silent. Do not write to standard output.

# flags.silent.description

Do not output Apex to standard output.

# flags.verbose.summary

Verbose debug output.

# flags.verbose.description

Write more log output than usual.
