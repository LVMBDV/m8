export default interface MigrationState extends Object {
  lastMigration?: {
    path: string,
    index: number
  }
}