'use strict'

import bashExec from '../src'
bashExec(`exit 1`).catch(console.error)
