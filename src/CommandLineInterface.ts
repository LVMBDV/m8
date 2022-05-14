import { camelCase, snakeCase, paramCase, pascalCase } from "change-case"
import { CliCommand } from "cilly"
import MigrationManager from "./MigrationManager"
import cliCommands from "./cli-commands"
import FileStateStore from "./state-stores/FileStateStore"
import SimpleMigrationGenerator from "./generators/SimpleMigrationGenerator"

export default class CommandLineInterface {
  static #instance: CommandLineInterface

  static get instance(): CommandLineInterface {
    return (this.#instance = this.#instance ?? new CommandLineInterface())
  }

  migrationManager: MigrationManager = new MigrationManager({
    stateStore: new FileStateStore({
      path: "./.migration-state.json",
      initialState: {}
    }),
    migrationsDir: "./migrations",
    casingTransformer: CASING_TRANSFORMERS["snake"],
    generator: new SimpleMigrationGenerator({}),
    strict: false
  })

  rootCommand: CliCommand = new CliCommand("m8")
    .withSubCommands(...cliCommands)

  constructor() {
    if (CommandLineInterface.#instance !== undefined) {
      throw new Error("CommandLineInterface is a singleton. Please use CommandLineInterface.instance.")
    }
  }
}

type casingKind = "camel" | "snake" | "kebab" | "pascal" | "lower" | "upper"

const CASING_TRANSFORMERS: Record<casingKind, (input: string) => string> = {
  camel: camelCase,
  snake: snakeCase,
  kebab: paramCase,
  pascal: pascalCase,
  lower: (s: string) => s.toLowerCase(),
  upper: (s: string) => s.toUpperCase()
}