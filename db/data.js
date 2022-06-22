// import mongoose
const mongoose = require('mongoose');


// Buat Schema
const Brainly = mongoose.Schema({
	title: {
		type: String
	},
	alias: {
		type: String
	},
	url: {
		type: String
	},
	canonicals: {
		type: Array
	},
	description: {
		type: String
	},
	content: {
		type: String
	},
	image: {
		type: String
	},
	author: {
		type: String
	},
	source: {
		type: String
	},
	domain: {
		type: String
	},
	publishedTime: {
		type: String
	},
	duration: {
		type: Number
	}
}, {
	timestamps: {
		createdAt: true,
		updatedAt: false
	}
});

// export model

module.exports = mongoose.model('sitemap_2015-05_1.xml', Brainly);
