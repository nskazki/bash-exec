'use strict'

import { delay } from 'bluebird'
import uuid from 'node-uuid'
import bashExec from '../src'

let marker = `/tmp/${uuid.v4()}`
let runCmd = bashExec(`cat /dev/urandom > ${marker}`)
let getPid = delay(1e3).then(() => bashExec(`ps aux | grep -v grep | grep '${marker}' | awk '{print $2}'`))

getPid.then(({ stdout: pid }) => bashExec(`kill -9 ${pid}`)),
runCmd.catch(console.error)
