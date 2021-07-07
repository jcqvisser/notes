import fs from "fs";
import path from "node:path";
import { markdownToHtml } from "../tools/compile-markdown/compile-markdown.js";

const markdownDir = path.join(path.dirname(""), "/markdown");
const outputDir = path.join(path.dirname(""), "/pages");
const htmlFilename = "index.html";

const markdownFilenames = await fs.promises.readdir(markdownDir);

for (const markdownFilename of markdownFilenames) {
  const markdownFilePath = path.join(markdownDir, markdownFilename);
  const markdownExtension = path.extname(markdownFilename);

  const { html, metadata } = await markdownToHtml(markdownFilePath);

  const htmlFileBaseName = path.basename(markdownFilename, markdownExtension);
  const pageFileName = metadata.date + "-" + htmlFileBaseName;
  const htmlLocationPath = path.join(outputDir, pageFileName);
  const htmlFilePath = path.join(htmlLocationPath, htmlFilename);

  try {
    await fs.promises.mkdir(htmlLocationPath);
  } catch (e) {}

  await fs.promises.writeFile(htmlFilePath, html.toString());
}
