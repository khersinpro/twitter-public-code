const path = require('path');
const multer = require('multer');

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            if(file.fieldname === 'tweet-image'){
                cb(null, path.join(__dirname, '../public/images/tweet-images'))
            }else if(file.fieldname === 'avatar'){
                cb(null, path.join(__dirname, '../public/images/avatars'))
            }
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`)
        }
    })
})

module.exports = upload;