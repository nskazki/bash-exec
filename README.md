# bash-exec

Like `spawn('bash', [ '-c', cmd ])`, but with better error handling.

```
npm i -S bash-exec
```

### Warning

##### EN

Why you possibly don't want to use this library!

Every bash command is being ran in separate process, which continues to work even when your app finished. For example, if you ran `bashExec('cat /dev/urandom > /tmp/urandom-mirror')` in your app and kill it (the app), you will see soon that your disk space ran out.

To kill all the generated bash processes before exit use command `bashExec.killChilds([ SIGNAL = 'SIGINT' ])`. It would be nice to define a listener of system signals that would call the function before the app finishing.
Btw, you can call the function more that once but if you do this you probably doing something wrong.

You can find example of forgotten backgroung process in the file `ex5-without-killChild.es6`, and example of correct finishing background processes before exit in  `examples/ex6-with-killChild`.

##### RU

Возможно вам не стоит пользоваться этой библиотекой!

Каждая запущенная вами bash команда запускается в отдельном процессе, который продолжить работать после завершения работы вашего приложения. Напремер: если вы запустите в своем приложении `bashExec('cat /dev/urandom > /tmp/urandom-mirror')` и остановите свой приложении, то очень скоро у вас закончится место на диске.

Для того чтобы, перед выходом из приложения, завершить все запущенные bash команды воспользуйтесь функцией `bashExec.killChilds([ SIGNAL = 'SIGINT' ])`. Хорошей мыслью будет: определить слушателя системных сигналов, который вызовет функцию `bashExec.killChilds` перед завершением приложения. Заметка, эту функцию можно вызвать более одного раза, но мне кажется, что если вам захочется это сделать, то вы пользуетесь библиотекой неправильно.

Пример образования "забытого" в фоне процесса вы можете найти в файле `ex5-without-killChild.es6`. А пример корректного завершения фоновых процессов перед выходом в файле `examples/ex6-with-killChild`.

### API

* `bashExec(cmd[, options ]) -> Promise`: 
  * `cmd` - a string containing the command(s)
  * `options` - [spawn options](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options), `detached` option will be ignored. Default: `{ detached: true }`.
* `bashExec.killChilds([ signal ]) -> undefined`:
  * `signal` - a string containing the [signal name](https://nodejs.org/api/process.html#process_signal_events). Default: `SIGINT`   

### Examples

```js
import bashExec from 'bash-exec'
import { homedir } from 'os'

let cmd = ` \
    set -o pipefail \
    && cd "${homedir()}/Pictures" \
    && find . -name "*.png" \
       | (wc -l || echo 0)`
bashExec(cmd).then(console.info)

/*
{ cmd: 'set -o pipefail && cd "/home/nskazki/Pictures" && find . -name "*.png" | (wc -l || echo 0)',
  code: 0,
  signal: null,
  stdout: '109',
  stderr: '',
  cmdId: 1 }
*/
```

```js
import bashExec from 'bash-exec'
bashExec(`exit 1`).catch(console.error)

/*
{ [Error: bashExec problem - onExit!              
     cmd:    exit 1              
     code:   1              
     signal: null              
     stdout:               
     stderr:               
     cmdId:  1]
  cmd: 'exit 1',
  code: 1,
  signal: null,
  stdout: '',
  stderr: '',
  cmdId: 1 }
*/
```


```js
import { delay } from 'bluebird'
import uuid from 'node-uuid'
import bashExec from 'bash-exec'

let marker = `im-just-marker-${uuid.v4()}`
let runCmd = bashExec(`sleep 300 && echo "${marker}"`)
let getPid = delay(1e3).then(() => bashExec(`ps aux | grep -v grep | grep '${marker}' | awk '{print $2}'`))

getPid.then(({ stdout: pid }) => bashExec(`kill ${pid}`)),
runCmd.catch(console.error)

/*
{ [Error: bashExec problem - onExit!              
     cmd:    sleep 300 && echo "im-just-marker-301849df-ab38-4917-882b-00319d55ceb2"              
     code:   null              
     signal: SIGTERM              
     stdout:               
     stderr:               
     cmdId:  1]
  cmd: 'sleep 300 && echo "im-just-marker-301849df-ab38-4917-882b-00319d55ceb2"',
  code: null,
  signal: 'SIGTERM',
  stdout: '',
  stderr: '',
  cmdId: 1 }
*/
```

### Debug and other

If you want to perform some example:
```
$(npm bin)/babel-node examples/ex0.es6
```

If you want to perform auto test:
```
npm test
```

If you want to debug the process:
```
DEBUG=libs-bash-exec*,debugEvents* node you-app.js
``` 
