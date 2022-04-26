const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');

const images = []; 
const seemsPages = {};

const scanPage = async (url, depth = 0, maxDepth = 3) => {
    if (!isUrlValid(url) || seemsPages[url]) return;
    
    seemsPages[url] = true;
    let htmlContent;
    try {
        const response = await axios(url);
        htmlContent = cheerio.load(response.data);
    } catch (error) {
        console.error(error);
        return;
    }
    const links = [];

    htmlContent("img").map((i, img) => {
        const image = {
            depth,
            imageUrl: img.attribs.src,
            sourceUrl: url 
        } 
        images.push(image);
    });

    htmlContent("a").map((i, link) => {
        if (link.attribs && isUrlValid(link.attribs.href)) {
            links.push(link.attribs.href);
        }
    });

    if (depth <= maxDepth) {
        for (const link of links) {
            depth++;
            await scanPage(link, depth);
        }
    }
      
}

const crawle = async () => {
    const args = process.argv.slice(2);
    const baseUrl = args[0];
    const depthLevel = args[1];
    await scanPage(baseUrl, depthLevel);
    writeToFile(images);    
};

const writeToFile = (images) => {
    fs.writeFile('results.json', JSON.stringify(images), 'utf8', () => {});
}

const isUrlValid = (url) => {
    return url && url.includes("http"); 
}

crawle();
