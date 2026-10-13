# SVG 编辑器（CLI）Phase 1

## 架构方案

### 模块划分

程序按职责分成六个模块。图形本身不知道命令和文件；命令不知道终端怎么读行。

```plantuml
@startuml
package cli {
  class CliRepl
}
package app {
  class EditorSession
  class CommandLineParser
  class HelpText
}
package command {
  class Command
  class CommandHistory
  class CommandRegistry
}
package io {
  class SvgReader
  class SvgWriter
}
package document {
  class SvgDocument
}
package shape {
  abstract class Shape
  class Group
  class Rect
  class Circle
  class Ellipse
  class Line
  class Text
  class ShapeFactory
}

cli --> app
app --> command
command --> document
command --> io
document --> shape
io --> document
io --> shape
Group --|> Shape
Rect --|> Shape
Circle --|> Shape
Ellipse --|> Shape
Line --|> Shape
Text --|> Shape
@enduml
```

| 模块 | 目录 | 职责 |
|---|---|---|
| shape | `src/shape/` | 图形层次。抽象类 `Shape` 规定移动、缩放、设属性、树摘要和写出 XML。叶子是 `Rect`、`Circle`、`Ellipse`、`Line`、`Text`。`Group` 是组合节点，对容器和叶子使用同一套操作。 |
| document | `src/document/` | 当前文档：画布尺寸、根子节点、大小写敏感的 id 索引、来源路径、元素计数。 |
| io | `src/io/` | 把文档读成对象、把对象写成可在浏览器打开的 SVG。缺 id 时按 `标签名+序号` 分配并警告。 |
| command | `src/command/` | 一条编辑命令是一个撤销单元。历史栈负责 undo/redo，以及文档类命令之后的锁定。 |
| app | `src/app/` | `EditorSession` 执行一行命令并返回要打印的文本，供 REPL 和测试共用。引号分词、`#` 注释和帮助文本也放在这里，避免会话反过来依赖终端。 |
| cli | `src/cli/` | `CliRepl`：提示符 `svg>`、读入一行、打印会话返回的文本。不碰具体图形类。 |

### 设计模式的选择

**Command。** 每次成功的编辑都生成一个命令对象，上面有 `execute` 和 `undo`。`CommandHistory` 保存 undo 栈和 redo 栈。一条命令是一个撤销单元，所以 `group` 多个图形也只占一格。显示类命令不入栈。

文档类命令的锁定规则：

- `init` / `read` 替换当前文档，清空两栈并上锁。
- `save` 和带参数的 `canvas` 只上锁，不清栈。
- 锁着时 `undo` / `redo` 报 `error: undo not allowed after io command`。
- 下一次成功的编辑命令解锁。undo 之后如果有新编辑，redo 栈清空。
- 逆操作记在命令对象里：位移取反、属性旧值、删除前的父节点和下标、缩放前的几何快照。不克隆整份文档，避免 `1/factor` 的浮点误差。

**Composite。** `Group` 与叶子都是 `Shape`。`move`、`scale`、`set`、`delete` 不区分调用方是容器还是叶子。组的移动和缩放递归到每个子孙，直接改几何数值，不写 `transform`。

**两处按名字分派，都标为待重构：**

1. `CommandRegistry`：命令名到命令类。REPL 不能到处 `switch` 命令名。
2. `ShapeFactory`：类型名或 SVG 标签名到图形类。读入和 `create` 都走这里。

其余行为走多态。例如 `SetCommand` 调用 `shape.set`，不按图形种类分支。本阶段 `create box` 仍报 `unknown shape type`，不实现插件接口。

### 依赖方向规则

允许的依赖只有向下：

- `shape` 不依赖任何业务模块。
- `document` 只依赖 `shape`。
- `io` 依赖 `document` 和 `shape`。
- `command` 依赖 `document`、`shape`、`io`。
- `app` 依赖 `command`（以及为了执行一行所需要的解析入口）。
- `cli` 只依赖 `app`。

这样规定是为了把变化隔开：换终端不必改图形；换文件格式不必改命令历史；加一种图形只经过工厂。`cli` 若直接 import 某个叶子图形，或 `shape` 若 import 命令，都是待处理项。

### 变化点假设

1. **新图形类型（例如后续的 `box`）。** 留了 `ShapeFactory` 这一处注册。本阶段不留 `ShapeProvider` 插件接口：题目把插件化划到下一阶段，现在做空接口没有调用方。
2. **新命令。** 留了 `CommandRegistry`。新命令实现 `Command` 后注册，不改 REPL 循环。
3. **图形界面或其它前端。** 留了 `EditorSession`。CLI 只负责读行和打印，测试可以直接调用会话。
4. **用 `transform` 或保留未知属性做无损往返。** 决定不留。`scale` 的语义是改几何属性；`set` 有白名单。再保留一套原始属性和变换矩阵，会和这两条规则冲突，也会把本阶段的读写扩大成通用 SVG 引擎。

## 过程记录

实现过程中再填写。

## 一致性自查

实现完成后对照上面的方案填写。

## 质量保证手段

实现完成后填写。依据将包括与各命令一起提交的单元测试，以及题目第 6 节两段完整会话的回放。
