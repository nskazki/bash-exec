'use strict'

import bashExec from '../src'
import { homedir } from 'os'

let cmd = ` \
  set -o pipefail \
  && cd "${homedir()}/Pictures" \
  && find . -name "*.png" \
     | (wc -l || echo 0)`
bashExec(cmd).then(console.info, console.error)
