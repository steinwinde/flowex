@echo off

node --loader ts-node/esm --enable-source-maps "%~dp0\dev" %*
