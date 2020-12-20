"use strict";

const fs = require("fs");
const util = require("util");
const mjpage = require("mathjax-node-page");
const pug = require("pug");
const writeFile = util.promisify(fs.writeFile);
const cheerio = require("cheerio");

function asyncMathjax(html) {
  return new Promise(resolve => {
    mjpage.mjpage(
      html,
      {
        format: ["TeX"]
      },
      {
        mml: true,
        css: true,
        html: true
      },
      response => resolve(response)
    );
  });
}

function getMatch(string, query) {
  var result = string.match(query);
  if (result) {
    result = result[1];
  }
  return result;
}

exports.masterDocumentToPDF = async function(
  masterPath,
  page,
  tempHTML,
  outputPath,
  data
) {
  let html;
  if (masterPath.endsWith(".pug")) {
    try {
      html = await pug.renderFile(masterPath, {
        data: JSON.stringify(data)
      });
    } catch (error) {
      console.log(error.message);
      console.error("There was a Pug error (see above)".red);
      return;
    }
  }

  html = await asyncMathjax(html);
  var parsedHtml = await cheerio.load(html);
  html = await parsedHtml.html(); // adds html, body, head.
  var headerTemplate = parsedHtml("template.header").html();
  var footerTemplate = parsedHtml("template.footer").html();
  // await page.setContent(html)
  await writeFile(tempHTML, html);
  await page.goto("file:" + tempHTML, { waitUntil: "networkidle2" });
  // await page.waitForNavigation({ waitUntil: 'networkidle2' })
  var options = {
    displayHeaderFooter: true,
    headerTemplate:
      '<style>@font-face{font-family:Mina;src:url(/mina/Mina-Regular.woff2) format("woff2"),url(/mina/Mina-Regular.woff) format("woff"),url(/mina/Mina-Regular.ttf) format("truetype");font-weight:400;font-style:normal}@font-face{font-family:Mina;src:url(/mina/Mina-Bold.woff2) format("woff2"),url(/mina/Mina-Bold.woff) format("woff"),url(/mina/Mina-Bold.ttf) format("truetype");font-weight:700;font-style:normal}h1,h2,h3,h4,h5,h6,p,span{font-family:Mina,sans-serif}</style><div style="font-size:8px!important;color:grey!important;padding-left:500px;" class="pdfheader"><span>Tanggal dimuat: </span><span class="date"></span></div>',
    footerTemplate:
      '<style>@font-face{font-family:Mina;src:url(/mina/Mina-Regular.woff2) format("woff2"),url(/mina/Mina-Regular.woff) format("woff"),url(/mina/Mina-Regular.ttf) format("truetype");font-weight:400;font-style:normal}@font-face{font-family:Mina;src:url(/mina/Mina-Bold.woff2) format("woff2"),url(/mina/Mina-Bold.woff) format("woff"),url(/mina/Mina-Bold.ttf) format("truetype");font-weight:700;font-style:normal}h1,h2,h3,h4,h5,h6,p,span{font-family:Mina,sans-serif}</style><div style="font-size:8px!important;color:grey!important;padding-left:575px;" class="pdfheader"><span class="pageNumber"></span></div>',
    printBackground: true
  };
  var width = getMatch(html, /-relaxed-page-width: (\S+);/m);
  if (width) {
    options.width = width;
  }
  var height = getMatch(html, /-relaxed-page-height: (\S+);/m);
  if (height) {
    options.height = height;
  }
  var size = getMatch(html, /-relaxed-page-size: (\S+);/m);
  if (size) {
    options.size = size;
  }
  var pdfBuffer = await page.pdf(options);
  
  if (pdfBuffer) {
    return pdfBuffer;
  }
};
