const { Op } = require('sequelize');
class ApiFeatures {
	// private field
	// modelOptions = {};
	// node_engine < 8.0.0 doesn't support this

	constructor(model, queryObject) {
		this.model = model;
		this.queryObject = queryObject;
		this.modelOptions = {};
	}
	// private method, only must be used inside of this class (to prevent sql injection)
	// using hashtag in front of method not the best idea as ES community not fully supports it yet
	// TODO: check if beetween can be changed by lt&gt
	mapToSequelize(rawOperator) {
		const mappingObject = {
			'gt': Op.gt,
			'gte': Op.gte,
			'lt': Op.lt,
			'lte': Op.lte,
			'ne': Op.ne,
			'in': Op.in
		}
		if (Object.keys(mappingObject).includes(rawOperator)) return mappingObject[rawOperator];
	}

	getResultWithScopes(...scopes) {
		this.model = this.model.scope(...scopes);
		return this;
	}

	filter() {
		// looping throug queryObject
		for (const property in this.queryObject) {
			if (['limit', 'offset', 'paranoid'].includes(property)) {
				// limit and offset must be in outer scopes of model options object

				// maximum limit number cannot exceed than 100 
				if (property === 'limit' && this.queryObject[property] > 100) this.queryObject[property] = 100;
				// if paranoid exists its value changed to boolean
				if (property === 'paranoid') {
					if (this.queryObject[property] === 'true') this.queryObject[property] = true;
					if (this.queryObject[property] === 'false') this.queryObject[property] = false;
				} 

				this.modelOptions[property] = this.queryObject[property];
			} else if (property === 'sort') {
				// order in model options should be like this:
				// { order: [['field1', 'DESC'], ['field2', 'ASC']]};
				// whereas user input will look like this:
				// ?sort='-field1,field2'
				let orderArr = [];
				this.queryObject[property].split(',').forEach(item => orderArr.push([item]));
				orderArr.forEach(item => {
					if (item[0].startsWith('-')) {
						item[0] = item[0].slice(1);
						item.push('DESC')
					} else {
						item.push('ASC')
					}
				})
				this.modelOptions.order = orderArr;
			} else if (property === 'q') {
				// searchs word from defined fields
				// searching fields change by model
				if (this.model.name === 'products') {
					let obj = {
						[Op.or]: [
							{ 'name_ru': { [Op.iLike]: `%${this.queryObject[property]}%` } },
							{ 'name_tm': { [Op.iLike]: `%${this.queryObject[property]}%` } },
							{ 'description_ru': { [Op.iLike]: `%${this.queryObject[property]}%` } },
							{ 'description_tm': { [Op.iLike]: `%${this.queryObject[property]}%` } }
						]
					};
					this.modelOptions.where = { ...this.modelOptions.where, ...obj }
				} else if (this.model.name === 'users') {
					let obj = {
						[Op.or]: [
							{ 'name': { [Op.iLike]: `%${this.queryObject[property]}%` } },
							{ 'phoneNumber': { [Op.iLike]: `%${this.queryObject[property]}%` } },
						]
					};
					this.modelOptions.where = { ...this.modelOptions.where, ...obj }
				} else if (this.model.name === 'searchTerms') {
					let obj = { 'term': { [Op.iLike]: `%${this.queryObject[property]}%` } };
					this.modelOptions.where = { ...this.modelOptions.where, ...obj }
				} else {
					let obj = {
						[Op.or]: [
							{ 'name_ru': { [Op.iLike]: `%${this.queryObject[property]}%` } },
							{ 'name_tm': { [Op.iLike]: `%${this.queryObject[property]}%` } }
						]
					};
					this.modelOptions.where = { ...this.modelOptions.where, ...obj }
				}
			} else {
				// any other properties must be in where object
				// if nested then it changed to understandable way that sequelize will comprehend (i.e. mappedToSequelizeOperator)
				if (typeof this.queryObject[property] === 'object') {
					const key = Object.keys(this.queryObject[property])[0];
					let value = this.queryObject[property][key];
					// if value is 'null' its type set to valid type
					if (value === 'null') value = null
					this.queryObject[property] = { [this.mapToSequelize(key)]: value };
				}
				if (this.queryObject[property] === 'null') this.queryObject[property] = null;
				this.modelOptions.where = { ...this.modelOptions.where, [property]: this.queryObject[property] };
			}
		}
		console.log(this.modelOptions);
		return this;
	}

	getAllItemsOfModel() {
		// returns object which has count and rows properties
		return this.model.findAndCountAll(this.modelOptions);
	}

}
module.exports = ApiFeatures;