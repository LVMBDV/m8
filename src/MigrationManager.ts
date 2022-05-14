import Migration, { isMigrationDefinition, MigrationDefinition } from "./Migration"
import { opendir, writeFile } from "fs/promises"
import { resolve as resolvePath } from "path"
import MigrationGenerator from "./generators/MigrationGenerator"
import SimpleMigrationGenerator from "./generators/SimpleMigrationGenerator"
import StateStore from "./state-stores/StateStore"
import MigrationState from "./MigrationState"

export default class MigrationManager {
  migrations: Migration[] = []

  constructor(public options: MigrationManagerOptions) {
  }

  get state(): MigrationState {
    return this.options.stateStore.state
  }

  async migrate(toPath?: string): Promise<void> {
    let migrationsToRun: Migration[]
    let migrationDirection: MigrationDirection

    let toIndex = this.migrations.findIndex((migration) => {
      return migration.options.path === toPath
    })

    if (toIndex === -1) {
      toIndex = this.migrations.length
    }

    await this.options.stateStore.load()

    if (this.state.lastMigration !== undefined) {
      const lastMigrationIndex = this.migrations.findIndex((migration) => {
        return migration.options.path === this.state.lastMigration!.path
      })

      let migrationsManuallyModified = false
      if (lastMigrationIndex === -1) {
        migrationsManuallyModified = true
        console.warn(`Could not find the last ran migration ${this.state.lastMigration!.path}`)
      } else if (this.state.lastMigration.index !== lastMigrationIndex) {
        migrationsManuallyModified = true
        console.warn(`Last ran migration index
        (${this.state.lastMigration.index}) does not match the actual index
        (${lastMigrationIndex}).`)
      }

      if (migrationsManuallyModified) {
        console.warn(`It seems like you have manually modified the migrations directory. Don't do that.`)

        if (this.options.strict) {
          throw new Error("Strict mode is enabled.")
        }
      }

      migrationsToRun = this.migrations.slice(toIndex, lastMigrationIndex)
      migrationDirection = (toIndex < lastMigrationIndex) ? "down" : "up"
    } else {
      migrationsToRun = this.migrations.slice(0, toIndex)
      migrationDirection = "up"
    }

    if (migrationDirection === "down") {
      migrationsToRun.reverse()
    }

    let migrationsToRollback: Migration[] = []
    try {
      for (const migration of migrationsToRun) {
        migrationsToRollback.push(migration)
        await migration[migrationDirection]()
      }
    } catch (error) {
      console.error(`Ran into an error:\n${error}`)
      for (const migration of migrationsToRollback) {
        await migration[oppositeDirection(migrationDirection)]()
      }
    }

    this.state.lastMigration = {
      path: migrationsToRun[migrationsToRun.length - 1].options.path,
      index: toIndex
    }

    await this.options.stateStore.save()
  }

  async generateMigration(name: string): Promise<void> {
    const generator = this.options.generator ?? new SimpleMigrationGenerator({})
    const migrationSource = generator.generate(name)

    if (this.options.casingTransformer !== undefined) {
      migrationSource.fileName = this.options.casingTransformer(migrationSource.fileName)
    }

    await writeFile(resolvePath(this.options.migrationsDir, migrationSource.fileName), migrationSource.getText())
    await this.scanForMigrations()
  }

  async scanForMigrations(): Promise<void> {
    const migrations: Migration[] = []
    for await (const entry of await opendir(this.options.migrationsDir)) {
      if (!entry.isFile()) {
        continue
      }

      let migrationDefinition = await import(entry.name)

      if (isMigrationDefinitionESModule(migrationDefinition)) {
        migrationDefinition = migrationDefinition.default
      } else if (!isMigrationDefinition(migrationDefinition)) {
        throw new Error(`Migration ${entry.name} is not a valid migration.`)
      }

      migrations.push(new Migration({
        path: resolvePath(this.options.migrationsDir, entry.name),
        definition: migrationDefinition
      }))
    }

    this.migrations = migrations
  }
}

type MigrationDirection = "up" | "down"

function oppositeDirection(direction: MigrationDirection): MigrationDirection {
  return direction === "up" ? "down" : "up"
}

export interface MigrationManagerOptions {
  stateStore: StateStore
  migrationsDir: string
  casingTransformer?: (input: string) => string
  generator?: MigrationGenerator<any>
  strict?: boolean
}

export function isMigrationDefinitionESModule(value: any): value is MigrationDefinitionESModule {
  return value instanceof Object
  && isMigrationDefinition(value.default)
}

export interface MigrationDefinitionESModule {
  default: MigrationDefinition
}