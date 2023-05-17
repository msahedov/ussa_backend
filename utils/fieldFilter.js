/**
 * this method deletes values from input
 * @param {*} fieldsObject fieldsObject - takes input body (req.body)
 * @param {*} blackListedFieldsArray  blackListedFieldsArray - takes array of fields to be deleted
 */
const fieldFilter = (fieldsObject, blackListedFieldsArray) => {
  blackListedFieldsArray.forEach(field => delete fieldsObject[field])
}

module.exports = fieldFilter
