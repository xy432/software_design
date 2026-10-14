import { Command } from "./Command";
import { EditorContext } from "./EditorContext";

export class RedoCommand implements Command {
  allowsMissingDocument(): boolean {
    return false;
  }

  recordInHistory(): boolean {
    return false;
  }

  execute(context: EditorContext): string[] {
    if (context.history.isLocked()) {
      throw new Error("undo not allowed after io command");
    }
    const command = context.history.peekRedo();
    if (command === undefined) {
      throw new Error("nothing to redo");
    }
    const messages = command.execute(context);
    context.history.commitRedo();
    return messages;
  }

  undo(): string[] {
    return [];
  }
}
