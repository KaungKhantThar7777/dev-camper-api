const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  //copy req.query
  let reqQuery = { ...req.query };

  //exclude fields
  let removeFields = ["select", "sort", "page", "limit"];

  //delete removeFields from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);

  //changing mongo operator
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  //setting query
  query = model.find(JSON.parse(queryStr));

  //setting select fields
  if (req.query.select) {
    let selectFields = req.query.select.split(",").join(" ");
    query = query.select(selectFields);
  }

  //setting sort order
  if (req.query.sort) {
    let sortFields = req.query.sort.split(",").join(" ");
    query = query.sort(sortFields);
  }

  //pagination
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  let pagination = {};
  if (startIndex > 0 && total) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  query = query.skip(startIndex).limit(limit);

  //populate
  if (populate) {
    query = query.populate(populate);
  }
  //excuting query
  const results = await query;

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };
  next();
};

module.exports = advancedResults;
