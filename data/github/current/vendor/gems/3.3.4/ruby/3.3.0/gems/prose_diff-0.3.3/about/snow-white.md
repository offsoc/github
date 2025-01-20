**NOTA BENE**: This is a draft of a discussion that is now online at https://github.com/github/prose_diff/discussions/340. It is archived here for historical reasons.

---

## Comments on Source Diffs (draft)

One thing we've learned from team-shipping ProseDiff is that it rendered diffs cannot replace source-diffing at this time. There are two main reasons. First, there are some changes at the source level that are not visible in the rendered prose. Second, we do not (at this time) support any type of commenting beyond line comments in the diff.

And so we staff-shipped rendered prose diffs as an option. Users who wish to comment will do so using the source diff view. Nevertheless, there is value in being able to comment from within the rendered prose diff.

What would it take to make this possible?

### an observation

Let's begin with an observation about our constraints (or lack of constraints) that would apply to a first iteration of comments on source diffs:

> It is not necessary that comments on prose diffs replicate 100% of the functionality of source comments. Source comments would still be available, therefore prose diff functionality would always be an augmentation of existing functionality, no matter how narrowly applied.

If we accept this statement, it frees us from a number of limitations:

1. We needn't offer comments on every line of source.
2. We needn't offer comments on every kind of source document.

Liberated by these two consequences, here is one possible first iteration of commenting on rendered source diffs:

## Snow White

This document proposes an initial iteration, code named "Snow White," that offers rendered prose diff
comments *for Markdown documents only*. Other prose documents render as usual, but would not show comments
or allow them to be created.

Snow White takes the rendered diffs we already have and adds a very simple source mapping feature to them, allowing us to use the source comments we already have.

Snow White associates blocks of rendered prose with blocks of source code. For example, a paragraph in the rendered diff might be associated with three lines of markdown source:

