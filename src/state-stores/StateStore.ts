import MigrationState from "../MigrationState"

export default abstract class StateStore {
  state: MigrationState

  abstract load(): Promise<void>
  abstract save(): Promise<void>

  constructor(options: StateStoreOptions) {
    this.state = options.initialState
  }
}

export interface StateStoreOptions {
  initialState: MigrationState
}