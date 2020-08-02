# koreatech-portal-board
[아우누리 포털](https://portal.koreatech.ac.kr) 커뮤니티 게시판의 게시글 목록, 게시글 정보, 댓글 정보를 가져오는 라이브러리입니다.

## 설치 방법
```  
git clone https://github.com/refracta/koreatech-api
cd koreatech-portal-board
npm install
```

## 사용 방법
```
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
// WARNING: https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs

var kpbapi = require('./koreatech-portal-board');
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
```
```
PostList: 5 야인시대 5화
...
64 야인시대 64화
...
65 야인시대 65화는 정말 일품이란 말이야. 대사도 뻑뻑하고 연기혼도 꽤 많이 들었어.
LastPost: {
  post_seq: 65,
  title: '야인시대 65화는 정말 일품이란 말이야. 대사도 뻑뻑하고 연기혼도 꽤 많이 들었어.',
  attach_file: true,
  notice: false,
  url: 'https://portal.koreatech.ac.kr/ctt/bb/bulletin?b=22&ls=60&ln=1&dm=r&p=65',
  comment_sum: 2,
  comment_url: 'https://portal.koreatech.ac.kr/ctt/bb/bulletin?b=22&ls=60&ln=1&&p=65&dm=cr',
  cre_dt: '1972-11-21',
  etc0: '',
  etc1: '',
  etc2: '',
  cre_user_name: '상하이조',
  visit_cnt: 1972
}
PostInfo: {
  title: '야인시대 65화는 정말 일품이란 말이야. 대사도 뻑뻑하고 연기혼도 꽤 많이 들었어.',
  cre_user_name: '상하이조',
  cre_dt: '1972-11-21 13:00:00',
  visit_cnt: 1972,
  content: '<p>&#xC548;&#xB155;&#xD558;&#xC138;&#xC694;. &#xC81C;28&#xB300; &#xCD1D;&#xD559;&#xC0DD;&#xD68C; &#x',
  attach_list: [
    {
      name: '국밥.jpg',
      size: '2000 KB',
      url: 'https://portal.koreatech.ac.kr/ctt/bb/bulletin?b=22&p=65&a=fd&fs=1'
    }, ... { ... }
  ],
  all_file_down_url: 'https://portal.koreatech.ac.kr/ctt/bb/bulletin?b=22&ls=60&ln=1&dm=r&p=65&a=afd',
  comment_sum: 2,
  comment_url: 'https://portal.koreatech.ac.kr/ctt/bb/bulletin?b=22&ls=60&ln=1&&p=65&dm=cr'
}
CommentList: {
  comment_sum: 2,
  comment_list: [
    {
      cre_user_name: '김두한',
      cre_dt: '1972-11-21',
      comment: '공산당 할 거야, 안 할 거야!'
    },
    {
      cre_user_name: '심영',
      cre_dt: '1972-11-21',
      comment: '안 하겠소! 다시는 안 하겠소!'
    }
  ]
}
```
[더 많은 예제 보기](https://github.com/refracta/koreatech-api/tree/master/koreatech-portal-board/examples)

## 기타
Pull Request 환영합니다. 개선 사항, 버그는 Issue에 등록해주세요.
