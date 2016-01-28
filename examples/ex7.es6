'use strict'

import bashExec from '../src'
import { resolve } from 'path'

let tmpDir1 = resolve(__dirname, 'tmp-ex7-1-local')
let tmpDir2 = resolve(__dirname, 'tmp-ex7-2-local')

bashExec(`

  (set -o pipefail

  rm -rf "${tmpDir1}"
  mkdir -p "${tmpDir1}"

  while :; do
    touch "${tmpDir1}/$(date +%s)"
    sleep 1
  done) &

  (set -o pipefail

  rm -rf "${tmpDir2}"
  mkdir -p "${tmpDir2}"

  while :; do
    touch "${tmpDir2}/$(date +%s)"
    sleep 1
  done) &

`).then(console.info, console.error)

let signals = [ 'SIGINT', 'SIGBREAK', 'SIGTERM', 'SIGHUP' ]
signals.forEach(s => process.once(s, () => {
  console.info(`${s}!`)
  bashExec.killChilds(s)
}))
