'use strict'

import { hostname, homedir } from 'os'
import { inspect } from 'util'
import P from 'bluebird'
import assert from 'power-assert'
import uuid from 'node-uuid'
import bashExec from '../src'

describe('bash-exec', () => {
  it('hostname', () => {
    return bashExec(`hostname`).then(res => {
      assert.ok(res.stdout === hostname())
    })
  })

  it('homedir', () => {
    return bashExec(`readlink -f ~`).then(res => {
      assert.ok(res.stdout === homedir())
    })
  })

  it('stdout', () => {
    return bashExec(`echo 123`).then(res => {
      assert.ok(res.stdout === `123`)
      assert.ok(res.stderr === ``)
    })
  })

  it('stderr', () => {
    return bashExec(`echo 123 >&2`).then(res => {
      assert.ok(res.stdout === ``)
      assert.ok(res.stderr === `123`)
    })
  })

  it('exit with code == 0 (resolved)', () => {
    return bashExec(`exit 0`).then(res => {
      assert.ok(res.code === 0)
    })
  })

  it('exit with code != 0 (rejected)', () => {
    return bashExec(`exit 1`).then(
      res => P.reject(new Error(`process resolved, but must be rejected: ${inspect(res)}`)),
      err => assert.ok(err.code === 1))
  })

  it('exit with signal == SIGTERM', () => {
    let marker = `im-just-marker-${uuid.v4()}`
    let runCmd = bashExec(`sleep 300 && echo '${marker}'`)
    let getPid = P.delay(1e3).then(() => bashExec(`ps aux | grep -v grep | grep '${marker}' | awk '{print $2}'`))

    return P.join(
      getPid.then(({ stdout: pid }) => bashExec(`kill ${pid}`)),
      runCmd.then(
        res => P.reject(new Error(`process resolved, but must be rejected: ${inspect(res)}`)),
        err => assert.ok(err.signal === 'SIGTERM')))
  })

  it('run cmd with additional options', () => {
    let env = { HELLO: 'WORLD!' }

    return bashExec(`echo $HELLO`, { env }).then(res => {
      assert.ok(res.stdout === 'WORLD!')
    })
  })
})
