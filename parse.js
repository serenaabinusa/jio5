const fs = require("fs");
const https = require("https");
const path = require("path");
const v8 = require("v8");

const parserJson = require("./utils/parserJson");
const parserHtml = require("./utils/parserHtml");

const {
	getBrainlysLatestInsert,
	getBrainlys
} = require('./utils/database');

const waiting = (time) => {
	return new Promise((resolve) => setTimeout(resolve, time));
};

const parse = async () => {

	// const url = 'https://brainly.co.id/tugas/13875766';

	// statusdata.on('connection', function(socket) {
	// 	console.log("Made socket connection");

	// 	socket.emit('welcome', {
	// 		message: 'Welcome!',
	// 		id: socket.id
	// 	});

	// });

	const dir = process.cwd();
	const folderTarget = "brainly.co.id";

	const sitemapDataFolder = dir + "/data/sitemap";
	const sitemapOutputFolder = dir + "/output/sitemap/" + folderTarget;
	const scrapeDB = dir + "/db/scrape.json";

	try {
		if (!fs.existsSync(sitemapDataFolder)) {
			console.log("Folder target data not found");
			process.exit(0);
		}

		if (!fs.existsSync(scrapeDB)) {
			fs.writeFileSync(`${scrapeDB}`, '[]');
		}

		if (!fs.existsSync(sitemapOutputFolder)) {
			fs.mkdirSync(`${sitemapOutputFolder}`, {
				recursive: true,
			});
		}

		const readDir = fs.readdirSync(`${sitemapDataFolder}/${folderTarget}`, {
			withFileTypes: true,
		});

		const EXTENSION = ".txt";

		const readdirSync = (p, a = []) => {
			if (fs.statSync(p).isDirectory())
				fs.readdirSync(p).map((f) =>
					readdirSync(a[a.push(path.join(p, f)) - 1], a)
				);
			return a;
		};

		const targetSitemapFile = readdirSync(sitemapDataFolder).filter((file) => {
			return path.extname(file).toLowerCase() === EXTENSION;
		});

		const countFileSitemap = () => {
			const readDir = fs.readdirSync(`${sitemapOutputFolder}`, {
				withFileTypes: true,
			});

			const EXTENSION = ".json";

			const readdirSync = (p, a = []) => {
				if (fs.statSync(p).isDirectory())
					fs.readdirSync(p).map((f) =>
						readdirSync(a[a.push(path.join(p, f)) - 1], a)
					);
				return a;
			};

			const targetSitemapFile = readdirSync(sitemapOutputFolder).filter(
				(file) => {
					return path.extname(file).toLowerCase() === EXTENSION;
				}
			);

			if (targetSitemapFile.length > 0) {
				return targetSitemapFile.length
			}
			else {
				return 0
			}

		}
		const writeScrapeDB = async (url, sitemapName, status) => {
			const readScrapeDB = fs.readFileSync(scrapeDB, "utf-8");

			const parseScrapeDB = JSON.parse(readScrapeDB);

			const findSitemapName = parseScrapeDB.find(
				(sitemap) => sitemap.sitemapName == sitemapName
			);

			if (findSitemapName) {
				findSitemapName.sitemapName = sitemapName;
				findSitemapName.lastSitemapUrl = url;
				findSitemapName.status = status;

				fs.writeFileSync(scrapeDB, JSON.stringify(parseScrapeDB, null, 2));
			}
		};

		const getBrainlysLatest = await getBrainlysLatestInsert()

		const getSitemapUrls = (sitemapFile, sitemapName) => {
			const readSitemapUrls = fs.readFileSync(sitemapFile, "utf-8");

			const sitemapUrls = readSitemapUrls.split("\n");

			let sitemapLength = sitemapUrls.length;
			let newSitemapUrls;

			const readScrapeDB = getBrainlysLatest

			if (readScrapeDB) {
				if (Object.values(readScrapeDB.url) != "") {
					const lastErrorSitemapUrl = sitemapUrls.indexOf(
						readScrapeDB.url
					);

					if (lastErrorSitemapUrl > -1) {
						newSitemapUrls = sitemapUrls.slice(
							lastErrorSitemapUrl + 1,
							sitemapLength
						);

						return newSitemapUrls;
					}
					else {
						return sitemapUrls;
					}
				}
				else {
					return sitemapUrls;
				}
			}
			else {
				return sitemapUrls;
			}

		};




		// let sitemapUrls = getSitemapUrls();

		let folderSitemapName;
		const initialStats = v8.getHeapStatistics();

		const totalHeapSizeThreshold = (initialStats.heap_size_limit * 85) / 100;

		console.log("totalHeapSizeThreshold: " + totalHeapSizeThreshold);

		for (let [idxtarget, targetFile] of targetSitemapFile.entries()) {
			console.log(
				"=> Starting scrape sitemap > " +
				targetSitemapFile[idxtarget] +
				" ( " +
				Number(idxtarget + 1) +
				"/" +
				targetSitemapFile.length +
				" )"
			);
			folderSitemapName = path.basename(path.dirname(targetFile));

			// const readSitemapUrls = fs.readFileSync(targetFile, "utf-8");
			const sitemapUrls = getSitemapUrls(targetFile, folderTarget);

			for (let [idx, url] of sitemapUrls.entries()) {
				let detectHeapOverflow = () => {
					let stats = v8.getHeapStatistics();

					// console.log("total_heap_size: " + stats.total_heap_size);

					if (stats.total_heap_size > totalHeapSizeThreshold) {
						process.exit();
					}
				};

				detectHeapOverflow();

				console.log(
					"=> Scrape > " +
					sitemapUrls[idx] +
					" ( " +
					Number(idx + 1) +
					"/" +
					sitemapUrls.length +
					" )"
				);

				let replaceUrl = `${url
          .replace("http://", "http-")
          .replace("https://", "https-")
          .replace(/\//g, "-")}`;

				//console.log(`=> Starting scrape ${url}`)

				let jsonFileName = `${replaceUrl}.json`;
				let htmlFileName = `${replaceUrl}.html`;

				if (!fs.existsSync(`${sitemapOutputFolder}/${folderSitemapName}`)) {
					fs.mkdirSync(`${sitemapOutputFolder}/${folderSitemapName}`, {
						recursive: true,
					});
				}

				await parserJson(
					url,
					folderTarget,
					`${sitemapOutputFolder}/${folderSitemapName}/${jsonFileName}`
				);
				await writeScrapeDB(url, folderTarget, "FETCH");
				// const getBrainlyData = await getBrainlys()


				await waiting(1000);

				if (idx == sitemapUrls.length - 1) {
					console.log("Next", targetSitemapFile[idx]);
				}
			}
		}
	}
	catch (err) {
		console.log(err);
	}
};

module.exports = parse;
