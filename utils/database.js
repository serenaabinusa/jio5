const Brainly = require('../db/data')

// function get All Products
const getBrainlys = async () => {
	try {
		const brainly = await Brainly.find();
		return brainly;
	}
	catch (error) {
		console.log(`=> Error get data from database. ${error.message}`);
	}

}

const getBrainlysLatestInsert = async () => {
	try {
		const brainly = await Brainly.findOne().sort({
			createdAt: -1
		})
		return brainly;
	}
	catch (error) {
		console.log(`=> Error get data from database. ${error.message}`);
	}

}

// function get single Product
const getBrainlyById = async (dataId) => {
	try {
		const brainly = await Brainly.findById(dataId);
		return brainly;
	}
	catch (error) {
		console.log(`=> Error get data from database. ${error.message}`);
	}

}

// function Create Product
const saveBrainly = async (data) => {
	const brainly = new Brainly(data);
	try {
		const savedBrainly = await brainly.save();
		console.log(`=> Success save to database.`);
	}
	catch (error) {
		console.log(`=> Error get data from database. ${error.message}`);
	}
}

// function Update Product
const updateBrainly = async (data, dataId) => {
	const cekId = await Brainly.findById(dataId);
	if (!cekId) return console.log(`=> Data not found.`);
	try {
		const updatedProduct = await Brainly.updateOne({
			_id: dataId
		}, {
			$set: data
		});
		console.log(`=> Success update database.`);
	}
	catch (error) {
		console.log(`=> Error get data from database. ${error.message}`);
	}
}

// function Delete Product
const deleteBrainly = async (dataId) => {
	const cekId = await Brainly.findById(dataId);
	if (!cekId) return console.log(`=> Data not found.`);
	try {
		const deletedProduct = await Brainly.deleteOne({
			_id: dataId
		});
		console.log(`=> Success delete database.`);
	}
	catch (error) {
		console.log(`=> Error get data from database. ${error.message}`);
	}
}

module.exports = {
	getBrainlys,
	getBrainlysLatestInsert,
	getBrainlyById,
	saveBrainly,
	updateBrainly,
	deleteBrainly
}