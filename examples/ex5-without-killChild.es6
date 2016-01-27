'use strict'

import bashExec from '../src'
import { resolve } from 'path'

let tmpDir = resolve(__dirname, 'tmp-ex5-delete-it-or-you-disk-overload-local')

bashExec(`
  set -o pipefail

  rm -rf "${tmpDir}"
  mkdir -p "${tmpDir}"

  while :; do
    touch "${tmpDir}/$(date +%s)"
    sleep 1
  done`).then(console.info, console.error)
