const Playlist = require('../database/models/playlistModel');
const { formatMongoData, checkObjectId } = require('../helper/dbHelper');
const constants = require('../constants');

module.exports.createPlaylist = async (serviceData) => {
  try {
    let product_type = new Playlist({ ...serviceData });
    let result = await product_type.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: createPlaylist', error);
    return new Error(error);
  }
}

module.exports.getAllPlaylist = async (find) => {
  try {
    //let find = {};
    let items = await Playlist.find(find);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllPlaylists', error);
    return new Error(error);
  }
}
module.exports.getPlaylistList = async () => {
  try {
    let product_types = await Playlist.find({});
    return formatMongoData(product_types);
  } catch (error) {
    console.log('Something went wrong: Service: getAllPlaylists', error);
    return new Error(error);
  }
}


module.exports.getPlaylistById = async ({id}) => {
  try {
    //checkObjectId(id);
    let product_type = await Playlist.findById(id);
    if (!product_type) {
      return new Error(constants.PlaylistMessage.PLAYLIST_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: getPlaylistById', error);
    return new Error(error);
  }
}

module.exports.updatePlaylist = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let product_type = await Playlist.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true }
    )
    if (!product_type) {
      return new Error(constants.PlaylistMessage.PLAYLIST_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: updatePlaylist', error);
    return new Error(error);
  }
}

module.exports.searchPlaylist = async (searchdata) => {
  try {
    let Playlist = await Playlist.findOne(searchdata);
    if(Playlist){
      return formatMongoData(Playlist);
    }else{
      return false;
    }
  } catch (error) {
    console.log('Something went wrong: Service: searchPlaylist', error);
    throw new Error(error);
  }
}
exports.deletePlaylist = async ({ id }) => {
  try {
    await Playlist.deleteOne({ _id: id });
    return true;
  } catch (error) {
    console.log('Something went wrong: Service: deleteImages', error.stack);
    throw new Error(error.stack);
  }
};