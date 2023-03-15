const constants = require('../constants');
const adminService = require('../service/adminService');
const artistService = require('../service/artistService');
const categoryService = require('../service/categoryService');
const songService = require('../service/songService');
const playlistService = require('../service/playlistService');
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

module.exports.login = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    let _ip = ip.split(":");
    let IP = _ip[_ip.length - 1];
    req.body.IP = IP;

    const responseFromService = await adminService.login(req.body);
    if (responseFromService.status) {
      const token = jwt.sign(
        {
          id: responseFromService.data.id,
          user_type: responseFromService.data.user_type,
          email: responseFromService.data.email,
          name: responseFromService.data.name
        },
        process.env.SECRET_KEY || "dhaka-secret-key",
        {
          expiresIn: "30d",
        }
      );

      response.status = 200;
      response.message = constants.userMessage.LOGIN_SUCCESS;
      response.body = {
        name: responseFromService.data.name,
        role: responseFromService.data.user_type,
        token: token,
        id: responseFromService.data.id,
      };
      return res.status(response.status).send(response);
    } else {
      response.status = 400;
      response.message = responseFromService.message;
      return res.status(response.status).send(response);
    }
  } catch (error) {
    console.log('Something went wrong: Controller: login', error);
    response.message = error.message;
  }
  return res.status(response.status).send(response);
}
exports.fetchAllcategories = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
    let data;
    let search = {is_deleted:'n'};
    let categoryData = await categoryService.getAllCategory(search);
    data = categoryData.map((item) => {
      let obj = {
        img: `${process.env.MEDIA_PATH + "categories/"}${item.img}`,
        id: item.id,
        description:item.description,
        title:item.title,
        status:item.status,
        created:item.createdAt
      };
      return obj;
    });
    if (categoryData.length) {
      response.status = 200;
      response.body = data;
    }else {
      response.status = 202;
      response.message = `${constants.genericMessage.CATEGORY_NOT_FOUND}`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.insertCategory = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    if (!req.file) throw new ErrorHandler(`Please select an Image!!!`, "406")._errorManager();
    const { title, description,status,display_in_home } = req.body;
    let oldpath = req.file.path;
    let name = req.file.originalname.replace(/ /g, "_");
    let new_name = `${random}_${name}`;
    let img_path = `./uploads/categories/${new_name}`;
    fs.rename(oldpath, img_path, function (err) {
      if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    });
    let data = {
      img: new_name,
      title: title,
      description: description,
      status: status,
      is_deleted: "n",
      display_in_home:display_in_home
    };
    let banner = await categoryService.createCategory(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.CATEGORY_INSERTED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.updateCategory = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { title, description,status,display_in_home } = req.body;
    let data = {};
    if (req.file) {
      let oldpath = req.file.path;
      let name = req.file.originalname.replace(/ /g, "_");
      let new_name = `${random}_${name}`;
      let img_path = `./uploads/media/${new_name}`;
      fs.rename(oldpath, img_path, function (err) {
        if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
      });
      data["img"] = new_name;
    }
    data["title"] = title;
    data["description"] = description;
    data["status"] = status;
    data["display_in_home"] = display_in_home;
    let banner = await categoryService.updateCategory({ id: req.params.id, updateInfo: data });
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.CATEGORY_UPDATED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: updateCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deleteCategory = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await categoryService.getCategoryById({id: req.params.id});
    if (catogory && req.params.id) {
      let data = {is_deleted:'y'};
      await categoryService.updateCategory({ id: req.params.id, updateInfo: data });
      response.message = constants.genericMessage.CATEGORY_DELETED;
      response.status = 200;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deleteCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.singleCategoryDetails = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let items = [];
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let responseFromService = await categoryService.getCategoryById({ id: req.params.id });
    if (responseFromService) {
      responseFromService.img = `${process.env.MEDIA_PATH + "categories/"}${responseFromService.img}`,
      response.status = 200;
      response.message = constants.genericMessage.RESOURCE_FOUND;
      response.body = { data: responseFromService };
    } else {
      response.status = 202;
      response.message = constants.genericMessage.RESOURCE_NOT_FOUND;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: singleOrderDetailsForAdmin", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.fetchAllartist = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
    let data;
    let search = {is_deleted:'n'};
    let artistData = await artistService.getAllArtist(search);
    data = artistData.map((item) => {
      let obj = {
        img: `${process.env.MEDIA_PATH + "artists/"}${item.img}`,
        id: item.id,
        title:item.title
      };
      return obj;
    });
    if (artistData.length) {
      response.status = 200;
      response.body = data;
    }else {
      response.status = 202;
      response.message = `NO DATA FOUND`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.fetchAllmood = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
    let data;
    let search = {is_deleted:'n'};
    let artistData = await songService.getAllMood(search);
    data = artistData.map((item) => {
      let obj = {
        id: item.id,
        title:item.title,
        status:item.status,
        display_in_home:item.display_in_home
      };
      return obj;
    });
    if (artistData.length) {
      response.status = 200;
      response.body = data;
    }else {
      response.status = 202;
      response.message = `NO DATA FOUND`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.singleMoodDetails = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let items = [];
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let responseFromService = await songService.getMoodById({ id: req.params.id });
    if (responseFromService) {
      response.status = 200;
      response.message = constants.genericMessage.RESOURCE_FOUND;
      response.body = { data: responseFromService };
    } else {
      response.status = 202;
      response.message = constants.genericMessage.RESOURCE_NOT_FOUND;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: singleOrderDetailsForAdmin", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.insertMood = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission, title, status, display_in_home } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let data = {
      title: title,
      status: status,
      is_deleted: "n",
      display_in_home:display_in_home
    };
    let banner = await songService.createMood(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_INSERTED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertCategory", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.updateMood = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { title, status,display_in_home } = req.body;
    let data = {};
    data["title"] = title;
    data["status"] = status;
    data["display_in_home"] = display_in_home;
    let banner = await songService.updateMood({ id: req.params.id, updateInfo: data });
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_UPDATED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: updateMood", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deleteMood = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await songService.getMoodById({id: req.params.id});
    if (catogory && req.params.id) {
      let data = {is_deleted:'y'};
      await songService.updateMood({ id: req.params.id, updateInfo: data });
      response.message = constants.genericMessage.DATA_UPDATED;
      response.status = 200;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deleteMood", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};

exports.fetchAllplaylist = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
  
    let data;
    let search = {is_deleted:'n'};
    let categoryData = await playlistService.getAllPlaylist(search);
    data = categoryData.map((item) => {
      let obj = {
        img: `${process.env.MEDIA_PATH + "playlist/"}${item.img}`,
        id: item.id,
        title:item.title,
        status:item.status,
        created:item.createdAt,
        display_in_home_playlist:item.display_in_home_playlist,
      };
      return obj;
    });
    if (categoryData.length) {
      response.status = 200;
      response.body = data;
    }else {
      response.status = 202;
      response.message = `${constants.genericMessage.CATEGORY_NOT_FOUND}`;
    }
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: fetchAllcategories", error);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.insertPlaylist = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    let random = Math.floor(Math.random() * 10000000 + 1);
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    if (!req.file) throw new ErrorHandler(`Please select an Image!!!`, "406")._errorManager();
    let oldpath = req.file.path;
    let name = req.file.originalname.replace(/ /g, "_");
    let new_name = `${random}_${name}`;
    let img_path = `./uploads/playlist/${new_name}`;
    fs.rename(oldpath, img_path, function (err) {
      if (err) throw new ErrorHandler(`${err}`, "406")._errorManager();
    });
    let data = {
      img: new_name,
      title: req.body.title,
      mood: req.body.mood,
      category: req.body.category,
      songs: req.body.songs.split(","),
      status: req.body.status,
      is_deleted: "n",
      display_in_home_playlist:req.body.display_in_home_playlist
    };
    let banner = await playlistService.createPlaylist(data);
    if (banner) {
      response.status = 200;
      response.message = constants.genericMessage.DATA_INSERTED;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: insertPlaylist", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};
exports.deletePlaylist = async (req, res) => {
  let response = { ...constants.defaultServerResponse };
  try {
    if (!req.body) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();
    const { user_id, user_role, accessPermission } = req.body;
    if (!accessPermission) throw new ErrorHandler(`You are not authorised!!!`, "401")._errorManager();

    let catogory = await playlistService.getPlaylistById({id: req.params.id});
    if (catogory && req.params.id) {
     
      await playlistService.deletePlaylist({ id: req.params.id });
      response.message = constants.genericMessage.DATA_UPDATED;
      response.status = 200;
    } else throw new ErrorHandler(`${constants.genericMessage.TRY_AGAIN}`, "406")._errorManager();
  } catch (error) {
    response.status = error.status ? error.status : "500";
    console.log("Something went wrong: Controller: deletePlaylist", error.message);
    response.message = ["401", "406"].includes(error.status) ? error.message : "Sorry, an unexpected error has occurred";
  }
  return res.status(response.status).send(response);
};