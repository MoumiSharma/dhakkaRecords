const constants = require('../constants');
const userService = require('../service/userService');
const songService = require("../service/songService");
const artistService = require("../service/artistService");
var SoxCommand = require('sox-audio');
var TimeFormat = SoxCommand.TimeFormat;
var sox = require('sox');
const axios = require("axios");
const fs = require("fs");
const jwt = require("jsonwebtoken");

module.exports.sendOtp = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    const getData = async (trackingConfig) => {
      //console.log(trackingConfig);
      try {
        const response = await axios(trackingConfig);

        let res = { status: true, data: response.data.message };
        return res;
      } catch (error) {
        var message = "";
        for (let i in error.response.data) {
          message += (message ? ", " : "") + JSON.stringify(error.response.data[i]);
        }
        let res = { status: false, data: message };
        return res;
      }
    };

    const responseFromService = await userService.loginByOtp(req.body);

    if (responseFromService && responseFromService.status) {
      response.status = 200;
      response.message = constants.userMessage.OTP_SENT;
      //console.log(httpResponse.body.message);
      return res.status(response.status).send(response);
    } else {
      response.status = 203;
      response.message = responseFromService.message;
      return res.status(response.status).send(response);
    }
  } catch (error) {
    console.log("Something went wrong: Controller: login", error);
    response.message = error.message;
    return res.status(400).send(response);
  }
};
module.exports.otpValidation = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    const responseFromService = await userService.otpValidation(req.body);
    if (responseFromService) {
      if(responseFromService.status){
        response.status = 200;
        response.message = constants.userMessage.VALID_OTP;
        response.body = responseFromService;
      }else{
        response.status = 202;
        response.message = constants.userMessage.VALID_OTP;
        response.body = responseFromService;
      }
    } else {
      response.status = 203;
      response.message = constants.userMessage.INVALID_OTP;
    }
  } catch (error) {
    response.status = 400;
    console.log("Something went wrong: Controller: login", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};
module.exports.socialLogin = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    const responseFromService = await userService.socialLogin(req.body);
    if (responseFromService.status) {
      response.status = 200;
      response.message = constants.userMessage.LOGIN_SUCCESS;
      response.body = responseFromService;
    } else {
      response.status = 202;
      response.body = responseFromService;
    }
  } catch (error) {
    response.status = 400;
    console.log("Something went wrong: Controller: login", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

module.exports.signup = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if(req.file){
      var filePath = '';
      var oldpath = req.file.path;
      var random_number = Math.floor((Math.random() * 10000000000) + 1);
      var file_name = random_number + "_" + req.file.originalname;
      filePath = process.env.PHYSICAL_MEDIA_PATH + 'profile_pic/' + file_name;
      // filePath = './uploads/' + random_number + "_" + req.file.originalname;
      fs.rename(oldpath, filePath, function (err) {
        if (err) throw err;
      });
      req.body.profile_pic = file_name;
    }else{
      req.body.profile_pic = "";
    }
    const responseFromService = await userService.signup(req.body);
    if (responseFromService.status) {
      response.status = 200;
      response.message = constants.userMessage.SIGNUP_SUCCESS;
      response.body = responseFromService;
    } else {
      response.status = 203;
      response.message = responseFromService.message;
    }
  } catch (error) {
    console.log('Something went wrong: Controller: signup', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
}

module.exports.login = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    const responseFromService = await userService.login(req.body);
    if(responseFromService.status){
      response.status = 200;
      response.message = constants.userMessage.LOGIN_SUCCESS;
      response.body = responseFromService;
    }else{
      response.status = 202;
      response.body = { status:false,message: constants.userMessage.USER_NOT_FOUND}
    }
   
  } catch (error) {
    console.log('Something went wrong: Controller: login', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
}
module.exports.addtoFavourite = async (req, res) => {
  
  let response = { ...constants.defaultServerResponse };
  try {

    let songDetails = await songService.getSongsById({id:req.body.song_id});

    if (req.headers.authorization) {
     if (req.body.user_id) {
        if (!songDetails.id) {
            response.status = 202;
            response.message =constants.genericMessage.INVALID_SONG_REQUEST;
        }else{
          const wishlist = await userService.findWishList({
            song_id: songDetails.id,
            user_id: req.body.user_id
          });

          if (!wishlist.length) {
            await userService.insertWishList({
              song_id: req.body.song_id,
              user_id: req.body.user_id,
              is_deleted: "0",
            });
            response.status = 200;
            response.message =constants.genericMessage.WISHLISTED;
          
          } else {
            response.status = 202;
            response.message =constants.genericMessage.ALLREADY_WISHLISTED;
          }
        }
      }
    }
  } catch (error) {
    console.log("Something went wrong: Controller: getProductById", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};
exports.deleteFavourite = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    
    let song = await userService.findWishList({
      id: req.params.id,
      user_id: req.body.user_id
    });
    
    if (song && song.length) {
      await userService.deleteWishlist({ id: req.params.id });
      response.message = constants.genericMessage.WISHLIST_DELETED;
      response.status = 200;
    }
    else { 
      response.status = 202;
      response.message = constants.genericMessage.INVALID_REQUEST; 
    }
  } catch (error) {
    // response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deleteCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.getFavouriteList = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
   
    let favouriteData = await userService.findWishList({user_id:req.body.user_id});
    let favouriteList = [];
    if (favouriteData.length) {
      for (let i in favouriteData) {
        if (favouriteData[i].song_id.thumb_img) {
          favouriteData[i].song_id.thumb_img = process.env.MEDIA_PATH + "songs/thumb_image/" + favouriteData[i].song_id.thumb_img;
        }
        if (favouriteData[i].song_id.media_file) {
          favouriteData[i].song_id.media_file = process.env.MEDIA_PATH + "songs/" + favouriteData[i].song_id.media_file;
        }
        let songArtist = favouriteData[i].song_id.artists;
        let artist_name = [];
        for(artist of songArtist){
          let getArtist = await artistService.getArtistById({id:artist});
          artist_name.push(getArtist.title);
        }

        favouriteList.push({
          "id":favouriteData[i].id,
          "song_id":favouriteData[i].song_id.id,
          "playCount": favouriteData[i].song_id.playCount,
          "downloadCount": favouriteData[i].song_id.downloadCount,
          "title": favouriteData[i].song_id.title,
          "description": favouriteData[i].song_id.description,
          "thumb_img": favouriteData[i].song_id.thumb_img,
          "media_file": favouriteData[i].song_id.media_file,
          "artist":artist_name.toString()
        })
      }

      response.status = 200;
      response.body = favouriteList;
    }else {
      response.status = 202;
      response.message = `NO DATA FOUND`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: getFavouriteList", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
module.exports.combine = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    sox.identify('./uploads/file_example_WAV_1MG.wav', function(err, results) {
      console.log(err);
    });
    // var startTimeFormatted = TimeFormat.formatTimeAbsolute(5);
    // var endTimeFormatted = TimeFormat.formatTimeRelativeToEnd(10);
    // var command = SoxCommand();
    // var trimFirstFileSubCommand = SoxCommand()
    // .input('./uploads/file_example_WAV_1MG.wav')
    // .output('-p')
    // .outputFileType('wav')
    // .trim(startTimeFormatted);

    // var trimLastFileSubCommand = SoxCommand()
    // .input('./uploads/file_example_WAV_2MG.wav')
    // .output('-p')
    // .outputFileType('wav')
    // .trim(0, endTimeFormatted);
    // console.log("Coming");

    // command.inputSubCommand(trimFirstFileSubCommand)
    // .input('./uploads/file_example_WAV_1MG.wav')
    // .inputSubCommand(trimLastFileSubCommand)
    //   .output("./uploads/test.wav")
    //   .concat();

    //   command.run();




    response.status = 200;
    response.message = constants.userMessage.SIGNUP_SUCCESS;
    //response.body = responseFromService;
  } catch (error) {
    console.log('Something went wrong: Controller: signup', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
}
module.exports.createPlaylist = async (req, res) => {
  
  let response = { ...constants.defaultServerResponse };
  let random = Math.floor(Math.random() * 10000000 + 1);
  try {
    if (req.headers.authorization) {
     if (req.body.user_id) {
        let thumb_image = "";
        if(req.file){
          let oldpath = req.file.path;
          let name = req.file.originalname.replace(/ /g, "_");
          thumb_image = `${random}_${name}`;
          let img_path = `./uploads/playlist/${thumb_image}`;
          fs.rename(oldpath, img_path, function (err) {
            if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
          });
        }

       let responseFromService = await userService.playlistcreate({ id: req.body.user_id, title: req.body.title, image: thumb_image })
       console.log(responseFromService)
        if(responseFromService.status){
          response.status = 200;
          response.message =responseFromService.message;
        }else{
          response.status = 203;
          response.message =responseFromService.message;
        }
      }
    }
  } catch (error) {
    console.log("Something went wrong: Controller: getProductById", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};

exports.fetchPlaylist = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
   
    var playlist = await userService.fetchPlaylist({ id: req.body.user_id })
    let userPlaylist = [];
    for (list of playlist) {
      let count = await userService.countPlaylistSong({ id: list.id });
      userPlaylist.push({
        image: list.image?`${process.env.MEDIA_PATH + "/playlist/"}${list.image}`:'',
        title: list.title,
        id: list.id,
        song_count:count
      })
    }
   
    if (userPlaylist.length) {
      response.status = 200;
      response.body = userPlaylist;
    } else {
      response.status = 202;
      response.message = `NO DATA FOUND`;
    }


  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: getFavouriteList", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deletePlaylist = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    
    let findData = await userService.findPlayList({
      id: req.params.id,
      user_id: req.body.user_id
    });
    
    if (findData && findData.length) {
      await userService.deletePlaylist({ id: req.params.id });
      response.message = "Playlist Deleted";
      response.status = 200;
    }
    else { 
      response.status = 202;
      response.message = constants.genericMessage.INVALID_REQUEST; 
    }
  } catch (error) {
    // response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deleteCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
module.exports.addPlaylistSong = async (req, res) => {
  
  let response = { ...constants.defaultServerResponse };
  let random = Math.floor(Math.random() * 10000000 + 1);
  try {
    if (req.headers.authorization) {
     if (req.body.user_id) {
        let responseFromService = await userService.addplaylistSong({user_id: req.body.user_id, playlist_id: req.body.playlist_id,  songs:req.body.songs})
        if(responseFromService.status){
          response.status = 200;
          response.message =responseFromService.message;
        }else{
          response.status = 203;
          response.message =responseFromService.message;
        }
      }
    }
  } catch (error) {
    console.log("Something went wrong: Controller: getProductById", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};


module.exports.removePlaylistSong = async (req, res) => {
  
  let response = { ...constants.defaultServerResponse };
  let random = Math.floor(Math.random() * 10000000 + 1);
  try {
   
    if (req.headers.authorization) {
    
     if (req.body.user_id) {
       let responseFromService = await userService.removeplaylistSong({ user_id: req.body.user_id, playlist_id: req.body.playlist_id, songs: req.body.songs })
       console.log(responseFromService)
        if(responseFromService.status){
          response.status = 200;
          response.message =responseFromService.message;
        }else{
          response.status = 202;
          response.message =responseFromService.message;
        }
      }
    }
  } catch (error) {
    console.log("Something went wrong: Controller: removePlaylistSong", error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
};


exports.updatePlaylistSong = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
  
    if (req.headers.authorization) {
    
      if (req.body.user_id) {
        let random = Math.floor(Math.random() * 10000000 + 1);
       
        const title = req.body.title;
        let data = {};
        if (req.file) {
          let oldpath = req.file.path;
          let name = req.file.originalname.replace(/ /g, "_");
          let new_name = `${random}_${name}`;
          let img_path = `./uploads/media/${new_name}`;
          fs.rename(oldpath, img_path, function (err) {
            if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
          });
          data["image"] = name;
        }
        if (req.body.title) {
          data["title"] = title;
        }
        let banner = await userService.updatePlaylist({ id: req.params.id, data });
        console.log(banner)
        if (banner) {
          response.status = 200;
          response.message = "Playlist updated";
        } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
      }
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: updateCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};


exports.playlistDetails = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
  
    if (req.headers.authorization) {
    
      if (req.body.user_id) {
        let banner = await userService.playlistDetails({ id: req.params.id })
        for (var playlist of banner) {
          let playlistSong = playlist.song_id
          let recentPlay = [];
          const recentPlaySong = await userService.getSongsList({ id:playlistSong });
          for (let i in recentPlaySong) {
            if (recentPlaySong[i].thumb_img) {
              recentPlaySong[i].thumb_img = process.env.MEDIA_PATH + "songs/thumb_image/" + recentPlaySong[i].thumb_img;
            }
            if (recentPlaySong[i].media_file) {
              recentPlaySong[i].media_file = process.env.MEDIA_PATH + "songs/" + recentPlaySong[i].media_file;
            }
            let songArtist = recentPlaySong[i].artists;
         
            let artist_name = [];
            for (artist of songArtist) {
              let getArtist = await userService.getArtist( artist );
              console.log(getArtist)
              artist_name.push(getArtist.title);
            }
    
            recentPlay.push({
              "id":recentPlaySong[i].id,
              "playCount": recentPlaySong[i].playCount,
              "downloadCount": recentPlaySong[i].downloadCount,
              "title": recentPlaySong[i].title,
              "description": recentPlaySong[i].description,
              "thumb_img": recentPlaySong[i].thumb_img,
              "media_file": recentPlaySong[i].media_file,
              "artist":artist_name.toString()
            })
         
      
      
          response.status = 200;
          response.message = "Playlist song fetched";
            response.body = recentPlay
          }
        }
        } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
      }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: updateCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};