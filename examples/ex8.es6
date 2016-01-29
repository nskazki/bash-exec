'use strict'

import bashExec from '../src'
import { resolve } from 'path'

let tmpDir = resolve(__dirname, 'tmp-ex8-local')
let tmpLog = resolve(__dirname, 'tmp-ex8.local.log')

bashExec(`
  (
    sleep 1
    rm -rf "${tmpDir}"
    mkdir -p "${tmpDir}"
    echo "$(date): mkdir" >> "${tmpLog}"
  ) &

  (
    sleep 5
    touch "${tmpDir}/first"
    echo "$(date): first" >> "${tmpLog}"
  ) &

  (
    sleep 10
    touch "${tmpDir}/second"
    echo "$(date): second" >> "${tmpLog}"
  ) &

  (
    sleep 12
    cowsay "ta-da :)"
  ) &

`).then(res => console.log(res.stdout), console.error)
