const Artist = require('../database/models/artistModel');
const { formatMongoData, checkObjectId } = require('../helper/dbHelper');
const constants = require('../constants');

module.exports.createArtist = async (serviceData) => {
  try {
    let product_type = new Artist({ ...serviceData });
    let result = await product_type.save();
    return formatMongoData(result);
  } catch (error) {
    console.log('Something went wrong: Service: createArtist', error);
    return new Error(error);
  }
}

module.exports.getAllArtist = async (find) => {
  try {
    //let find = {};
    let items = await Artist.find(find);
    return formatMongoData(items);
  } catch (error) {
    console.log('Something went wrong: Service: getAllArtists', error);
    return new Error(error);
  }
}
module.exports.getArtistList = async () => {
  try {
    let product_types = await Artist.find({});
    return formatMongoData(product_types);
  } catch (error) {
    console.log('Something went wrong: Service: getAllArtists', error);
    return new Error(error);
  }
}


module.exports.getArtistById = async ({id}) => {
  try {
    //checkObjectId(id);
    let product_type = await Artist.findById(id);
    if (!product_type) {
      return new Error(constants.ArtistMessage.Artist_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: getArtistById', error);
    return new Error(error);
  }
}

module.exports.updateArtist = async ({ id, updateInfo }) => {
  try {
    checkObjectId(id);
    let product_type = await Artist.findOneAndUpdate(
      { _id: id },
      updateInfo,
      { new: true }
    )
    if (!product_type) {
      return new Error(constants.ArtistMessage.Artist_NOT_FOUND);
    }
    return formatMongoData(product_type);
  } catch (error) {
    console.log('Something went wrong: Service: updateArtist', error);
    return new Error(error);
  }
}

module.exports.searchArtist = async (searchdata) => {
  try {
    let Artist = await Artist.findOne(searchdata);
    if(Artist){
      return formatMongoData(Artist);
    }else{
      return false;
    }
  } catch (error) {
    console.log('Something went wrong: Service: searchArtist', error);
    throw new Error(error);
  }
}