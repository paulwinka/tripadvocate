const debug = require('debug')('app:upload-multer-mw');
module.exports = () => {
  const multer = require('multer');
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '_' + file.originalname);
    },
  });
  const uploadImg = multer({ storage: storage });

  return uploadImg;
};
