import { HelpText } from "../app/HelpText";
import { Command } from "./Command";
import { EditorContext } from "./EditorContext";

export class HelpCommand implements Command {
  allowsMissingDocument(): boolean {
    return true;
  }

  recordInHistory(): boolean {
    return false;
  }

  execute(): string[] {
    return [HelpText.content];
  }

  undo(): string[] {
    return [];
  }
}
