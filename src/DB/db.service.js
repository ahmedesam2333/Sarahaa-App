export const findOne = async ({
  model,
  filter = {},
  projection = {},
  populate = [],
} = {}) => {
  return await model.findOne(filter, projection).populate(populate);
};
export const create = async ({
  model,
  data = [{}],
  options = { validateBeforeSave: true },
} = {}) => {
  return await model.create(data, options);
};
