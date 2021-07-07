import remarkExtractFrontmatter from "remark-extract-frontmatter";
import remarkFrontmatter from "remark-frontmatter";
import remarkParse from "remark-parse";
import { toVFile } from "to-vfile";
import unified from "unified";
import yaml from "yaml";
import remark2rehype from "remark-rehype";
import rehypeDocument from "rehype-document";
import rehypeStringify from "rehype-stringify";
import rehypeFormat from "rehype-format";

const assignTitle = () => {
  return (node, file) => {
    const html = node.children.find((c) => c.tagName === "html");
    const head = html.children.find((c) => c.tagName === "head");
    const title = head.children.find((c) => c.tagName === "title");
    title.children[0].value = file.data.title;
  };
};

export const markdownToHtml = async (path) => {
  const output = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkExtractFrontmatter, { yaml: yaml.parse })
    .use(remark2rehype)
    .use(rehypeDocument, { title: "" })
    .use(assignTitle)
    .use(rehypeStringify)
    .use(rehypeFormat)
    .process(toVFile.readSync(path));

  return { html: output.contents, metadata: output.data };
};
