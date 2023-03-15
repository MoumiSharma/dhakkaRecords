const constants = require('../constants');
const userService = require('../service/userService');
const songService = require('../service/songService');
const artistService = require("../service/artistService");
const categoryService = require('../service/categoryService');
const jwt = require("jsonwebtoken");
const fs = require("fs");

class ErrorHandler extends Error {
  constructor(msg, status) {
    super(msg, status);
    this.name = msg ? msg : "FancyError";
    this.status = status ? status : "500";
  }
  _errorManager() {
    return { message: this.name, status: this.status };
  }
}

exports.fetchAllSong = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { mood, category } = req.query;

    let data;
    let search = {is_deleted:'n'};
    if (mood) search["mood"] = mood;
    if (category) search["categories"] = { $in : [category] };

    let songData = await songService.getAllSongs(search);
    let songs = [];
    for (let i in songData) {
      if (songData[i].thumb_img) {
        songData[i].thumb_img = process.env.MEDIA_PATH + "songs/thumb_image/" + songData[i].thumb_img;
      }
      if (songData[i].media_file) {
        songData[i].media_file = process.env.MEDIA_PATH + "songs/" + songData[i].media_file;
      }
      let songArtist = songData[i].artists;
      let artist_name = [];
      for(artist of songArtist){
        let getArtist = await artistService.getArtistById({id:artist});
        artist_name.push(getArtist.title);
      }

      songs.push({
        "id":songData[i].id,
        "playCount": songData[i].playCount,
        "downloadCount": songData[i].downloadCount,
        "title": songData[i].title,
        "description": songData[i].description,
        "thumb_img": songData[i].thumb_img,
        "media_file": songData[i].media_file,
        "artist":artist_name.toString(),
        "status":songData[i].status,
        "createdAt":songData[i].createdAt
      })
    }
    
    if (songs.length) {
      response.status = 200;
      response.body = songs;
    }else {
      response.status = 202;
      response.message = `${constants.genericMessage.SONG_NOT_FOUND}`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.insertSong = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    if (!req.files.thumb_image) throw new ErrorHandler(`Please select an Image!!!`, "406")._errorManager();
    if (!req.files.media_file) throw new ErrorHandler(`Please select media file!!!`, "406")._errorManager();

    //const { title, description,status,display_in_home,categories,artists } = req.body;

    let oldpath = req.files.thumb_image[0].path;
    let name = req.files.thumb_image[0].originalname.replace(/ /g, "_");
    let new_name = `${random}_${name}`;
    let img_path = `./uploads/songs/thumb_image/${new_name}`;
    fs.rename(oldpath, img_path, function (err) {
      if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    });

    let oldpathSong = req.files.media_file[0].path;
    let song_name = req.files.media_file[0].originalname.replace(/ /g, "_");
    let new_song_name = `${random}_${song_name}`;
    let song_path = `./uploads/songs/${new_song_name}`;
    fs.rename(oldpathSong, song_path, function (err) {
      if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    });

    let data = {
      title: req.body.title,
      description:req.body.description,
      lyricist:req.body.lyricist,
      composer:req.body.composer,
      album_movie_name:req.body.album_movie_name,
      star_cast:req.body.star_cast,
      director:req.body.director,
      track_language:req.body.track_language,
      releasing_year:req.body.releasing_year,
      thumb_img: new_name,
      media_file: new_song_name,
      categories:req.body.categories.split(","),
      artists:req.body.artists.split(","),
      mood:req.body.mood,
      event:req.body.event_name,
      music_label:req.body.music_label,
      status: req.body.status,
      is_deleted: "n"
    };
    let banner = await songService.createSongs(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.SONG_INSERTED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertSong", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

// exports.updateCategory = async (req, res) => {
//   let response = { ...constants.defaultServerResponse };
//   try {
//     let random = Math.floor(Math.random() * 10000000 + 1);
//     if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
//     const { user_id, user_role, accessPermission } = req.body;
//     if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
//     const { title, description,status } = req.body;
//     let data = {};
//     if (req.file) {
//       let oldpath = req.file.path;
//       let name = req.file.originalname.replace(/ /g, "_");
//       let new_name = `${random}_${name}`;
//       let img_path = `./uploads/media/${new_name}`;
//       fs.rename(oldpath, img_path, function (err) {
//         if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
//       });
//       data["img"] = new_name;
//     }
//     data["title"] = title;
//     data["description"] = description;
//     data["status"] = status;
//     let banner = await categoryService.updateCategory({ id: req.params.id, updateInfo: data });
//     if (banner) {
//       response.status = 200;
//       response.message = constants.genericMessage.CATEGORY_UPDATED;
//     } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
//   } catch (error) {
//     response.status = error.status ? error.status : "500";
//     console.log("Something went wrong: Controller: updateCategory", error.message);
//     response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
//   }
//   return res.status(response.status).send(response);
// };
exports.deleteSong = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
      if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
      const { user_id, user_role, accessPermission } = req.body;
      if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
      let catogory = await songService.getSongsById({id: req.params.id});
      if (catogory && req.params.id) {
        let data = {is_deleted:'y',updated_by:user_id};
        await songService.updateSongs({ id: req.params.id, updateInfo: data });
        response.message = constants.genericMessage.SONG_DELETED;
        response.status = 200;
      } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
    } catch (error) {
      response.status = error.status ? error.status : "500";
      console.log("Something went wrong: Controller: deleteCategory", error.message);
      response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
    }
    return res.status(response.status).send(response);
};
module.exports.getSongById = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
      var responseFromService = await songService.getSongsById(req.params);

      if (responseFromService.thumb_img) {
        responseFromService.thumb_img = process.env.MEDIA_PATH + "songs/thumb_image/" + responseFromService.thumb_img;
      }
      if (responseFromService.media_file) {
        responseFromService.media_file = process.env.MEDIA_PATH + "songs/" + responseFromService.media_file;
      }


      let songArtist = responseFromService.artists;
      let artist_name = [];
      for(artist of songArtist){
        let getArtist = await artistService.getArtistById({id:artist});
        artist_name.push({"name":getArtist.title,"id":artist});
      }
  
      responseFromService.artist = artist_name;
      responseFromService.wishlisted = false;
      var decoded_user_id = "";
      if (req.headers.authorization) {
        const token = req.headers.authorization.split("Bearer")[1].trim();
        const decoded = jwt.verify(token, process.env.SECRET_KEY || "my-secret-key");
        if (decoded.id) {
          decoded_user_id = decoded.id;
          const wishlist = await userService.getWishListBySongIdUserId({ user_id: decoded.id, song_id: responseFromService.id });
          if (wishlist) {
            responseFromService.wishlisted = true;
          }
        }
      }
  
      response.status = 200;
      response.message = constants.genericMessage.SONG_FETCHED;
      response.body = responseFromService;
    } catch (error) {
      console.log("Something went wrong: Controller: getProductById", error);
      response.message = error.message;
    }
    return res.status(response.status).send(response);
  };