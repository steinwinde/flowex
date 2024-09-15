#!/usr/bin/env -S node --loader ts-node/esm --no-warnings=ExperimentalWarning
// import {execute} from '@oclif/core'

//await execute({development: true, dir: import.meta.url})

async function main() {
  const { execute } = await import('@oclif/core');
  await execute({ development: true, dir: import.meta.url });
}

// instead of entering on the command line something like $env:DEBUG="*"
// '*' enables more general debug output
//   process.env.DEBUG = 'oclif:error';
process.env.DEBUG = '*';
await main();
