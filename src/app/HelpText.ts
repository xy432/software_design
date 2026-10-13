export class HelpText {
  static readonly banner = "svg-editor 0.1 — type 'help' for commands";

  static readonly content = [
    "init [w] [h]                     create an empty canvas (default 800x600)",
    "read <file.svg>                  load an SVG file as the current document",
    "save [file.svg]                   save the current document",
    "canvas [w] [h]                   show or resize the canvas",
    "create <type> <id> [params…] [in <containerId>]",
    "                                 create rect|circle|ellipse|line|text|g",
    "delete <id>                      delete a shape (a group deletes its descendants)",
    "move <id> <dx> <dy>              translate a shape, or a whole group",
    "scale <id> <factor>              scale geometry by a positive factor",
    "set <id> <attr> <value>          set a whitelisted attribute",
    "group <newGid> <id1> <id2>…      wrap existing shapes in a new group",
    "ungroup <gid>                    lift a group's children to its parent",
    "addto <gid> <id>                 move an existing shape into a group",
    "front <id>                       bring a shape to the front of its siblings",
    "back <id>                        send a shape to the back of its siblings",
    "tree [id]                        print the structure tree",
    "show <id>                        print one shape's attributes",
    "help                             show this message",
    "undo                             undo the last edit",
    "redo                             redo; a new edit clears the redo stack",
  ].join("\n");
}
