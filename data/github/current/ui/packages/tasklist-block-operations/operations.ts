import type {BlockContent, Code, List, Literal, ListItem, Root, Content, Heading} from 'mdast'
import {micromark} from 'micromark'
import {gfm, gfmHtml} from 'micromark-extension-gfm'
import {remark} from 'remark'
import remarkGfm from 'remark-gfm'

interface Raw extends Literal {
  type: 'raw'
}

declare module 'mdast' {
  interface StaticPhrasingContentMap {
    raw: Raw
  }
}

export function appendItem(source: string, position: number, value: string): string {
  transform(source, (ast: Root) => {
    const block = getTasklistBlocks(ast)[position]
    if (!block) return

    block.value = transformBlock(block.value, list => {
      list.children.push({
        type: 'listItem',
        checked: false,
        children: transformText(value),
      })
    })
    source = replaceBlock(source, block)
  })

  return source
}

export function removeItem(source: string, position: [number, number]): string {
  transform(source, (ast: Root) => {
    const block = getTasklistBlocks(ast)[position[0]]
    if (!block) return

    block.value = transformBlock(block.value, list => {
      list.children.splice(position[1], 1)
    })

    source = replaceBlock(source, block)
  })

  return source
}

export function removeTasklistBlock(source: string, position: number): string {
  transform(source, (ast: Root) => {
    const block = getTasklistBlocks(ast)[position]
    if (!block) return

    const index = ast.children.indexOf(block)
    ast.children.splice(index, 1)

    source = removeBlock(source, block)
  })

  return source
}

export function updateItemPosition(source: string, src: [number, number], dst: [number, number]): string {
  transform(source, (ast: Root) => {
    const srcBlock = getTasklistBlocks(ast)[src[0]]
    const dstBlock = getTasklistBlocks(ast)[dst[0]]
    if (!srcBlock || !dstBlock) return

    let item: ListItem | undefined

    srcBlock.value = transformBlock(srcBlock.value, list => {
      item = list.children[src[1]]

      // Remove item from original position before inserting into new position
      list.children.splice(src[1], 1)
    })

    dstBlock.value = transformBlock(dstBlock.value, list => {
      if (item) list.children.splice(dst[1], 0, item)
    })

    if (srcBlock === dstBlock) {
      source = replaceBlock(source, srcBlock)
    } else if (src[0] < dst[0]) {
      source = replaceBlock(source, dstBlock)
      source = replaceBlock(source, srcBlock)
    } else {
      source = replaceBlock(source, srcBlock)
      source = replaceBlock(source, dstBlock)
    }
  })

  return source
}

export function updateItemState(source: string, position: [number, number], closed: boolean): string {
  transform(source, (ast: Root) => {
    const block = getTasklistBlocks(ast)[position[0]]
    if (!block) return

    block.value = transformBlock(block.value, list => {
      const item = list.children[position[1]]
      if (!item) return
      item.checked = closed
    })

    source = replaceBlock(source, block)
  })

  return source
}

export function updateItemTitle(source: string, position: [number, number], value: string): string {
  transform(source, (ast: Root) => {
    const block = getTasklistBlocks(ast)[position[0]]
    if (!block) return

    block.value = transformBlock(block.value, list => {
      const item = list.children[position[1]]
      if (!item) return
      item.children = transformText(value)
    })

    source = replaceBlock(source, block)
  })

  return source
}

export function updateTasklistTitle(source: string, position: number, value: string): string {
  transform(source, (ast: Root) => {
    const cleanTitle = value.trim()

    const block = getTasklistBlocks(ast)[position]
    if (!block) return

    block.value = transformBlock(block.value, (_, root, heading) => {
      if (!cleanTitle) {
        // Delete heading node when title is empty
        const index = root.children.findIndex(node => node.type === 'heading')
        if (index > -1) root.children.splice(index, 1)
        return
      }
      if (!heading) {
        heading = {type: 'heading', depth: 3, children: []}
        root.children.unshift(heading) // Place heading above the list
      }
      heading.children = [{type: 'raw', value: cleanTitle}]
    })

    source = replaceBlock(source, block)
  })

  return source
}

function getTasklistBlocks(ast: Root): Code[] {
  return ast.children.filter(node => node.type === 'code' && node.lang === '[tasklist]') as Code[]
}

function removeBlock(source: string, block: Code): string {
  const before = source.slice(0, block.position!.start.offset)
  const after = source.slice(block.position!.end.offset)

  return [before.trimEnd(), after.trimStart()].filter(Boolean).join('\n\n')
}

function replaceBlock(source: string, block: Code): string {
  const before = source.slice(0, block.position!.start.offset)
  const after = source.slice(block.position!.end.offset)

  return `${before}\`\`\`[tasklist]\n${block.value}\n\`\`\`${after}`
}

function transform(source: string, callback: (ast: Root) => void): string {
  return remark()
    .use(remarkGfm)
    .use(() => callback)
    .data('settings', {
      bullet: '-',
      listItemIndent: 'one',
      join: [
        (left: Content, right: Content) => {
          if (left.type === 'heading' && right.type === 'list') {
            return 0
          }
        },
      ],
      handlers: {
        raw: (node: Raw) => node.value,
      },
    })
    .processSync(source)
    .toString()
}

function transformBlock(source: string, callback: (list: List, root: Root, heading?: Heading) => void): string {
  const output = transform(source, (root: Root) => {
    let list = root.children.find(node => node.type === 'list') as List
    const heading = root.children.find(node => node.type === 'heading') as Heading

    if (!list) {
      list = {type: 'list', children: []}
      root.children.push(list)
    }

    for (const listItem of list.children) {
      for (const paragraph of listItem.children) {
        if (paragraph.type === 'paragraph') {
          paragraph.children = paragraph.children.map(child => ({
            type: 'raw',
            value: source.slice(child.position!.start.offset, child.position!.end.offset),
          }))
        }
      }
    }

    callback(list, root, heading)
  })

  // Remove trailing newline
  return output.replace(/\n+$/, '')
}

function transformText(text: string): BlockContent[] {
  return [{type: 'paragraph', children: [{type: 'raw', value: text.trim()}]}]
}

export function transformToHTML(source: string): string {
  const html = micromark(source, {extensions: [gfm()], htmlExtensions: [gfmHtml()]})

  // Remove the wrapping <p> tag
  return html.replace(/^<p>|<\/p>$/g, '')
}
