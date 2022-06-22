const randomUseragent = require("random-useragent");
const {
	parseHTML,
	parseJSON
} = require("linkedom");
const {
	extract
} =
require('article-parser');
const fs = require('fs');
const https = require("https");
const path = require('path');

const config = require("../config");
const {
	saveBrainly
} = require('./database')

const agent = new https.Agent({
	rejectUnauthorized: false,
});


const parserJson = async (url, folderTarget, filename) => {
	const requestOptions = {
		headers: {
			'user-agent': randomUseragent.getRandom(function(ua) {
				return parseFloat(ua.browserVersion) >= 50;
			}),
			accept: 'text/html; charset=utf-8'
		},
		responseType: 'text',
		responseEncoding: 'utf8',
		timeout: 6e4,
		maxRedirects: 3,
		agent
	}

	const extractContent = await extract(url, requestOptions)
	const elementRemove = config.element_remove;

	let {
		document
	} = parseHTML(extractContent.content);

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

	function isEmpty(obj) {
		return Object.values(obj).length === 0;
	}

	if (isEmpty(extractContent.content)) {
		return
	}

	extractContent.content = document.body.outerHTML

	const data = {
		title: extractContent.title ? extractContent.title.trim() : '',
		alias: extractContent.alias ? extractContent.alias.trim() : '',
		url: extractContent.url ? extractContent.url.trim() : '',
		canonicals: extractContent.canonicals ? extractContent.canonicals.map(conical => conical.trim()) : '',
		description: extractContent.description ? extractContent.description.trim() : '',
		content: extractContent.content ? extractContent.content.trim() : '',
		image: extractContent.image ? extractContent.image.trim() : '',
		author: extractContent.author ? extractContent.author.trim() : '',
		source: extractContent.source ? extractContent.source.trim() : '',
		domain: extractContent.domain ? extractContent.domain.trim() : '',
		publishedTime: extractContent.publishedTime ? extractContent.publishedTime.trim() : '',
		duration: extractContent.duration ? extractContent.duration : 0
	}

	// return fs.writeFileSync(filename, JSON.stringify(extractContent))
	return await saveBrainly(data)
}


module.exports = parserJson
