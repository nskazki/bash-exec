'use strict'

import bashExec from '../src'
bashExec(`hostname -f`).then(console.info, console.error)
