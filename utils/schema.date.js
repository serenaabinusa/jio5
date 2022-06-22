module.exports = (schema) => {
	const updateTimestemps = (next) => {
		let selt = this

		if (!self.createdAt) {
			self.createdDate = new Date()
		}
		next()
	}

	schema.pre('save', updateTimestemps)
}