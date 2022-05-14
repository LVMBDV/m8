import { readFile, writeFile } from "fs/promises"
import MigrationState from "../MigrationState"
import StateStore, { StateStoreOptions } from "./StateStore"

export default class FileStateStore extends StateStore {
  #path: string

  constructor(options: FileStateStoreOptions) {
    super(options)
    this.#path = options.path
  }

  async load(): Promise<void> {
    this.state = JSON.parse((await readFile(this.#path)).toString())
  }

  async save(): Promise<void> {
    await writeFile(
      this.#path,
      JSON.stringify(this.state, undefined, 4))
  }
}

interface FileStateStoreOptions extends StateStoreOptions {
  path: string
}