const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404)
    next(error)
}

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode
    let message = err.message

    //Check for Mongoose bad ObjectId
    if (err.name === "CastError" && err.kind === "ObjectId") {
        message = `Resource not found`
        statusCode = 404
    } else if (err.name === "ValidatorError" && err.kind === "unique") {
        const field = Object.keys(err.errors)[0]
        const value = err.errors[field].value
        message = `${field} with value '${value}' already exists`
        statusCode = 400
    }
    res.status(statusCode).json({
        status: false,
        message,
        stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
    })
}

export { notFound, errorHandler }