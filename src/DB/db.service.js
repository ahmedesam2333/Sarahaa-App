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
  options = { returnDocument: "after" },
} = {}) => {
  return await model.findByIdAndUpdate(
    id,
    { ...updatedData, $inc: { __v: 1 } },
    options
  );
};

export const findOneAndUpdate = async ({
  model,
  filter = {},
  updatedData = {},
  options,
} = {}) => {
  return await model.findOneAndUpdate(
    filter,
    { ...updatedData, $inc: { __v: 1 } },
    options
  );
};

export const deleteOne = async ({ model, filter = {} } = {}) => {
  return await model.deleteOne(filter);
};
