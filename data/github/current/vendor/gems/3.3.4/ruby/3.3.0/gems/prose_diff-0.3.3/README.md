# ProseDiff

ProseDiff is a diffing library for showing the differences between two versions of *prose*, human language text. ProseDiff operates on HTML, however it is not intended to diff any two arbitrary HTML documents: It is designed to operate on the subset of HTML produced by rendering Markdown to HTML.

ProseDiff is a library, therefore the audience for this document is presumed to be GitHubbers creating user-facing tools that work with markdown (or rich text internally implemented with markdown). ProseDiff could be used to display such things as the differences between two documents, the differences between two versions of the same document, or the changes made to a document before committing or saving.

### using ProseDiff

At this time, ProseDiff accepts two HTML texts and produces a diff in that represents the edits made to transform one into the other.

The simplest way to use ProseDiff is through `ProseDiff.html`. You pass in two HTML documents as text, interpreted as the "before" and the "after." It returns HTML representing the "after," with markup representing the differences from the "before."

Here's the "NOOP" example:

```ruby
ProseDiff.html(
  %Q{<p>Hello Github</p>},
  %Q{<p>Hello Github</p>}
)
  # => => "<p>Hello Github</p>"
```
Here are examples adding, deleting, and changing a word:

```ruby
ProseDiff.html(
  %Q{<p>Hello Github</p>},
  %Q{<p>Hello Excellent Github</p>}
)
  # => "<p class="changed">Hello <ins>Excellent </ins>Github</p>"
```

```ruby
ProseDiff.html(
  %Q{<p>Hello Excellent Github</p>},
  %Q{<p>Hello Excellent GitHub</p>}
)
  # => <p class="changed">Hello Excellent <span class="changed">Git<del>h</del><ins>H</ins>ub</span></p>
```

ProseDiff does not do a strictly literal diff, as you might get from an off-the-shelf library. It uses some heuristics. For example:

```ruby
ProseDiff.html(
  %Q{<p>Greeitngs GitHub</p>},
  %Q{<p>Greetings GitHub</p>}
)
  # => <p class="changed"><span class="changed">Gree<del>it</del><ins>ti</ins>ngs</span> GitHub</p>
```

A small change within a word is rendered as a single, contiguous `del` and `ins` pair.

```ruby
ProseDiff.html(
  %Q{<p>Ghastlies GitHub</p>},
  %Q{<p>Godliness GitHub</p>}
)
  # => "<p class="changed"><del>Ghastlies</del><ins>Godliness</ins> GitHub</p>"
```

However a large change is rendered as changing the entire word. These heuristics are expected to be tweaked and change from time to time.

## Controlling the output

The result of the `diff` process is a node tree with a lot of special styles. For example:

```ruby
    ProseDiff::Diff.new(
      %Q{<p>Hello Github,</p><p>I am please to meet you.</p>},
      %Q{<p>Hello GitHub,</p><p>&nbsp;</p><p>I am pleased to meet you.</p>}
    ).node_set.to_html
    # => <p data-github-analysis="changed" data-github-before_id="17286eb053c09385658309604db9bc6a508621e0" data-github-tag="unchanged">Hello <span data-github-clazz="word" data-github-analysis="changed" data-github-before_id="3414f4f846ffa4a6b0aa64fe72643693db5e75d3" data-github-tag="unchanged">Git<span data-github-analysis="removed">h</span><span data-github-analysis="added">H</span>ub</span>,</p>
    <p data-github-analysis="added"> </p>
    <p data-github-analysis="changed" data-github-before_id="33f7b8496766613e024ec5252ca01a2579c89770" data-github-tag="unchanged">I am <span data-github-clazz="word" data-github-analysis="changed" data-github-before_id="407283f64dd6b103af750b64d57f243306fc6f28" data-github-tag="unchanged">please<span data-github-analysis="added">d</span></span> to meet you.</p>
```

The `#html` method takes that output and massages it to make it more useful for working with a Ruby view. It does this by putting it through a pipeline of transformers. Each transformer mutates the tree in some way, for example, `PropagateChanged` marks a paragraph as having changed if any of its contents have been added, removed, or edited.

The structure of the output is obviously important for displaying in a Prose-like view in various browsers and environments. Although *in theory* everything can be controlled with CSS in the browser, in practice it may be necessary to serve different structures to different browsers.

For example, most browsers render `del` elements with red strikethrough, and you can use CSS to emulate this appearance in many others. So you can display a deleted segment of text with `<del>elided</del>`. However, if a browser does not render `del` properly, you may wish to use `<strike>elided</strike>` instead.

