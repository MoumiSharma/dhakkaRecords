const Songs = require('../database/models/songModel');
const Mood = require('../database/models/moodModel');
const { formatMongoData, checkObjectId } = require('../helper/dbHelper');
const constants = require('../constants');

module.exports.createSongs = async (serviceData) => {
  try {
    let song = new Songs({ ...serviceData });
    let result = await song.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: createSongs', error);
    return new Error(error);
  }
}

module.exports.getAllSongs = async (find) => {
  try {
    //let find = {};
    console.log(find)
    let items = await Songs.find(find);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllSongss', error);
    return new Error(error);
  }
}
module.exports.getSongsList = async ({skip=0,limit=10}) => {
  try {
    let find = { is_deleted:"n",status:"active" };

    let songs = await Songs.find(find).limit(limit).sort({_id:-1});
    return formatMongoData(songs);
  } catch (error) {
    console.log('Something went wrong: Service: getAllSongss', error);
    return new Error(error);
  }
}


module.exports.getSongsById = async ({id}) => {
  try {
    //checkObjectId(id);
    let song = await Songs.findById(id);
    if (!song) {
      return new Error(constants.genericMessage.SONG_NOT_FOUND);
    }
    return formatMongoData(song);
  } catch (error) {
    console.log('Something went wrong: Service: getSongsById', error);
    return new Error(error);
  }
}

module.exports.updateSongs = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let song = await Songs.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true,useFindAndModify: false }
    )
    if (!song) {
      return new Error(constants.SongsMessage.Songs_NOT_FOUND);
    }
    return formatMongoData(song);
  } catch (error) {
    console.log('Something went wrong: Service: updateSongs', error);
    return new Error(error);
  }
}

module.exports.searchSongs = async (searchdata) => {
  try {
    let Songs = await Songs.findOne(searchdata);
    if(Songs){
      return formatMongoData(Songs);
    }else{
      return false;
    }
  } catch (error) {
    console.log('Something went wrong: Service: searchSongs', error);
    throw new Error(error);
  }
}
module.exports.getAllMood = async (find) => {
  try {
    //let find = {};
    let items = await Mood.find(find);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllArtists', error);
    return new Error(error);
  }
}
module.exports.getMoodById = async ({id}) => {
  try {
    //checkObjectId(id);
    let product_type = await Mood.findById(id);
    if (!product_type) {
      return new Error(constants.genericMessage.RESOURCE_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: getCategoryById', error);
    return new Error(error);
  }
}
module.exports.createMood = async (serviceData) => {
  try {    
    let data = new Mood({ ...serviceData });
    let result = await data.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: createMood', error);
    return new Error(error);
  }
}
module.exports.updateMood = async ({ id, updateInfo }) => {
  try {

    checkObjectId(id);
    let findData = await Mood.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true,useFindAndModify: false }
    )
    if (!findData) {
      return new Error(constants.genericMessage.RESOURCE_NOT_FOUND);
    }
    return formatMongoData(findData);
  } catch (error) {
    console.log('Something went wrong: Service: updateCategory', error);
    return new Error(error);
  }
}