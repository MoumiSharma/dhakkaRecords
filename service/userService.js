const User = require('../database/models/userModel');
const constants = require('../constants');
const { formatMongoData, checkObjectId } = require('../helper/dbHelper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var otpGenerator = require("otp-generator");
const CustomerOtp = require("../database/models/customerOtp");
const Customer = require("../database/models/customerModel");
const Wishlist = require('../database/models/wishlistModel');
const userplaylistModel = require('../database/models/userplaylistModel');
const playlistSongModel = require('../database/models/playlistSongModel');
const Songs = require('../database/models/songModel');
const Artist = require('../database/models/artistModel');

var moment = require("moment");
function changeTimezone(date, ianatz) {
  var invdate = new Date(
    date.toLocaleString("en-US", {
      timeZone: ianatz,
    })
  );
  return invdate;
}

module.exports.loginByOtp = async ({ mobile="", email="" }) => {
  try {
    if(!email && !mobile){
      return { status: false, message: "Email/Mobile number is required" };
    }

    if(mobile){
      mobile = "880"+mobile.slice(-10)
    }
    var there = new Date();
    //var otp_code = otpGenerator.generate(6, { upperCase: false, specialChars: false, alphabets: false });
    var otp_code = "1234";

    var updateData = {
      mobile: mobile,
      otp_code: otp_code,
      email: email,
      is_active: "1",
      is_verified: "0",
    };
    //Delete Previous OTP
    if(mobile){
      var customerOtp = await CustomerOtp.findOne({ mobile });
      if (customerOtp) {
        await CustomerOtp.deleteMany({ mobile });
      }
    }
    if(email){
      var customerOtp = await CustomerOtp.findOne({ email });
      if (customerOtp) {
        await CustomerOtp.deleteMany({ email });
      }
    }
    var newCustomerOtp = new CustomerOtp(updateData);
    await newCustomerOtp.save();

    return { status: true, message: "success", data: updateData };
  } catch (error) {
    console.log("Something went wrong: Service: login", error);
    // throw new Error(error);
    return { status: false, message: error };
  }
};
module.exports.otpValidation = async ({
  mobile,
  otp_code,
  email
}) => {
  try {
    if(!email && !mobile){
      return { status: false, message: "Email/Mobile number is required" };
    }
    //checkObjectId(id);
    let find = {otp_code:otp_code, is_active: "1"};
    if(mobile){
      mobile = "880"+mobile.slice(-10);
      find['mobile'] = mobile;
    }
    if(email){
      find['email'] = email;
    }

    const user = await CustomerOtp.findOne(find);
    if (!user) {
      return false;
    }
    var a = moment(user.createdAt); //now
    var b = moment();
    var minutes = b.diff(a, "minutes");
    console.log(minutes); // 44700
    if (minutes > 10) {
      return false;
    }

    await CustomerOtp.findOneAndUpdate(
      { _id: user.id },
      { is_active: "0", is_verified: "1" },
      { new: true, useFindAndModify: false }
    );
    // E.g.
    var there = new Date();
    var date_ob = changeTimezone(there, "Asia/Kolkata");
    var customer;
    if(mobile){
      customer = await Customer.findOne({ mobile });
    }else{
      customer = await Customer.findOne({ email });
    }

    if(customer){
      var updateData = { last_login: date_ob.toISOString() };
      await Customer.findOneAndUpdate({ _id: customer.id }, updateData, { new: true, useFindAndModify: false });
      let profile_pic = process.env.MEDIA_PATH+"deault_image.jpg";
      if(customer.profile_pic && customer.profile_pic!=""){
        if(customer.profile_pic.includes('http')){
          profile_pic = customer.profile_pic;
        }else{
          profile_pic = process.env.MEDIA_PATH+"profile_pic/"+customer.profile_pic;
        }
      }
      let user_data = { name: customer.name,subscription_status:customer.subscription_status, gender: customer.gender, profile_pic: profile_pic  };

      let user_id = customer.id;
      const token = jwt.sign({ id: customer.id, name: customer.name, user_type: "frontend_user" }, process.env.SECRET_KEY || "my-secret-key", { expiresIn: "1y" });
      return { status: true, token, user_id, user_data };
    }else{
      return { status: false, message: "User Not found" };
    }
  } catch (error) {
    console.log("Something went wrong: Service: login", error);
    throw new Error(error);
  }
};
module.exports.socialLogin = async ({
  email
}) => {
  try {
    let find = {};
    
    if(email){
      find['email'] = email;
    }
    // E.g.
    var there = new Date();
    var date_ob = changeTimezone(there, "Asia/Kolkata");
    var customer = await Customer.findOne({ email });

    if(customer){
      var updateData = { last_login: date_ob.toISOString() };
      await Customer.findOneAndUpdate({ _id: customer.id }, updateData, { new: true, useFindAndModify: false });

      let profile_pic = process.env.MEDIA_PATH+"deault_image.jpg";
      if(customer.profile_pic && customer.profile_pic!=""){
        if(customer.profile_pic.includes('http')){
          profile_pic = customer.profile_pic;
        }else{
          profile_pic = process.env.MEDIA_PATH+"profile_pic/"+customer.profile_pic;
        }
      }
      let user_data = { name: customer.name,subscription_status:customer.subscription_status, gender: customer.gender, profile_pic: profile_pic  };

      let user_id = customer.id;
      const token = jwt.sign({ id: customer.id, name: customer.name, user_type: "frontend_user" }, process.env.SECRET_KEY || "my-secret-key", { expiresIn: "1y" });
      return { status: true, token, user_id, user_data };
    }else{
      return { status: false, message: "User Not found" };
    }
  } catch (error) {
    console.log("Something went wrong: Service: login", error);
    throw new Error(error);
  }
};
module.exports.signup = async ({
  email = '',
  mobile = '',
  password = '',
  name,
  country,
  dob, 
  gender ,
  profile_pic = '',
  social_image = '',
  login_source = ''
 }) => {
  try {
    if(!email && !mobile){
      return { status: false, message: "Email/Mobile number is required" };
    }

    if(email){
      let customer = await Customer.findOne({ email });
      if(customer){
        return { status: false, message: "Email id already exists" };
      }
    }

    if(mobile){
      mobile = "880"+mobile.slice(-10);
      let customer = await Customer.findOne({ mobile });
      if(customer){
        return { status: false, message: "Mobile already exists" };
      }
    }
    var there = new Date();
    var date_ob = changeTimezone(there, "Asia/Kolkata");

    if(password){
      const saltRounds = 12;
      password = await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function(err, hash) {
          if (err) reject(err)
          resolve(hash)
        });
      })

    }

    let insertData = {
      name :  name, 
      dob :  dob, 
      mobile :  mobile, 
      email :  email, 
      password : password,
      gender : gender, 
      country: country,
      profile_pic : social_image?social_image:profile_pic,
      profile_completed_flg : true,
      last_login: date_ob.toISOString(),
      login_source : login_source
    };

    const newCustomer = new Customer(insertData);
    var result = await newCustomer.save();
    if (result) {
      let profile_pic = process.env.MEDIA_PATH+"deault_image.jpg";
      if(result.profile_pic && result.profile_pic!=""){
        if(result.profile_pic.includes('http')){
          profile_pic = result.profile_pic;
        }else{
          profile_pic = process.env.MEDIA_PATH+"profile_pic/"+result.profile_pic;
        }
      }
      let user_data = { name: result.name,subscription_status:result.subscription_status, gender: result.gender, profile_pic: profile_pic  };

      let user_id = result.id;
      const token = jwt.sign({ id: result.id, name: result.name, user_type: "frontend_user" }, process.env.SECRET_KEY || "my-secret-key", { expiresIn: "1y" });
      return { status: true, token, user_id, user_data };
    }else{
      return { status: false, message: "Something went wrong. Please try again later" };
    }
  } catch (error) {
    console.log('Something went wrong: Service: signup', error);
    throw new Error(error);
  }
}

