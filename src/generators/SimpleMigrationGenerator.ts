import MigrationGenerator, { MigrationGeneratorOptions } from "./MigrationGenerator"
import { factory, SyntaxKind, SourceFile, createSourceFile, ScriptTarget, createPrinter, NewLineKind, EmitHint } from "typescript"

function createMigrationMethodDeclaration(identifier: string) {
  return factory.createMethodDeclaration(
    undefined,
    [factory.createModifier  (SyntaxKind.AsyncKeyword)],
    undefined,
    factory.createIdentifier(identifier),
    undefined,
    undefined,
    [],
    factory.createTypeReferenceNode(
      factory.createIdentifier("Promise"),
      [factory.createKeywordTypeNode(SyntaxKind.VoidKeyword)]),
    factory.createBlock([], true))
}

export default class SimpleMigrationGenerator
extends MigrationGenerator<SimpleMigrationGeneratorOptions> {
  generate(name: string): SourceFile {
    let filename = `${Math.floor(Date.now() / 1000)} ${name}.ts`

    const source = createSourceFile(filename, "", ScriptTarget.ESNext)
    const printer = createPrinter({
      newLine: NewLineKind.LineFeed
    })

    printer.printNode(
      EmitHint.SourceFile,
      factory.createExportAssignment(undefined, undefined, undefined,
        factory.createObjectLiteralExpression([
          createMigrationMethodDeclaration("up"),
          createMigrationMethodDeclaration("down")],
          true)),
      source)

    return source
  }
}

export interface SimpleMigrationGeneratorOptions
extends MigrationGeneratorOptions {}