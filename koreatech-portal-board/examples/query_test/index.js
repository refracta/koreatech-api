process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
// WARNING: https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs

var kpbapi = require('../');
kpbapi.QUERY_SIZE = 60;

const argv = process.argv.slice(2);
const ID = argv[0];
const PW = argv[1];

async function query_test() {
  await kpbapi.login(ID, PW);
  var free_board = await kpbapi.getPostList(kpbapi.getPortalBoardURL('자유게시판'));
  console.log('PostList:', free_board.map(e => `${e.post_seq} ${e.title}`).join('\n'));
  var last_post = free_board.slice(-1).pop();
  console.log('LastPost:', last_post);
  var post_info = await kpbapi.getPostInfo(last_post.url);
  post_info.content = post_info.content.substring(0, 100);
  console.log('PostInfo:', post_info);
  var comment_list = await kpbapi.getCommentList(last_post.comment_url);
  console.log('CommentList:', comment_list);
}

query_test();