The three transformers that control the structure and appearance of changed text are `Replace`, `Wrap`, and `Css`.

### Replace

`Replace` looks for elements that have been added or removed, and replaces them with a `del` or `ins` element. By default, it replaces `span` elements:

```ruby
ProseDiff.html %Q{<p id="example">old</p>}, %Q{<p id="example">new</p>}
  # => <div class="changed"><p id="example"><del>old</del><ins>new</ins></p></div>
  # => <p><del data-github-analysis="removed">old</del><ins data-github-analysis="added">new</ins></p>
```

Should you need to change this, you can do so with a hash of options. The rules are simple. First, all options are namespaced by the underscore-ized name of the transformer. So options for `Replace` will be written like this: `{replace: {option: value, option2: value2, ...}}`.

Second, options for `Replace`, `Wrap`, and `Css` are then subdivided by "analysis," like this:

```ruby
{
  replace: {
    {
      removed: { only: %w{span}, with: 'del' },
      added:   { only: %w{span}, with: 'ins' }
    }
  }
}
```

These are the default options for ProseDiff. They specify that by default, ProseDiff replaces added and removed spans with `ins` and `del` elements. If you wanted to use `strike` for compatibility with older browsers, but not replace added spans, you could pass some options into `#html`. Here's the full output without options:

```ruby
ProseDiff.html %Q{<p id="example">old</p>}, %Q{<p id="example">new</p>}
  # => <div class="changed"><p id="example"><del>old</del><ins>new</ins></p></div>
```

And here it is with options crafted for older browsers:

```ruby
ProseDiff.html %Q{<p id="example">old</p>},
               %Q{<p id="example">new</p>},
               replace: {
                 removed: { only: %w{span}, with: 'strike' },
                 added:   { only: [] }
               }
  # => <div class="changed"><p id="example"><del><strike>old</strike></del><span>new</span></p></div>
```

We'll see how to add a class to the `span` for inserted text when we look at `Css` below.

### Wrap

`Wrap` works just like `Replace`, only instead of replacing the existing element, it wraps the element in another element. By default, it wraps almost all additions and removals in `ins` and `del`, and it also wraps block-level changes in `div`.

Wrapping inline elements is necessary for almost all text, because if we replace elements like `strong` or `em` with `ins` or `del`, we would lose the semantics and styling. It is part of the standard definition for `ins` and `del` to wrap  block elements. ProseDiff doesn't do this by default for empirical reasons.

Here you can see that it has wrapped the `em` and `strong` elements with `del` and `ins` respectively, and wraps the chaned `p` with a `div`:

```ruby
ProseDiff.html %Q{<p>Vivamus fermentum <em>semper</em> porta</p>},
               %Q{<p>Vivamus fermentum porta <strong>nunc</strong></p>}
  # => <div class="changed"><p>Vivamus fermentum <del><em>semper</em></del><del> </del>porta<ins> </ins><ins><strong>nunc</strong></ins></p></div>
```

The default options for `Wrap` represent our current strategy for accommodating client browser capabilities:

```ruby
wrap: {
  removed: { only: %w{em strong i b u a strike fixed img a code p blockquote pre h1 h2 h3 h4 h5 h6 hr ol ul}, with: 'del' },
  added:   { only: %w{em strong i b u a strike fixed img a code p blockquote pre h1 h2 h3 h4 h5 h6 hr ol ul}, with: 'ins' },
  changed: { only: %w{p blockquote pre h1 h2 h3 h4 h5 h6 hr ol ul}, with: 'div' }
}
```

### Css

`Css` translates ProseDiff's annotations into classes that can be conveniently decorated with an external `.css` file. The defaults only apply `added` and `removed` styles to `div` and `li` elements, but allows `changed` styles on all elements:

```ruby
css: {
  removed:   { only: %w{div li}, with: 'removed' },
  added:     { only: %w{div li}, with: 'added' },
  changed:   { only: ProseDiff::Node::WHITELISTED + %w{div img}, except: %w{p blockquote pre h1 h2 h3 h4 h5 h6 hr ol ul}, with: 'changed' },
  unchanged: { only: [], with: nil }
}
```

If you wanted to change the `changed` style to `edited`, you would write:

```ruby
ProseDiff.html %Q{<h1 id="title">Vivamus exeunt</h1>},
               %Q{<h1 id="title">Fermentum porta</h1>},
               css: {
                 changed: { with: 'edited' }
               }
  # => <div class="edited"><h1 id="title">
       <del>Vivamus</del><ins>Fermentum</ins> <del>exeunt</del><ins>porta</ins>
       </h1></div>
```
