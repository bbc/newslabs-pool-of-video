var Video = require("../models/Video");

/**
 * GET /videos
 */
exports.getVideos = function(req, res) {
  var query = {};
  var pageNumber = 1,
      resultsPerPage = 100;

  var pageNumber = (parseInt(req.query.page) > 1) ? parseInt(req.query.page) : 1;
  var skip = 0;
  if (pageNumber > 1)
    skip = (pageNumber - 1) * resultsPerPage;

  try {
    Video
    .find(query, null, { skip: skip, limit: resultsPerPage, sort : { _id: -1 } })
    .exec(function (err, videos) {
      Video.count(query, function(err, count) {
        if (req.xhr) {
          return res.json({ videos: video, numberOfVideos: count, numberOfPages: Math.ceil(count / resultsPerPage) });
        } else {
          return res.render('videos', { title: res.locals.title + " - Videos",
                                 videos: videos,
                                 page: pageNumber,
                                 limit: resultsPerPage,
                                 count: count
          });
        }
      });
    });
  } catch (e) {
    if (req.xhr) {
      return res.json({ videos: [], numberOfVideos: 0, numberOfPages: 0 });
    } else {
      return res.render('videos', { title: res.locals.title + " - Videos",
                             videos: [],
                             page: 1,
                             limit: resultsPerPage,
                             count: 0
      });
    }
  }
};

/**
 * GET /video/:id
 */
exports.getVideo = function(req, res) {
  var videoId = req.params.id;
  
  Video
  .findOne({ _id: videoId })
  .exec(function (err, video) {
    if (err || !video)
      return res.render('404');

    if (req.xhr) {
      return res.json(video);
    } else {
      return res.render('videos/view', { title: res.locals.title + " - " + video.name, video: video });
    }
  });
};

/**
 * GET /video/edit/:id
 */
exports.getVideoEdit = function(req, res) {
  var videoId = req.params.id;
  
  Video
  .findOne({ _id: videoId })
  .exec(function (err, video) {
    if (err || !video)
      return res.render('404');
    
    return res.render('videos/edit', { title: res.locals.title + " - " + video.name, video: video });
  });
};

/**
 * POST /video/edit/:id
 */
exports.postVideoEdit = function(req, res) {
  req.assert('url', 'URL cannot be blank').notEmpty();
  req.assert('name', 'Name cannot be blank').notEmpty();

  var videoId = req.params.id;
  
  var errors = req.validationErrors();

  if (req.headers['x-validate'])
    return res.json({ errors: errors });
  
  if (errors) {
    req.flash('errors', errors);
    return res.render('videos/edit', { title: res.locals.title + " - " + video.name, video: video });
  }
  
  Video
  .findOne({ _id: videoId })
  .exec(function (err, video) {
    if (err || !video)
      return res.render('404');
    
    video.url = req.body.url;
    video.name = req.body.name;
    video.description = req.body.description;
    video.tags = splitTags(req.body.tags);

    video.save(function(err) {
      if (err) return next(err);
      req.flash('success', [ { msg: "Changes saved" }]);
      if (req.xhr) {
        return res.json(video);
      } else {
        return res.redirect("/videos/"+video.id);
      }
    });
    
  });
};


/**
 * GET /videos/add
 */
exports.getVideosAdd = function(req, res) {
  res.render('videos/add', { title: res.locals.title + " - Add Video" });
};


/**
 * POST /videos/add
 */
exports.postVideosAdd = function(req, res, next) {
  req.assert('url', 'URL cannot be blank').notEmpty();
  req.assert('name', 'Name cannot be blank').notEmpty();
  
  var errors = req.validationErrors();

  if (req.headers['x-validate'])
    return res.json({ errors: errors });
  
  if (errors) {
    req.flash('errors', errors);
    return res.render('videos/add');
  }

  var video = new Video({
    url: req.body.url,
    name: req.body.name,
    description: req.body.description,
    tags: splitTags(req.body.tags)
  });
  
  video.save(function(err) {
    if (err) return next(err);
    req.flash('success', [ { msg: "Video added successfully" }]);
    if (req.xhr) {
      return res.json(video);
    } else {
      return res.redirect("/videos/"+video.id);
    }
  });
  
};

/**
 * GET /videos/search
 */
exports.getVideosSearch = function(req, res) {
  if (req.query.q) {
    Video
    .search(req.query.q, {},
      { sort: { created: -1 },
        limit: 100
      },
      function(err, data) {
        var response = {
          title: res.locals.title + " - Search",
          query: req.query.q,
          videos: data.results,
          count: data.totalCount
        };
        // If it's an ajax request, return a json response
        if (req.xhr) {
          return res.json(response);
        } else {
          return res.render('videos/search', response);
       }
      });
  } else {
    var response = {
      title: res.locals.title + " - Search",
      query: '',
      videos: [],
      count: 0
    };
    if (req.xhr) {
      return res.json(response);
    } else {
      return res.render('videos/search', response);
    }
  }
};

/**
 * Handle splitting up tags
 */
function splitTags(str) {
  if (!str || str.trim() == '')
    return [];
  
  return str.match(/(".*?"|[^",]+)+(?=,*|,*$)/g).map(function(s) { return s.trim().replace(/(^\"|\"$)/g, '').trim() })
};