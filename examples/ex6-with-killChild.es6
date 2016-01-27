'use strict'

import bashExec from '../src'
import { resolve } from 'path'

let tmpDir = resolve(__dirname, 'tmp-ex6-with-killChild-local')

bashExec(`
  set -o pipefail

  rm -rf "${tmpDir}"
  mkdir -p "${tmpDir}"

  while :; do
    touch "${tmpDir}/$(date +%s)"
    sleep 1
  done`).then(console.info, console.error)

let signals = [ 'SIGINT', 'SIGBREAK', 'SIGTERM', 'SIGHUP' ]
signals.forEach(s => process.once(s, () => {
  console.info(`${s}!`)
  bashExec.killChilds(s)
}))
