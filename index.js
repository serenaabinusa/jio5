const cluster = require("cluster");
const v8 = require("v8");
const parse = require("./parse");
const fs = require("fs");
const mongoose = require('mongoose');

(async () => {

	if (cluster.isMaster) {
		cluster.fork();
		cluster.on("exit", (deadWorker, code, signal) => {
			// Restart the worker
			let worker = cluster.fork();

			// Note the process IDs
			let newPID = worker.process.pid;
			let oldPID = deadWorker.process.pid;

			// Log the event
			console.log("worker " + oldPID + " died.");
			console.log("worker " + newPID + " born.");

			// if (fs.existsSync("./run")) {
			//   fs.unlinkSync("run");
			// }
		});
	}
	else {
		// worker
		const mongoString = "mongodb+srv://sam:masuk123@cluster0.btvzbux.mongodb.net/?retryWrites=true&w=majority"

		mongoose.connect(mongoString, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		})

		const db = mongoose.connection;
		db.on('error', (error) => console.error(error));
		db.once('open', () => console.log('Database Connected'));


		// here goes the main logic
		// here goes the main logic
		await parse();
		// heavyHeapConsumer();
	}
})();
