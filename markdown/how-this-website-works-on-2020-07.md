---
title: how-this-website-works-on-2021-07
date: 2021-07-07
---

# How this website works on 2021-07

Previously this website was built with Gatsby - this was much too complicated.

My main use-case is writing Markdown, converting it to HTML and sticking it on
the internet. Now it does _just_ that.

Converting Markdown to HTML was interesting - There are many packages that can
do this, but I had some time on my hands so I used
[unified.js](https://unifiedjs.com/). (Ironically Gatsby uses this under the
hood.)

## Unified.js

Unified provides a pipeline for processing "content", which means anything that
a unified-compatible parser exists for. The idea is to parse Markdown to an
abstract syntax tree, jiggle the AST a bit, convert that to an HTML AST, perhaps
jiggle it a bit more and finally compile it to text.

The cool part of this is the jiggling. Currently it's set up to extract the
YAML-frontmatter from a Markdown document and insert that at a different place
in the HTML AST before spitting out some HTML text. Something like this:

```js
const assignTitle = () => {
    return (node, file) => {
        const html = node.children.find((c) => c.tagName === 'html')
        const head = html.children.find((c) => c.tagName === 'head')
        const title = head.children.find((c) => c.tagName === 'title')
        title.children[0].value = file.data.title
    }
}

export const markdownToHtml = async (path) => {
    const output = await unified()
        .use(remarkParse)
        .use(remarkFrontmatter)
        .use(remarkExtractFrontmatter, { yaml: yaml.parse })
        .use(remark2rehype)
        .use(rehypeDocument, { title: '' })
        .use(assignTitle)
        .use(rehypeStringify)
        .use(rehypeFormat)
        .process(toVFile.readSync(path))

    return { html: output.contents, metadata: output.data }
}
```