module.exports.login = async ({ email, password }) => {
  try {
    const user = await Customer.findOne({ email });
    if (!user || !user.password) {
      return new Error(constants.userMessage.USER_NOT_FOUND);
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return new Error(constants.userMessage.INVALID_PASSWORD);
    }
    let profile_pic = process.env.MEDIA_PATH+"deault_image.jpg";
      if(user.profile_pic && user.profile_pic!=""){
        if(user.profile_pic.includes('http')){
          profile_pic = user.profile_pic;
        }else{
          profile_pic = process.env.MEDIA_PATH+"profile_pic/"+user.profile_pic;
        }
      }
    let user_data = { name: user.name,subscription_status:user.subscription_status, gender: user.gender, profile_pic: profile_pic  };

    let user_id = user.id;
    const token = jwt.sign({ id: user.id, name: user.name, user_type: "frontend_user" }, process.env.SECRET_KEY || "my-secret-key", { expiresIn: "1y" });
    return { status: true, token, user_id, user_data };
  } catch (error) {
    console.log('Something went wrong: Service: login', error);
    throw new Error(error);
  }

}

module.exports.findWishList = async ({ id, user_id, song_id }) => {
  try {
    let find = {is_deleted: "0"}
    if(user_id){
      find['user_id'] = user_id;
    }
    if(song_id){
      find['song_id'] = song_id;
    }
    if(id){
      find['_id'] = id;
    }
    let wishlists = await Wishlist.find(find).populate({ path: "song_id", select: ["title", "thumb_image", "artists", "playCount", "downloadCount", "description", "thumb_img", "media_file"] });
    return formatMongoData(wishlists);
  } catch (error) {
    console.log("Something went wrong: Service: getWishlist", error);
    throw new Error(error);
  }
};
module.exports.insertWishList = async ({ ...serviceData }) => {
  try {
    let log = new Wishlist({ ...serviceData });
    let result = await log.save();
    return formatMongoData(result);
  } catch (error) {
    console.log("Something went wrong: Service: getWishlist", error);
    throw new Error(error);
  }
};
module.exports.deleteWishlist = async ({ id }) => {
  try {
    await Wishlist.findOneAndUpdate(
      { _id: id },
      { is_deleted: "1" },
      { new: true, useFindAndModify: false }
    );
  } catch (error) {
    console.log("Something went wrong: Service: updateSongs", error);
    return new Error(error);
  }
};
module.exports.playlistcreate = async ({id,title,image}) => {
   try {
    let user = await Customer.findOne({ _id: id })
    if (user) {
        let insertData = {
          title: title,
          image: image,
          user_id: id
        };
      const newPlaylist = new userplaylistModel(insertData);
      let result = await newPlaylist.save();
      console.log(result)
        return { status : true, message : 'Playlist Created' };
    }else{
      return { status : false, message : 'User Not Exists' };
    }
  } catch (error) {
    console.log("Something went wrong: Service: playlistcreate", error);
    throw new Error(error);
  }
};
module.exports.fetchPlaylist = async ({ id }) => {
  try {
    let userData = await userplaylistModel.find({ user_id: id });

    return userData;
  } catch (error) {
    console.log("Something went wrong: Service: updateCategory", error);
    return new Error(error);
  }
}
module.exports.countPlaylistSong = async ({ id }) => {
  try {
    let countSongs = await playlistSongModel.find({playlist_id:id}).countDocuments()
    return (countSongs)
  } catch (error) {
    console.log("Something went wrong: Service: getAllSongss", error);
    return new Error(error);
  }
};
module.exports.findPlayList = async ({ id, user_id }) => {
  try {
    let find = {}
    if(user_id){
      find['user_id'] = user_id;
    }
    if(id){
      find['_id'] = id;
    }
    let wishlists = await userplaylistModel.find(find);
    return formatMongoData(wishlists);
  } catch (error) {
    console.log("Something went wrong: Service: getWishlist", error);
    throw new Error(error);
  }
};
module.exports.deletePlaylist = async ({ id }) => {
  try {
    await userplaylistModel.findOneAndDelete({ _id: id });
  } catch (error) {
    console.log("Something went wrong: Service: updateSongs", error);
    return new Error(error);
  }
};
module.exports.addplaylistSong = async ({user_id,playlist_id,songs}) => {
  try {
    
   let user = await Customer.findOne({ _id: user_id })
   if (user) {
     let findPlaylist = await userplaylistModel.findOne({ _id: playlist_id });
     if (findPlaylist) {
       for (song in songs) {
         checkObjectId(songs[song])
         let findsong = await playlistSongModel.findOne({ playlist_id: playlist_id, song_id: songs[song] })
         if (!findsong) {
           let insertData = {
             user_id: user_id,
             song_id: songs[song],
             playlist_id: playlist_id
           };
           const newPlaylist = new playlistSongModel(insertData);
           await newPlaylist.save();
         }else {
          return { status : false, message : 'Playlist Song allready Added' };
        }
       }
       return { status : true, message : 'Playlist Song Added' };
     }else{
      return { status : false, message : 'Playlist Not Found' };
     }
     
   }else{
     return { status : false, message : 'User Not Exists' };
   }
 } catch (error) {
   console.log("Something went wrong: Service: signup", error);
   throw new Error(error);
 }
};


