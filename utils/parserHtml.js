const randomUseragent = require("random-useragent");
const {
	parseHTML,
	parseJSON
} = require("linkedom");
const fetch = (...args) =>
	import("node-fetch").then(({
		default: fetch
	}) => fetch(...args));
const minify = require('html-minifier').minify;
const https = require("https");
const fs = require('fs');

const config = require("../config");


const parserHtml = async (url, filename) => {
	const agent = new https.Agent({
		rejectUnauthorized: false,
	});

	let headers = {
		Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
		"Accept-Encoding": "gzip, deflate",
		"User-Agent": randomUseragent.getRandom(function(ua) {
			return parseFloat(ua.browserVersion) >= 50;
		}),
		Referer: "https://www.google.com/",
	};

	const elementRemove = config.element_remove;
	const regExp = /<[^>]+href=['|"]([^'|")]*).*?>.*?<\/a>/g
	// const regExp = /<p>.*?<[^>]+href=['|"]([^'|")]*).*?>.*?<\/a>.*?<\/p>/g
	let content


	const request = await fetch(url, {
		method: "GET",
		redirect: "follow",
		mode: "no-cors",
		headers,
		agent,
	});

	content = await request.text()

	let {
		document
	} = parseHTML(content);

	if (elementRemove && elementRemove.length > 0) {
		for (element of elementRemove) {
			const elementRemove = document.querySelectorAll(element);
			elementRemove.forEach((el) => el.remove());
		}
	}

	let tagParagraph = document.querySelectorAll('p a')
	let documentOuterHtml

	if (tagParagraph.length > 0) {
		for (tag of tagParagraph) {
			let inner = tag.innerText

			documentOuterHtml = document.documentElement.outerHTML.replace(/<[^>]+href=['|"]([^'|")]*).*?>.*?<\/a>/g, inner)
		}

		document = parseHTML(`<!DOCTYPE html>${documentOuterHtml}`);
		document = document.document;
	}

	// content = document.toString();
	content = minify(document.body.outerHTML, {
		removeComments: true,
		removeScript: true,
		minifyCss: true,
		minifyJs: true,
		removeTagWhitespace: true,
		removeComments: true,
		removeCommentsFromCDATA: true,
		collapseWhitespace: true,
		collapseBooleanAttributes: true,
		removeAttributeQuotes: true,
		removeRedundantAttributes: true,
		useShortDoctype: true,
		removeEmptyAttributes: true,
		removeOptionalTags: true,
		removeEmptyElements: true,
	})

	return fs.writeFileSync(filename, content)

}


module.exports = parserHtml