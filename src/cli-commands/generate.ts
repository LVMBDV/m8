import { CliCommand } from "cilly"
import CommandLineInterface from "../CommandLineInterface"

export default new CliCommand("generate")
  .withArguments({
    name: "name",
    description: "The name of the migration to generate.",
    required: true
  })
  .withDescription("Generate a new migration")
  .withHandler(async (args) => {
    CommandLineInterface.instance.migrationManager.generateMigration(args.name)
  })