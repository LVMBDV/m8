import { SourceFile } from "typescript"
import ts = require("typescript")

export default abstract class MigrationGenerator<O extends MigrationGeneratorOptions = MigrationGeneratorOptions> {
  constructor(readonly options: O) {}

  abstract generate(name: string): SourceFile
}

export interface MigrationGeneratorOptions {
  [key: string]: any
}