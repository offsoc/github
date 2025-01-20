# Status as of 2014-12-01

### outstanding macro issues

The largest macro issue is that there is no design for commenting on prose diffed code, nor is there any support for it.

As evidenced by the interest in experimenting with some spikes that have substantially reduced or non-overlapping scope, the second largest macro issue is that ProseDiff's requirements appear to be an area of opportunity for discussion and debate.

Assumptions such as "It will be rewritten in C to accommodate client-side prose diffing" and "It ought to diff HTML and be entirely agnostic about the prose source" ought to be reëxamined and their costs carefully weighed against the importance of developing support for comments.

This can all be boiled down to asking one question: "Are we trying to figure out how to tailor comments to fit ProseDiff as she is wrote, or tailor ProseDiff to fit comments as they are implemented in GitHub?"

https://github.com/github/prose_diff/discussions/285

### outstanding technical debt

Open functionality issues are reflected in https://github.com/github/prose_diff/issues?state=open.

There are a number of unofficial "to-dos" and conjectures with respect to improving the code base:

First and foremost, the current scheme for word-diffing began as a hack and is now a very expensive piece of technical debt.

The problem being solved was word-diffing "rich" HTML text, e.g. text that was wrapped in inline elements such as `a`, `span`, `em`, `strike`, or `i`. This presents a problem because the DOM presents such text as a tree, and changes such as wrapping a word in an anchor or changing the formatting of a sentence are represented and changes to the shape of the tree.

The naïve method of diffing a tree is to try to match similar nodes with each other and diff those recursively. For example, if you change `<p>The quick brown fox jumped over the lazy dog.</p>` into `<p>The quick brown fox <em>jumped</em> over the lazy dog.</p>`, you are changing a tree that looks like this:

* `p`
  * "The quick brown fox jumped over the lazy dog"

into:

* `p`
  * "The quick brown fox"
  * `em`
    * "jumped"
  * "over the lazy dog"

Without some knowledge that paragraphs of text are a special case, these two trees have a completely different structure and a naïve tree diff algorithm might easily decide that there has been a wholesale replacement of text. It is hard to match "The quick brown fox jumped over the lazy dog" up with "The quick brown fox", `<em>jumped</em>`, and "over the lazy dog" and infer that this is an edit of the same paragraph, espcially if combined with other edits such as word changes.

To accomplish get around this problem, we added a "split" all text into individual words, each with their own wrapping if necessary. In the case above,

* `p`
  * "The quick brown fox jumped over the lazy dog."

would be split into (ignoring whitespace):

* `p`
  * `span`
    "The"
  * `span`
    "quick"
  * `span`
    "brown"
  * `span`
    "fox"
  * `span`
    "jumped"
  * `span`
    "over"
  * `span`
    "the"
  * `span`
    "lazy"
  * `span`
    "dog"

And `<p>The quick brown fox <em>jumped</em> over the lazy dog.</p>` would be represented as:

* `p`
  * `span`
    "The"
  * `span`
    "quick"
  * `span`
    "brown"
  * `span`
    "fox"
  * `em`
    "jumped"
  * `span`
    "over"
  * `span`
    "the"
  * `span`
    "lazy"
  * `span`
    "dog"

This hack enabled us to feed the result into the existing mechanism for diffing nodes, and get the correct result when doing things like emphasizing a word. When the diffing was done, an inverse of the splitting ("`unsplit`") would be run to recompose things into contiguous spans.

It is now obvious that the benefit of reducing rich word diffing to a problem that has already been solved (diffing lists of nodes), is far outweighed by the complexity of the code and the performance implications. In addition, as other functions have been added, they have needed to work around the split/unsplit hack, negating any benefit of re-using existing code in the first place.

Rethink how to diff text with inline elements is a must.