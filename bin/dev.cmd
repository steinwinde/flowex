@echo off

node --enable-source-maps --loader ts-node/esm --no-warnings=ExperimentalWarning "%~dp0\dev" %*
