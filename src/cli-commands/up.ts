import { CliCommand } from "cilly"
import CommandLineInterface from "../CommandLineInterface"

export default new CliCommand("up")
  .withArguments({
    name: "targetPath",
    description: "Path of the migration file to migrate upto",
    required: false
  })
  .withDescription("Apply migrations to a database")
  .withHandler(async (args) => {
  })