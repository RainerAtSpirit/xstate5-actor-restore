import { createMachine } from 'xstate';

export const UpDownMaschine = createMachine({
  id: 'UpDownMaschine',
  initial: 'Init',
  on: {
    NOT_DONE: {
      target: '.NotDone'
    }
  },
  states: {
    NotDone: {
      type: 'final'
    },
    Init: {
      on: {
        UP: {
          target: 'Up'
        },
        DOWN: {
          target: 'Down'
        }
      }
    },
    Up: {
      initial: 'Clone collection',
      states: {
        'Clone collection': {
          invoke: {
            src: 'cloneCollection',
            id: 'cloneCollection',
            onDone: [
              {
                target: 'Recreate indexes'
              }
            ]
          }
        },
        'Recreate indexes': {
          invoke: {
            src: 'recreateIndexes',
            id: 'recreateIndexes',
            onDone: [
              {
                target: 'Create new List'
              }
            ]
          }
        },
        'Create new List': {
          invoke: {
            src: 'createNewList',
            id: 'createNewList',
            onDone: [
              {
                target: 'Update sample data'
              }
            ]
          }
        },
        'Update sample data': {
          invoke: {
            src: 'updateSampleDate',
            id: 'updateSampleDate',
            onDone: [
              {
                target: 'copy views'
              }
            ]
          }
        },
        'copy views': {
          invoke: {
            src: 'copyViews',
            id: 'copyViews',
            onDone: [
              {
                target: 'Done'
              }
            ]
          }
        },
        Done: {
          type: 'final'
        }
      }
    },
    Down: {
      initial: 'Delete collection',
      states: {
        'Delete collection': {
          invoke: {
            src: 'deleteCollection',
            id: 'deleteCollection',
            onDone: [
              {
                target: 'Delete List'
              }
            ]
          }
        },
        'Delete List': {
          invoke: {
            src: 'deleteList',
            id: 'deleteList',
            onDone: [
              {
                target: 'Delete Views'
              }
            ]
          }
        },
        'Delete Views': {
          invoke: {
            src: 'deleteViews',
            id: 'deleteViews',
            onDone: [
              {
                target: 'Done'
              }
            ]
          }
        },
        Done: {
          type: 'final'
        }
      }
    }
  }
});

