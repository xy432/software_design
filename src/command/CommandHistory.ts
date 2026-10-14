import { Command } from "./Command";

export class CommandHistory {
  private readonly undoStack: Command[] = [];
  private readonly redoStack: Command[] = [];
  private locked = false;

  isLocked(): boolean {
    return this.locked;
  }

  lock(): void {
    this.locked = true;
  }

  clear(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.locked = false;
  }

  push(command: Command): void {
    this.undoStack.push(command);
    this.redoStack.length = 0;
    this.locked = false;
  }

  peekUndo(): Command | undefined {
    return this.undoStack[this.undoStack.length - 1];
  }

  peekRedo(): Command | undefined {
    return this.redoStack[this.redoStack.length - 1];
  }

  commitUndo(): Command {
    const command = this.undoStack.pop();
    if (command === undefined) {
      throw new Error("nothing to undo");
    }
    this.redoStack.push(command);
    return command;
  }

  commitRedo(): Command {
    const command = this.redoStack.pop();
    if (command === undefined) {
      throw new Error("nothing to redo");
    }
    this.undoStack.push(command);
    return command;
  }
}
