**NOTA BENE**: This document is a draft of a discussion that is online at https://github.com/github/prose_diff/discussions/323. It is archived here for historical purposes only.

---

# Thoughts on "Making people build software, together, better" (draft)

GitHub's mission and focus is *making people build software, together, better*.

### preamble

As noted by @defunkt, in order to guide our actions, a mission must not only point *towards* a particular direction, it must also point *away* from other directions. It must help us decide what not to do so that we have more time and attention for the things we must do. I believe that this mission does point towards investment in working with prose, and in fact it may make prose even more important now than in the past.

That being said, I also believe it points us away from certain activities and features that, while falling under the broadest possible definition of working with prose, do not fit "making people build software, together, better."

What follows is my one possible interpretation of where prose—especially diffing prose— fits within GitHub's mission. This is a manifesto of sorts, but not an official document.

### process, product, and values

When people develop software together, they create artefacts. Those artefacts can be bifurcated (roughly) into *product artefacts* and *process artefacts*. For example, code might support a function (product) or test (process). Prose artefacts can also be a part of the product (such as help text) or process (such as requirements).

We spend a lot of time thinking about the products people develop. And it's easy to think about how prose fits in the product. We certainly shouldn't abruptly stop thinking about products.

But.

GitHub doesn't provide our users with pieces of their products. We don't sell libraries, or license patents. We are in the *process* business. We don't make software better, we make people building software, together, better. This provokes a question: *Should GitHub's prose tooling emphasize process artefacts instead of product artefacts?*

Of course, this isn't a dichotomy. It's really a question of priorities. To borrow from the Agile Manifesto:

* We value improving processes over improving products
* We value improving communication over improving documentation

And most importantly, we value helping people ship quickly, learn from their experience, and iterate. We value lowering the latency and friction of this "lean" cycle over helping people get it perfect the first time.

These values are nothing new: They are the same values we apply to code, the same values that are inherent in the open-source community, the same values that are inherent in the very design of git itself.

### process prose

Where can prose help with process?

Obviously, "words" are a huge part of process. People may dream of self-documenting code and executable requirements, but words are the lingua franca of process today. People making software together communicate in words, and making that better means making communicating in words better.

But words fit in many contexts. Words can be captured in database-like tools: We do this with our issues and milestones. Words can be exchanged in communication tools: Outlook is the world's most popular project management platform. And words can be crafted into medium- and long-form documents: **Many of our corporate and government customers work with loosely structured prose documents such as requirements documentation or "plans of record."**

The process tools in our industry are developed with the explicit goal of extracting words from unstructured prose documents and bringing them into a structured and repeatable workflow. There are many benefits of structuring workflow.

But there are also trade-offs. Frequently, the structure is restrictive and people do "double bookkeeping," where the real process is done with outlook and or prose documents, while the official structured system is used only for show, or perhaps to record decisions after they have been made. There is also the effect of the process tooling being divorced from the product tooling.

Forcing people into overly restrictive structure adds friction to their experience. Our philosophy is that people build software, together, best when the process and the product tooling are tightly integrated. When they aren't, everything has higher latency and higher friction.

That's why we encourage the use of markdown within repositories, why we integrate issues, milestones, and pull requests with our code tooling, and why we encourage highly interconnected words with our links and back-references.

So how can GitHub's prose help people with their process? It's very simple: We can and should make process documents easy to write, review, and maintain. We can and should continue to encourage deep integration between documents and our existing issues.

In short, we should help people make software with lower latency and less friction. Making great tools for writing process prose does that.

### our message

Our message to our open-source, corporate, and government customers should be that GitHub is the very best place to host their process, whether it is structured (e.g. Issues, milestones, and pull requests) or prose (e.g. Requirements, specifications, plans of records).

Our message should be that our tooling is equally great whether they are tying an issue to a commit or referring to a subsection of a plan from within an issue.

Our message should be that GitHub helps people make software together, better, by providing insanely great tooling for prose that is part of their process.

### narrowing focus

If we embrace this idea of valuing process prose, a number of decisions become easier. Here are a few examples from ProseDiff:

1. We have a feature for line-diffing preformatted code blocks, and a feature for doing table diffs. Preformatted code blocks are much more about product prose than process prose. Tables often appear in documents containing milestones or other process information. *We should probably favour amazing table support over amazing embedded code support*.
2. Our structured process support is great with references. If I mention issue #42 in a comment on issue #6, a back-reference appears in issue #42. *We should provide similar reference and back-reference capabilities within prose documents*. If I link to the "our message" subheading of this document in issue #1406, the UX that shows this document on DotCom should show me a link to issue #1406.
3. Documents may look like single files to us, but they have structure and within reason we should support that structure. *We should be able to comment on cells within a table, or paragraphs. We should be able to track discussions on these elements separately*.
4. Prose Diffs, history, and blame should all be easily available from the document preview, not just from commit or pull request screens.

### in closing

Rather than repeat what has been said above, consider a simple use case. A team is building software, together. They have a "plan of record," a document that lays out what is to be done, by when.

The plan of record is written in markdown, with sections describing major points of functionality. The team can review it at any time. The history of updates can be reviewed at any time right within the preview. Issues, other docs, everything links into this document and is back-linked. Discussions revolve around the document and edits to the document.

Making prose awesome is a big goal and a nebulous one. There can and ought to be bigger goals than making a "plan of record" an awesome experience, but that simple case really helps us focus on *Making people build software, together, better.*