![A paragraph](https://f.cloud.github.com/assets/17715/1642473/08fc9f88-5886-11e3-88f7-8f4880ccc315.png)

In the rendered view, Snow white would display any comment or comments associated with any of the paragraph's lines below the paragraph itself. Comments in the source diff view are exactly the same as comments in the rendered diff view.

If a comment is added to a block element such as a paragraph, Snow White would associate the comment with one of the lines associated with the block's source (such as the first line). Comments could not be added to deleted elements, just as they can't be added to deleted lines in the source diff view.

Snow White is the simplest comment feature that could possibly work.

### implementing the block mapping

Taken line by line, Markdown parsing is relatively idempotent. Meaning, that the parsed output of a line like:

```markdown
## The police box's bigger on the inside
```

Is the same regardless of where it appears in a document. There are some exceptions, such as:

```markdown
The police box's bigger on the inside
-------------------------------------
```

These two lines mean something else if they don't appear consecutively as above. If we coarsen our perspective and consider chunks of Markdown separated by blank lines, parsing Markdown is almost entirely idempotent, we don't need to worry about whether a line of text is followed by a line of dashes and so forth. There are still a few special cases, such as lists and custom HTML. But let's hand-wave for a moment and say we can handle the edge cases.

What does this afford us?

Consider this document:

```markdown
# heading

first paragraph
that has line
breaks

column one | column two
-----------|-----------
R1C1       | R1C2
R2C1       | R2C2
R3C1       | R3C2

second paragraph with ~~strikethrough~~ text
```

Let's call the blank lines `blank`, and the "blocks" `h1`, `p1`, `t`, and `p2`. The rendered result is `markdown(h1 + blank + p1 + blank + t + blank + p2)`. But thanks to the idempotency we've mentioned above, the rendered result is *also* `markdown(h1) + markdown(p1) + markdown(t) + markdown(p2)`.

Most interestingly, we can break down the blocks without knowing much about markdown parsing. For example, the table markup for the entire `t` block is non-standard, as is the inline `~~strikethrough~~` markup. We don't need to know how either of those things work to parse the document into blocks, and we can treat the actual processing of a block as an opaque function.

All we know is this:

block number | start line | end line
-------------|------------|---------
1            | 1          | 1
2            | 3          | 5
3            | 7          | 12
4            | 14         | 14

Given this table of blocks, we can pass each block's source to our existing markdown parser and obtain the following result:

block number | start line | end line | html
-------------|------------|----------|-----
1            | 1          | 1        | `<h1>heading</h1>`
2            | 3          | 5        | `<p>first paragraph that has line breaks</p>`
3            | 7          | 12       | `<table>` `<thead>` `<tr><th>column one</th><th>column two</th></tr>` `</thead>` `<tbody>` `<tr><td>R1C1</td><td>R1C2</td></tr>` `<tr><td>R2C1</td><td>R2C2</td></tr>` `<tr><td>R3C1</td><td>R3C2</td></tr>` `</tbody>` `</table>`
4            | 14         | 14       | `<p>second paragraph with <strike>strikethrough</strike> text</p>`

So what's next?

### diffing with blocks

Let's consider a "before:"

```markdown
# heading

first paragraph
that has line
breaks

column one | column two
-----------|-----------
R1C1       | R1C2
R2C1       | R2C2
R3C1       | R3C2

second paragraph with ~~strikethrough~~ text
```

And an "after:"

```markdown
# snow white

the first paragraph has
breaks between lines

column one | column two
-----------|-----------
R1C1       | R1C2
R2C1       | R2C2
R3C1       | R3C2

second paragraph with ~~strikethrough~~ text
```

We run our block algorithm and obtain:

block number | start line | end line | html
-------------|------------|----------|-----
1            | 1          | 1        | `<h1>heading</h1>`
2            | 3          | 5        | `<p>first paragraph that has line breaks</p>`
3            | 7          | 12       | `<table>` `<thead>` `<tr><th>column one</th><th>column two</th></tr>` `</thead>` `<tbody>` `<tr><td>R1C1</td><td>R1C2</td></tr>` `<tr><td>R2C1</td><td>R2C2</td></tr>` `<tr><td>R3C1</td><td>R3C2</td></tr>` `</tbody>` `</table>`
4            | 14         | 14       | `<p>second paragraph with <strike>strikethrough</strike> text</p>`

and:

block number | start line | end line | html
-------------|------------|----------|-----
1            | 1          | 1        | `<h1>snow white</h1>`
2            | 3          | 5        | `<p>the first paragraph has breaks between lines</p>`
3            | 7          | 12       | `<table>` `<thead>` `<tr><th>column one</th><th>column two</th></tr>` `</thead>` `<tbody>` `<tr><td>R1C1</td><td>R1C2</td></tr>` `<tr><td>R2C1</td><td>R2C2</td></tr>` `<tr><td>R3C1</td><td>R3C2</td></tr>` `</tbody>` `</table>`
4            | 14         | 14       | `<p>second paragraph with <strike>strikethrough</strike> text</p>`

We ignore the line mapping for the "before" version and run our existing Longest Common Subsequence (LCS) on the rendered HTML at the block level. We end up with:

block number | start line | end line | html
-------------|------------|----------|-----
             |            |          | `<del>` `<h1>heading</h1>` `</del>`
1            | 1          | 1        | `<ins>` `<h1 class="vicinity">snow white</h1>` `</ins>`
2            | 3          | 5        | `<p class="changed">` `<ins>the </ins>` `first paragraph `<del>that </del>` has `<del>line </del>` `<ins>breaks between lines</ins>` `</p>`
3            | 7          | 12       | `<table class="vicinity">` `<thead>` `<tr><th>column one</th><th>column two</th></tr>` `</thead>` `<tbody>` `<tr><td>R1C1</td><td>R1C2</td></tr>` `<tr><td>R2C1</td><td>R2C2</td></tr>` `<tr><td>R3C1</td><td>R3C2</td></tr>` `</tbody>` `</table>`
4            | 14         | 14       | `<p>second paragraph with <strike>strikethrough</strike> text</p>`

### displaying the rendered diff

We can give the "changed" and "vicinity" blocks to the view for rendering as follows:

block number | start line | end line | html
-------------|------------|----------|-----
             |            |          | `<del>` `<h1>heading</h1>` `</del>`
1            | 1          | 1        | `<ins>` `<h1 class="vicinity">snow white</h1>` `</ins>`

This block is displayed with the comments (if any) for line 1 beneath it. New comments will be added to line 1.

block number | start line | end line | html
-------------|------------|----------|-----
2            | 3          | 5        | `<p class="changed">` `<ins>the </ins>` `first paragraph `<del>that </del>` has `<del>line </del>` `<ins>breaks between lines</ins>` `</p>`

This block is displayed with the comments (if any) for lines 3-5 beneath it. New comments will be added to line 5.

block number | start line | end line | html
-------------|------------|----------|-----
3            | 7          | 12       | `<table class="vicinity">` `<thead>` `<tr><th>column one</th><th>column two</th></tr>` `</thead>` `<tbody>` `<tr><td>R1C1</td><td>R1C2</td></tr>` `<tr><td>R2C1</td><td>R2C2</td></tr>` `<tr><td>R3C1</td><td>R3C2</td></tr>` `</tbody>` `</table>`

This block is displayed with the comments (if any) for lines 7-12 beneath it. New comments will be added to line 12.

Thus, we are able to display the rendered diff, display existing comments on the diff, and accept new comments. We map the comments to a line within the block, allowing comments on our rendered diffs to "interoperate" with comments on source code diffs.