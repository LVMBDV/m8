export default class Migration {
  constructor(readonly options: MigrationOptions) {}

  async up(): Promise<void> {
    return promisifyMigrationMethod(this.options.definition.up)
  }

  async down(): Promise<void> {
    return promisifyMigrationMethod(this.options.definition.down)
  }
}

function promisifyMigrationMethod(method: MigrationMethod): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let result

    try {
      result = method(resolve as () => void)
    } catch (error) {
      reject(error)
    }

    if (result instanceof Promise) {
      result.then(resolve, reject)
    } else {
      resolve()
    }
  })
}

export interface MigrationOptions {
  readonly path: string
  readonly definition: MigrationDefinition
}

export type MigrationDefinition = AsyncMigrationDefinition | SyncMigrationDefinition

export type MigrationMethod = SyncMigrationMethod | AsyncMigrationMethod

export function isMigrationDefinition(value: any): value is MigrationDefinition {
  return value instanceof Object
  && typeof value.up === "function"
  && typeof value.down === "function"
}

export interface AsyncMigrationDefinition {
  up: AsyncMigrationMethod
  down: AsyncMigrationMethod
}

export type AsyncMigrationMethod = () => Promise<void>

export interface SyncMigrationDefinition {
  up: SyncMigrationMethod
  down: SyncMigrationMethod
}

export type SyncMigrationMethod = (next: MigrationMethod) => void
