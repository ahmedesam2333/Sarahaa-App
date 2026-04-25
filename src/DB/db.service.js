export const findOne = async ({
  model,
  filter = {},
  projection = {},
  populate = [],
} = {}) => {
  return await model.findOne(filter, projection).populate(populate);
};

export const findById = async ({
  model,
  id,
  projection = {},
  populate = [],
} = {}) => {
  return await model.findById(id, projection).populate(populate);
};

export const create = async ({
  model,
  data = [{}],
  options = { validateBeforeSave: true },
} = {}) => {
  return await model.create(data, options);
};

export const findByIdAndUpdate = async ({
  model,
  id,
  updatedData = {},
} = {}) => {
  return await model.findByIdAndUpdate(id, updatedData, { after: true });
};
