const { Model}  = require("mongoose")
module.exports = (Model) => async (req, res, next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5
    const skip = (page - 1) * limit
    const sortBy = req.query.sort || "createdAt"
    const order = req.query.order === "desc" ? -1 : 1
  
    try {
      const [result, total] = await Promise.all([
        Model.find().sort({ [sortBy]: order }).skip(skip).limit(limit),
        Model.countDocuments(),
      ])
  
      res.paginateResult = {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
        result,
      }
  
      next()
    } catch (err) {
      next(err)
      // res.status(500).json({ message: "Error fetching data", error: err.message })
    }
  }
  