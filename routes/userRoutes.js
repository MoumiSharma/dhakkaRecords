const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const joiSchemaValidation = require('../middleware/joiSchemaValidation');
const userSchema = require('../apiSchema/userSchema');
const tokenValidation = require('../middleware/tokenValidation');
var multer  = require('multer');
var upload = multer({ dest: './uploads/profile_pic/' });
const uploadPlaylist = multer({ dest: "./uploads/playlist" });

router.post('/otp-generation',
  joiSchemaValidation.validateBody(userSchema.otpGeneration),
  userController.sendOtp
);
router.post('/otp-validation',
  joiSchemaValidation.validateBody(userSchema.otpValidation),
  userController.otpValidation
);
router.post('/signup',upload.single('file'),
  joiSchemaValidation.validateBody(userSchema.signup),
  userController.signup
);
router.post('/social-login',
  joiSchemaValidation.validateBody(userSchema.socialLogin),
  userController.socialLogin
)

router.post('/login',
  joiSchemaValidation.validateBody(userSchema.login),
  userController.login
)

router.post('/insertFavourite',
  tokenValidation.validateToken,
  joiSchemaValidation.validateBody(userSchema.favourite),
  userController.addtoFavourite
)
router.get(
  "/favourite",
 tokenValidation.validateToken,
 userController.getFavouriteList
);
router.delete(
  "/favourite/:id",
 tokenValidation.validateToken,
 userController.deleteFavourite
);
router.post(
  "/playlist/create",uploadPlaylist.single("file") ,
 tokenValidation.validateToken,
 joiSchemaValidation.validateBody(userSchema.createPlaylist),
 userController.createPlaylist
);
router.get(
  "/playlist/fetch",
 tokenValidation.validateToken,
 userController.fetchPlaylist
);
router.delete(
  "/playlist/delete/:id",
 tokenValidation.validateToken,
 userController.deletePlaylist
);

router.post(
  "/playlist/addSong",
  tokenValidation.validateToken,
  joiSchemaValidation.validateBody(userSchema.addPlaylistSong),
  userController.addPlaylistSong
);
// router.get('/combine',
//   joiSchemaValidation.validateBody(userSchema.signup),
//   userController.combine
// );

router.post(
  "/playlist/removeSong",
  tokenValidation.validateToken,
  joiSchemaValidation.validateBody(userSchema.addPlaylistSong),
  userController.removePlaylistSong
);

router.put(
  "/playlist/updateSong/:id",uploadPlaylist.single("file"),
  tokenValidation.validateToken,
  userController.updatePlaylistSong
);

router.get(
  "/playlist/details/:id",
  tokenValidation.validateToken,
  userController.playlistDetails
);
module.exports = router;