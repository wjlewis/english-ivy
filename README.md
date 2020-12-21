# Overview

This is an experimental program editor.
As with a text editor, users describe programs using a keyboard.
_However_, programs are directly represented by and manipulated as ASTs.
This has several benefits:

- No need to type parts of concrete syntax like "function", "if", "{", etc. (i.e. describe programs like you'd describe them to a fellow human being: "Create a function with the name `quux` that takes two parameters...").
- **No need for parsing** (it is not possible to describe a program with a syntax error).
- Multiple layouts for the same programming language (e.g. "C-like", "Python-like", etc.)
- Layouts not currently possible with current text editors (e.g. derivation trees)
- 3D syntax?

It should be possible to let users add custom tree manipulations as well.
In fact, my hope is that most of the editing commands will not need to be baked into the editor, but can exist in some modifiable userland layer.
We shall see.
