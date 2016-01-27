'use strict'

import { delay } from 'bluebird'
import uuid from 'node-uuid'
import bashExec from '../src'

let marker = `im-just-marker-${uuid.v4()}`
let runCmd = bashExec(`sleep 300 && echo '${marker}'`)
let getPid = delay(1e3).then(() => bashExec(`ps aux | grep -v grep | grep '${marker}' | awk '{print $2}'`))

getPid.then(({ stdout: pid }) => bashExec(`kill ${pid}`)),
runCmd.catch(console.error)
