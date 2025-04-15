import multer from "multer"

const formatFileName = (value) => {
    const imageName = value.replace(/\s+/g, ' ').replace(/[&\/\\#, +()$@~%'":*?<>{}-]/g, '_')
    return imageName
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/books/cover_image')
    },
    filename: (req, file, cb) => {
        let filename = `${Date.now()}_${formatFileName(file.originalname)}`
        cb(null, filename)
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
        cb(null, true)
    } else {
        cb(null, false)
        return cb(new Error("Only .png,.jpg,.jpeg files are allowed"))
    }
}

const multerConfig = multer({
    storage,
    fileFilter
})

// module.exports = multerConfig

export default multerConfig