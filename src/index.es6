'use strict'

import { trim, forEach, assign,
  isNull, isObject, isString } from 'lodash'
import { debugEvents } from 'simple-debugger'
import { spawn } from 'child_process'
import { inspect } from 'util'
import Debug from 'debug'
import P from 'bluebird'

let beDebug = new Debug('libs-bash-exec')
let counter = 0
let tab = v => v.split('\n').join('\n\t\t ')

let childProcesses = {}

bashExec.killChilds = killChilds
export default bashExec

function killChilds(signal = 'SIGINT') {
  forEach(childProcesses, child => {
    delete childProcesses[child.pid]

    if (child.__killedByBashExec__) return
    child.__killedByBashExec__ = true
    process.kill(-child.pid, signal)
  })
}

function bashExec(cmd) {
  let cmdId = ++counter
  beDebug(cmdId, 'init', cmd)

  let stdout = ''
  let stderr = ''

  let err = null
  let code = null
  let signal = null

  let isStdoutEnd = false
  let isStderrEnd = false
  let isError = false
  let isExit = false
  let isSignal = false

  return new P((resolve, reject) => {
    let onEnd = () => {
      let skipNormal = !(true
        && isStderrEnd
        && isStdoutEnd
        && (isError || isExit))
      let skipSignal = !(isExit && isSignal)

      if (skipNormal && skipSignal) {
        beDebug(cmdId, 'onEnd-skip',
          { isStdoutEnd, isStderrEnd, isExit, isError })
        return
      }

      delete childProcesses[child.pid]

      beDebug(cmdId, 'onEnd-process',
        { isStdoutEnd, isStderrEnd, isError, isExit })
      beDebug(cmdId, { stdout, stderr, signal, code })

      stdout = trim(stdout.toString())
      stderr = trim(stderr.toString())

      if (isError) {
        let message = `bashExec problem - onError!\
          \n\t cmd:    ${tab(cmd)}\
          \n\t err:    ${isObject(err) && isString(err.message)
            ? err.message
            : tab(inspect(err, { depth: null }))}\
          \n\t stdout: ${tab(stdout)}\
          \n\t stderr: ${tab(stderr)}\
          \n\t cmdId:  ${cmdId}`
        let error = isObject(err) && isString(err.stack)
          ? assign(err, { message })
          : new Error(message)
        assign(error, { cmd, stdout, stderr, cmdId })
        return reject(error)
      } else if (isExit && code === 0) {
        return resolve({ cmd, code, signal, stdout, stderr, cmdId })
      } else if (isExit && code !== 0) {
        let error = new Error(`bashExec problem - onExit!\
              \n\t cmd:    ${tab(cmd)}\
              \n\t code:   ${code}\
              \n\t signal: ${signal}\
              \n\t stdout: ${tab(stdout)}\
              \n\t stderr: ${tab(stderr)}\
              \n\t cmdId:  ${cmdId}`)
        assign(error, { cmd, code, signal, stdout, stderr, cmdId })
        return reject(error)
      } else {
        let error = new Error(`bashExec internal problem!\
          \n\t err: the script is not completed, but the handler did not think so\
          \n\t ext: ${tab(inspect({ cmd, err, code, signal, stdout, stderr }))}\
          \n\t our: ${tab(inspect({ cmdId, isError, isExit, isStdoutEnd, isStderrEnd }))}`)
        assign(error, { cmd, err, code, signal, stdout, stderr, cmdId,
          isError, isExit, isStdoutEnd, isStderrEnd })
        return reject(error)
      }
    }

    let onError = _err => {
      err = _err
      beDebug(cmdId, 'onError', { err })
      isError = true
      onEnd()
    }

    let onExit = (_code, _signal) => {
      code = _code
      signal = _signal
      beDebug(cmdId, 'onExit', { code, signal })

      isExit = true
      isSignal = !isNull(signal)
      if (isSignal && !child.__killedByBashExec__) {
        child.__killedByBashExec__ = true
        process.kill(-child.pid, signal)
      }

      onEnd()
    }

    let onStdout = () => {
      beDebug(cmdId, { stdout })
      isStdoutEnd = true
      onEnd()
    }

    let onStderr = () => {
      beDebug(cmdId, { stderr })
      isStderrEnd = true
      onEnd()
    }

    let child = spawn('bash', [ '-c', cmd ], { detached: true })
    childProcesses[child.pid] = child
    debugEvents(child, [], `bash-exec-child-${cmdId}`)

    child
      .on('error', onError)
      .on('exit', onExit)
    child.stdout
      .on('data', chank => stdout += chank)
      .on('end', onStdout)
    child.stderr
      .on('data', chank => stderr += chank)
      .on('end', onStderr)
  })
}
