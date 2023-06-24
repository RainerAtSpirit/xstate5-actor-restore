import { PersistedMachineState, interpret } from 'xstate'
import { promises as fs } from 'fs'
import { UpDownMaschine } from './machines'
import { createActors, delay } from './actors'

const FILENAME = './historyStates.json'
const PROVISION_TIMEOUT = 30000

// Clean out whatever we had between runs
await fs.writeFile(FILENAME, JSON.stringify([]))

let historyStates: PersistedMachineState<any>[] = []
async function updateHistory(state: any) {
  try {
    historyStates = JSON.parse(await fs.readFile(FILENAME, 'utf8'))
  } catch (e) {
    console.log('No history states found.')
    historyStates = []
  }
  historyStates = [state, ...historyStates]
  await fs.writeFile(FILENAME, JSON.stringify(historyStates))
}

async function provisionFactory(actors: any, retry = false) {
  let restoredState

  if (retry) {
    try {
      const history: any[] = JSON.parse(await fs.readFile(FILENAME, 'utf8'))

      // In case of retry get the restored state from history
      restoredState = history[1]
      await fs.writeFile('./restoredState.json', JSON.stringify(restoredState))
    } catch (e) {
      restoredState = undefined
      console.log('No restoredState found')
    }
    // console.log('---restoredState', restoredState)
  }

  const upDown = interpret(UpDownMaschine.provide({ actors }), {
    state: restoredState,
  })

  upDown.subscribe({
    next(state) {
      console.log('---next', state.value)
      const persistedState = upDown.getPersistedState()

      updateHistory(persistedState)
      if (state.matches({ Up: 'Done' })) {
        console.log('        Step 2: Tearing it down after 30sec')
      }
    },
    complete() {
      console.log('---complete')
    },
    error(state) {
      console.log('---error', state)
    },
  })
  return upDown
}

console.log('this will fail, at least one serice down')
let provisionMaschine = await provisionFactory(createActors(1))
// Provide some time to hook up the debugger
// await delay(10000);

async function builtIt() {
  console.log('        Step 1: Building it up')
  provisionMaschine.start()

  provisionMaschine.send({ type: 'UP' })

  await delay(PROVISION_TIMEOUT)

  provisionMaschine.stop()
}

await builtIt()

// Back to normal
console.log("a little later, back to normal let's pick up where we left")

provisionMaschine = await provisionFactory(createActors(0), true)

console.log('The system will throw: ')

try {
  await builtIt()
} catch (error) {
  console.log('error')
}
