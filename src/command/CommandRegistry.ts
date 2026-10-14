import { BackCommand } from "./BackCommand";
import { CanvasCommand } from "./CanvasCommand";
import { Command } from "./Command";
import { CreateCommand } from "./CreateCommand";
import { DeleteCommand } from "./DeleteCommand";
import { FrontCommand } from "./FrontCommand";
import { HelpCommand } from "./HelpCommand";
import { InitCommand } from "./InitCommand";
import { MoveCommand } from "./MoveCommand";
import { ReadCommand } from "./ReadCommand";
import { RedoCommand } from "./RedoCommand";
import { SaveCommand } from "./SaveCommand";
import { ScaleCommand } from "./ScaleCommand";
import { SetCommand } from "./SetCommand";
import { UndoCommand } from "./UndoCommand";

export class CommandRegistry {
  // 按命令名创建命令。这是全程序两处名字分派之一，后续应改为注册表，避免在这里继续加分支。
  private readonly factories = new Map<string, (tokens: string[]) => Command>([
    ["help", () => new HelpCommand()],
    ["init", (tokens) => new InitCommand(tokens)],
    ["read", (tokens) => new ReadCommand(tokens)],
    ["save", (tokens) => new SaveCommand(tokens)],
    ["canvas", (tokens) => new CanvasCommand(tokens)],
    ["create", (tokens) => new CreateCommand(tokens)],
    ["delete", (tokens) => new DeleteCommand(tokens)],
    ["move", (tokens) => new MoveCommand(tokens)],
    ["scale", (tokens) => new ScaleCommand(tokens)],
    ["set", (tokens) => new SetCommand(tokens)],
    ["front", (tokens) => new FrontCommand(tokens)],
    ["back", (tokens) => new BackCommand(tokens)],
    ["undo", () => new UndoCommand()],
    ["redo", () => new RedoCommand()],
  ]);

  create(name: string, tokens: string[]): Command | null {
    const factory = this.factories.get(name);
    if (factory === undefined) {
      return null;
    }
    return factory(tokens);
  }
}
