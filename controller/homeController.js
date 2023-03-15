const constants = require("../constants");
const artistService = require("../service/artistService");
const categoryService = require('../service/categoryService');
const songService = require('../service/songService');
const playlistService = require('../service/playlistService');

module.exports.getAllHomes = async (req, res) => {
    let response = { ...constants.defaultServerResponse };
    try {
      const responseFromService = {};
      req.query.isActive = true;

      responseFromService.topBanner = [{
        image_url : process.env.MEDIA_PATH + "banner/banner_top.jpg",
        title : "Happy 16th Victory"
      }];

      const getAllMood = await songService.getAllMood({'status':'active','is_deleted':'n','display_in_home':true});
      for (let i in getAllMood) {
        delete getAllMood[i].createdAt;
        delete getAllMood[i].updatedAt;
        delete getAllMood[i].status;
        delete getAllMood[i].display_in_home;
        delete getAllMood[i].is_deleted;
      }
      responseFromService.moodList = getAllMood;

      responseFromService.mainBanner = [{
        image_url : process.env.MEDIA_PATH + "banner/banner1.jpg"
      }];

      let recentPlay = [];
      const recentPlaySong = await songService.getSongsList({limit:2});
      for (let i in recentPlaySong) {
        if (recentPlaySong[i].thumb_img) {
          recentPlaySong[i].thumb_img = process.env.MEDIA_PATH + "songs/thumb_image/" + recentPlaySong[i].thumb_img;
        }
        if (recentPlaySong[i].media_file) {
          recentPlaySong[i].media_file = process.env.MEDIA_PATH + "songs/" + recentPlaySong[i].media_file;
        }
        let songArtist = recentPlaySong[i].artists;
        let artist_name = [];
        for(artist of songArtist){
          let getArtist = await artistService.getArtistById({id:artist});
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
      }
      responseFromService.recentPlay = recentPlay;


      let madeForYou = [
        {
            "id": "62fdb04a630cf75b08136f53",
            "playCount": 0,
            "downloadCount": 0,
            "title": "Running Up the hill",
            "description": "",
            "thumb_img": process.env.MEDIA_PATH+"banner/made_for_you1.webp",
            "media_file": process.env.MEDIA_PATH+"banner/sample_music.mp3",
            "artist": "Kate Bush Solo"
        },
        {
          "id": "62fdb04a630cf75b08136f53",
          "playCount": 0,
          "downloadCount": 0,
          "title": "I Don't Know",
          "description": "",
          "thumb_img": process.env.MEDIA_PATH+"banner/made_for_you2.webp",
          "media_file": process.env.MEDIA_PATH+"banner/sample_music.mp3",
          "artist": "Jane Cooper"
        }
      ];
      responseFromService.madeForYou = madeForYou;


      const artists = await artistService.getAllArtist({'status':'active','is_deleted':'n','display_in_home':true});
      for (let i in artists) {
        if (artists[i].img) {
            artists[i].img = process.env.MEDIA_PATH + "artists/" + artists[i].img;
        }
        delete artists[i].createdAt;
        delete artists[i].updatedAt;
        delete artists[i].status;
        delete artists[i].display_in_home;
        delete artists[i].is_deleted;
      }
      responseFromService.artists = artists;

      const getPlaylist = await playlistService.getAllPlaylist({'status':'active','is_deleted':'n','display_in_home_playlist':true});
      for (let i in getPlaylist) {
        if (getPlaylist[i].img) {
          getPlaylist[i].img = process.env.MEDIA_PATH + "playlist/" + getPlaylist[i].img;
        }
        getPlaylist[i].songCount = getPlaylist[i].songs.length;
        delete getPlaylist[i].createdAt;
        delete getPlaylist[i].updatedAt;
        delete getPlaylist[i].status;
        delete getPlaylist[i].display_in_home;
        delete getPlaylist[i].is_deleted;
        delete getPlaylist[i].display_in_home_playlist;
        delete getPlaylist[i].songs;
        delete getPlaylist[i].category;
        delete getPlaylist[i].mood;
      }
      responseFromService.playListForYou = getPlaylist;


      //Category
      const categories = await categoryService.getAllCategory({'status':'active','is_deleted':'n','display_in_home':true});
      for (let i in categories) {
        if (categories[i].img) {
          categories[i].img = process.env.MEDIA_PATH + "categories/" + categories[i].img;
        }
        delete categories[i].createdAt;
        delete categories[i].updatedAt;
        delete categories[i].status;
        delete categories[i].display_in_home;
        delete categories[i].is_deleted;
      }
      responseFromService.categories = categories;


      let topPicksData = {
        artist : [
                    {
                        "id": "62fdb04a630cf75b08136f53",
                        "title": "Minar",
                        "thumb_img": process.env.MEDIA_PATH+"banner/dummy_artist.jpg",
                    },
                    {
                        "id": "62fdb04a630cf75b08136f53",
                        "title": "Kumar Biswajit",
                        "thumb_img": process.env.MEDIA_PATH+"banner/dummy_artist2.jpg",
                    }
                  ],
        best_of : [
                    {
                      "img": process.env.MEDIA_PATH+"banner/playlist1.png",
                      "title": "Playlist 1",
                      "id": "62ff14de18eb682a54b14ea0",
                      "songCount": 10
                    },
                    {
                        "id": "62fdb04a630cf75b08136f53",
                        "title": "Playlist 2",
                        "img": process.env.MEDIA_PATH+"banner/playlist2.png",
                        "songCount": 5
                    }
                  ],
        actor : [
                    {
                        "id": "62fdb04a630cf75b08136f53",
                        "title": "Minar",
                        "thumb_img": process.env.MEDIA_PATH+"banner/made_for_you1.webp",
                    },
                    {
                        "id": "62fdb04a630cf75b08136f53",
                        "title": "Kumar Biswajit",
                        "thumb_img": process.env.MEDIA_PATH+"banner/dummy_artist2.jpg",
                    }
                  ]
      };
      responseFromService.topPicks = topPicksData;

      //New Song
      let newAddedSong = [];
      const newSongs = await songService.getSongsList({});
      for (let i in newSongs) {
        if (newSongs[i].thumb_img) {
          newSongs[i].thumb_img = process.env.MEDIA_PATH + "songs/thumb_image/" + newSongs[i].thumb_img;
        }
        if (newSongs[i].media_file) {
          newSongs[i].media_file = process.env.MEDIA_PATH + "songs/" + newSongs[i].media_file;
        }
        let songArtist = newSongs[i].artists;
        let artist_name = [];
        for(artist of songArtist){
          let getArtist = await artistService.getArtistById({id:artist});
          artist_name.push(getArtist.title);
        }

        newAddedSong.push({
          "id":newSongs[i].id,
          "playCount": newSongs[i].playCount,
          "downloadCount": newSongs[i].downloadCount,
          "title": newSongs[i].title,
          "description": newSongs[i].description,
          "thumb_img": newSongs[i].thumb_img,
          "media_file": newSongs[i].media_file,
          "artist":artist_name.toString()
        })
      }
      responseFromService.newAdded = newAddedSong;


      let topChartData = [
        {
            "img": process.env.MEDIA_PATH+"banner/top_chart.png",
            "title": "Folk Songs",
            "id": "62ff14de18eb682a54b14ea0",
            "songCount": 10
        },
        {
            "img": process.env.MEDIA_PATH+"banner/top_chart2.png",
            "title": "Best Rock Songs",
            "id": "62ff14de18eb682a54b14ea0",
            "songCount": 15
        },
        {
          "img": process.env.MEDIA_PATH+"banner/top_chart.png",
          "title": "Miles",
          "id": "62ff14de18eb682a54b14ea0",
          "songCount": 12
      }
      ];
      responseFromService.topChart = topChartData;


      let trendingData = [
        {
            "title": "Rock Band",
            "id": "62ff14de18eb682a54b14ea0",
            "songs" : [
                        {
                          "id": "62fdb04a630cf75b08136f53",
                          "playCount": 0,
                          "downloadCount": 0,
                          "title": "Running Up the hill",
                          "description": "",
                          "thumb_img": process.env.MEDIA_PATH+"banner/made_for_you1.webp",
                          "media_file": process.env.MEDIA_PATH+"banner/sample_music.mp3",
                          "artist": "Kate Bush Solo"
                        },
                        {
                          "id": "62fdb04a630cf75b08136f53",
                          "playCount": 0,
                          "downloadCount": 0,
                          "title": "I Don't Know",
                          "description": "",
                          "thumb_img": process.env.MEDIA_PATH+"banner/made_for_you2.webp",
                          "media_file": process.env.MEDIA_PATH+"banner/sample_music.mp3",
                          "artist": "Jane Cooper"
                        },
                        {
                          "id": "62fdb04a630cf75b08136f53",
                          "playCount": 0,
                          "downloadCount": 0,
                          "title": "Running Up the hill",
                          "description": "",
                          "thumb_img": process.env.MEDIA_PATH+"banner/made_for_you1.webp",
                          "media_file": process.env.MEDIA_PATH+"banner/sample_music.mp3",
                          "artist": "Kate Bush Solo"
                      },
                      {
                        "id": "62fdb04a630cf75b08136f53",
                        "playCount": 0,
                        "downloadCount": 0,
                        "title": "Running Up the hill",
                        "description": "",
                        "thumb_img": process.env.MEDIA_PATH+"banner/made_for_you1.webp",
                        "media_file": process.env.MEDIA_PATH+"banner/sample_music.mp3",
                        "artist": "Kate Bush Solo"
                    }
                  ]
        },
        {
          "title": "Bangla Folk",
          "id": "62ff14de18eb682a54b14ea0",
          "songs" : [
                      {
                        "id": "62fdb04a630cf75b08136f53",
                        "playCount": 0,
                        "downloadCount": 0,
                        "title": "Running Up the hill",
                        "description": "",
                        "thumb_img": process.env.MEDIA_PATH+"banner/made_for_you1.webp",
                        "media_file": process.env.MEDIA_PATH+"banner/sample_music.mp3",
                        "artist": "Kate Bush Solo"
                      },
                      {
                        "id": "62fdb04a630cf75b08136f53",
                        "playCount": 0,
                        "downloadCount": 0,
                        "title": "I Don't Know",
                        "description": "",
                        "thumb_img": process.env.MEDIA_PATH+"banner/made_for_you2.webp",
                        "media_file": process.env.MEDIA_PATH+"banner/sample_music.mp3",
                        "artist": "Jane Cooper"
                      }
                ]
        }
      ];
      responseFromService.trending = trendingData;

      let podcastData = [
        {
            "id": "62fdb04a630cf75b08136f53",
            "title": "Running Up the hill",
            "image": process.env.MEDIA_PATH+"banner/podcast.png"
        }
      ];
      responseFromService.podcast = podcastData;


      response.status = 200;
      response.message = "Data Fetched";
      response.body = responseFromService;
    } catch (error) {
      console.log("Something went wrong: Controller: getAllHomes", error);
      response.message = error.message;
    }
    return res.status(response.status).send(response);
  };