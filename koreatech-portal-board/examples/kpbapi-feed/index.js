process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
// WARNING: https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs

const kpbapi = require('../../');

const argv = process.argv.slice(2);
const ID = argv[0];
const PW = argv[1];

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

const Feed = require('feed').Feed;

const express = require('express');
const app = express();
const http = require('http');
const port = process.env.PORT || 6060;
const httpServer = http.createServer(app);

var initDB = {};
Object.values(kpbapi.BOARD_ID_MAP).forEach(e => {
  initDB[e] = {};
});
db.defaults(initDB).write();

const UPDATE_TIME = 1000 * 60 * 5;
var cachedDB;
var lastUpdated;

async function updatePostInfo(forceUpdate = false) {
  await Promise.all(Object.values(kpbapi.BOARD_ID_MAP).map(async e => {
    var targetDB = db.get(e);
    await Promise.all(Object.values(targetDB.value()).map(async p => {
      var isExistPostInfo = p.info;
      if (!isExistPostInfo || forceUpdate) {
        console.log('getPostInfo:', p.title);
        targetDB.get(p.post_seq).assign({
          info: await kpbapi.getPostInfo(p.url),
          updated: new Date()
        }).write();
      }
    }));
  }));
}

async function updatePostList() {
  await Promise.all(Object.values(kpbapi.BOARD_ID_MAP).map(async e => {
    var targetDB = db.get(e);
    var boardURL = kpbapi.getPortalBoardURL(e);
    console.log('getPostList:', kpbapi.BOARD_ID_MAP_REVERSE[e]);
    var postList = await kpbapi.getPostList(boardURL);
    var updated = new Date();
    postList.forEach(p => {
      var isExistPost = targetDB.get(p.post_seq).value();
      if (!isExistPost) {
        p.updated = updated;
        targetDB.assign({
          [p.post_seq]: p
        }).write();
      }
    });

    var oldPostList = Object.keys(targetDB.value()).sort();
    oldPostList = oldPostList.slice(postList.length);
    oldPostList.forEach(pid => {
      targetDB.unset(pid).write();
    });
  }));
}

async function update() {
  console.log('update');
  await kpbapi.login(ID, PW);
  console.log('updatePostList');
  await updatePostList();
  console.log('updatePostInfo');
  await updatePostInfo();
  cachedDB = db.value();
  lastUpdated = new Date();
}

function generateFeed(boardIdList = Object.values(kpbapi.BOARD_ID_MAP), numberOfPost = 20) {
  var feed = new Feed({
    title: '한국기술교육대학교 아우누리 포털',
    description: `한국기술교육대학교 아우누리 포털의 게시글의 피드입니다. 포함 게시판: ${boardIdList.map(id => `${kpbapi.BOARD_ID_MAP_REVERSE[id]} 게시판`).join(', ')}`,
    id: 'https://portal.koreatech.ac.kr/',
    link: 'https://portal.koreatech.ac.kr/',
    language: 'ko',
    image: 'https://portal.koreatech.ac.kr/images/logo.png',
    favicon: 'https://portal.koreatech.ac.kr/Portal.ico',
    copyright: 'Copyrightⓒ2016 KOREATECH. All rights reserved.',
    updated: lastUpdated,
    generator: ID,
    feedLinks: {
      //json: 'https://',
      //atom: 'https://'
    },
    author: {
      name: ID,
      email: `${ID}@koreatech.ac.kr`,
      // link: 'https://'
    }
  });
  var posts = boardIdList.reduce((a, id) => [...a, ...Object.values(cachedDB[id]).map(e => ((e.board_identifier = id, e)))], []);

  posts = posts.sort((a, b) => new Date(a.info.cre_dt) < new Date(b.info.cre_dt) ? -1 : new Date(a.info.cre_dt) > new Date(b.info.cre_dt) ? 1 : 0).slice(-numberOfPost);

  posts.forEach(p => {
    var title = `[${kpbapi.BOARD_ID_MAP_REVERSE[p.board_identifier]}] ${p.info.title}`;
    feed.addItem({
      title,
      id: p.url,
      link: p.url,
      description: title,
      content: p.info.content,
      author: [{
        name: p.cre_user_name
      }],
      date: new Date(p.info.cre_dt),
    });
  });

  return feed;
}

async function init() {
  console.log('init Feed Server!');
  await update();
  setInterval(_ => {
    update();
  }, UPDATE_TIME);

  app.get('/', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');

    var query = req.query;
    var boardList = query.boardList ? query.boardList.split(',').map(e => kpbapi.BOARD_ID_MAP[e]).filter(e => e) : [];
    if (boardList.length == 0) {
      boardList = void 0;
    }
    var feed = generateFeed(boardList);

    var feedType = query.feedType;
    switch (feedType) {
      default:
      case 'rss':
        res.header('Content-Type', 'text/xml');
        res.send(feed.rss2());
        break;
      case 'atom':
        res.header('Content-Type', 'text/xml');
        res.send(feed.atom1());
        break;
      case 'json':
        res.header('Content-Type', 'text/json');
        res.send(feed.json1());
        break;
    }
  });

  httpServer.listen(port, function() {
    console.log('Listening on port *:' + port);
  });
}

init();