module.exports.removeplaylistSong = async ({ user_id, playlist_id, songs }) => {
  try {
    console.log(user_id, playlist_id, songs)
   let user = await Customer.findOne({ _id: user_id })
   if (user) {
     let findPlaylist = await userplaylistModel.findOne({ _id: playlist_id });
     if(findPlaylist){
       for (let song in songs) {
         let findsong = await playlistSongModel.findOne({ playlist_id: playlist_id })
         console.log( findsong)
         if (findsong) {
          let Data = {
            user_id: user_id,
            song_id:songs[song],
            playlist_id: playlist_id
          };
          const newPlaylist =await playlistSongModel.deleteOne(Data);
         } else {
          return { status : false, message : 'Invalid song id' };
         }
       
      
      }
       return { status : true, message : 'Playlist Song Deleted' };
     }else{
      return { status : false, message : 'Playlist Not Found' };
     }
     
   }else{
     return { status : false, message : 'User Not Exists' };
   }
 } catch (error) {
   console.log("Something went wrong: Service: signup", error);
   throw new Error(error);
 }
};

module.exports.updatePlaylist = async ({ id,data}) => {
  try {
    checkObjectId(id)
    let result = await userplaylistModel.findOneAndUpdate({ _id: id }, data, { new: true, useFindAndModify: false });
    return (result)
  } catch (error) {
    console.log("Something went wrong: Service: updateSongs", error);
    return new Error(error);
  }
};

module.exports.playlistDetails = async ({ id}) => {
  try {
checkObjectId(id)
    let result = await playlistSongModel.find({ playlist_id: id })
    if (result) {
      return formatMongoData (result)
    } else {
      return { status : false, message : 'Invalid playlist id' };
    }
  } catch (error) {
    console.log("Something went wrong: Service: updateSongs", error);
    return new Error(error);
  }
};

module.exports.getSongsList = async ({id}) => {
  try {
    let songs = await Songs.find({_id:id})
    return formatMongoData(songs);
  } catch (error) {
    console.log('Something went wrong: Service: getAllSongss', error);
    return new Error(error);
  }
}

module.exports.getArtist = async (artist) => {
  try {
    console.log(artist)
    let product_type = await Artist.findOne({ _id: artist });
    return (product_type);
  } catch (error) {
    console.log('Something went wrong: Service: getArtistById', error);
    return new Error(error);
  }
}