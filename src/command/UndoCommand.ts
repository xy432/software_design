import { Command } from "./Command";
import { EditorContext } from "./EditorContext";

export class UndoCommand implements Command {
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
    const command = context.history.peekUndo();
    if (command === undefined) {
      throw new Error("nothing to undo");
    }
    const messages = command.undo(context);
    context.history.commitUndo();
    return messages;
  }

  undo(): string[] {
    return [];
  }
}
