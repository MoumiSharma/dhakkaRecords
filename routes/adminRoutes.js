const express = require('express');
const router = express.Router();
const {
    login,
    fetchAllcategories,
    insertCategory,
    updateCategory,
    deleteCategory,
    singleCategoryDetails, 
    fetchAllartist, 
    fetchAllmood, 
    fetchAllplaylist,
    singleMoodDetails,
    insertMood,
    updateMood,
    deleteMood,
    insertPlaylist,
    deletePlaylist
  } = require('../controller/adminController');
const {fetchAllSong,insertSong,updateSong,deleteSong} = require('../controller/songController');
const joiSchemaValidation = require('../middleware/joiSchemaValidation');
const userSchema = require('../apiSchema/userSchema');
const songSchema = require('../apiSchema/songSchema');
const tokenValidation = require('../middleware/tokenValidation');
const multer = require("multer");

const uploadCategories = multer({ dest: "./uploads/categories" });
const uploadSong = multer({ dest: "./uploads/songs" });
const uploadPlaylist = multer({ dest: "./uploads/playlist" });
var mutiUpload = uploadSong.fields([{name:"thumb_image"},{name:"media_file"}]);

router.post('/login',
  joiSchemaValidation.validateBody(userSchema.login),
  login
)

/////////   Category ////////////////
router.get(
  "/categories",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllcategories
);
router.post(
  "/categories",
  uploadCategories.single("file"),
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  insertCategory
);
router.patch(
  "/categories/:id",
  uploadCategories.single("file"),
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  updateCategory
);
router.delete(
  "/categories/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  deleteCategory
);
router.get(
  "/categories/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  singleCategoryDetails
); // secured

/////////   Songs  //////////
router.get(
  "/songs",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllSong
);
router.post(
  "/song",
  mutiUpload,
  joiSchemaValidation.validateBody(songSchema.insertSongSchema),
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  insertSong
);
router.delete(
  "/song/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  deleteSong
);

router.get(
  "/artists",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllartist
);

///////// Mood  Start /////////////////
router.get(
  "/mood",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllmood
);
router.get(
  "/mood/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  singleMoodDetails
);
router.post(
  "/mood",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  insertMood
);
router.patch(
  "/mood/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  updateMood
);
router.delete(
  "/mood/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  deleteMood
);
////////  Playlist //////////
router.get(
  "/playlist",
  tokenValidation.validateToken,
  tokenValidation._userAccess([
    "admin"
  ]),
  fetchAllplaylist
);
router.post(
  "/playlist",
  uploadPlaylist.single("file"),
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  insertPlaylist
);
router.delete(
  "/playlist/:id",
  tokenValidation.validateToken,
  tokenValidation._userAccess(["admin"]),
  deletePlaylist
);



module.exports = router;