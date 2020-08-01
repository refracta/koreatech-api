process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
// WARNING: https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs

var kpbapi = require('../');

const ID = '';
const PW = '';

async function test() {
  await kpbapi.login(ID, PW);
  var free_board = await kpbapi.getPostList(kpbapi.getPortalBoardURL('자유게시판'));
  console.log('PostList:', free_board.map(e => `${e.post_seq} ${e.title}`).join('\n'));
  var last_post = free_board.slice(-1).pop();
  console.log('LastPostInfo:', last_post);
  var post_content = await kpbapi.getPostContent(last_post.url);
  post_content.content = post_content.content.substring(0, 100);
  console.log('PostContent:', post_content);
  var comment_list = await kpbapi.getCommentList(last_post.comment_url);
  console.log('CommentList:', comment_list);
}

test();
