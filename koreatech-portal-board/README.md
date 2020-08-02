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
PostList: 51835 ○학생지원팀○ 아이스 팩 재사용 활성화를 위한 표준디자인 공모
...
51879 ■총학생회■ 신입생들을 위한 2학기 이수과목 안내
...
51895 ■총학생회■ '여름방학인데 놀면 뭐하니?!' 당첨자 발표 안내
LastPost: {
  post_seq: 51879,
  title: '■총학생회■ 신입생들을 위한 2학기 이수과목 안내',
  attach_file: true,
  notice: false,
  url: 'https://portal.koreatech.ac.kr/ctt/bb/bulletin?b=22&ls=60&ln=1&dm=r&p=51879',
  comment_sum: 2,
  comment_url: 'https://portal.koreatech.ac.kr/ctt/bb/bulletin?b=22&ls=60&ln=1&&p=51879&dm=cr',
  cre_dt: '2020-07-29',
  etc0: '',
  etc1: '',
  etc2: '',
  cre_user_name: '박성진',
  visit_cnt: 193
}
PostInfo: {
  title: '■총학생회■ 신입생들을 위한 2학기 이수과목 안내',
  cre_user_name: '박성진',
  cre_dt: '2020-07-29 12:24:12',
  visit_cnt: 194,
  content: '<p>&#xC548;&#xB155;&#xD558;&#xC138;&#xC694;. &#xC81C;28&#xB300; &#xCD1D;&#xD559;&#xC0DD;&#xD68C; &#x',
  attach_list: [
    {
      name: '신입생들을 위한 2학기 이수과목 안내 표지.jpg',
      size: '313 KB',
      url: 'https://portal.koreatech.ac.kr/ctt/bb/bulletin?b=22&p=51879&a=fd&fs=1'
    }, ... { ... }
  ],
  all_file_down_url: 'https://portal.koreatech.ac.kr/ctt/bb/bulletin?b=22&ls=60&ln=1&dm=r&p=51879&a=afd',
  comment_sum: 2,
  comment_url: 'https://portal.koreatech.ac.kr/ctt/bb/bulletin?b=22&ls=60&ln=1&&p=51879&dm=cr'
}
CommentList: {
  comment_sum: 2,
  comment_list: [
    {
      cre_user_name: '유재철',
      cre_dt: '2020-07-31',
      comment: '메카트로닉스공학부 필수과목 중 미분방정식을 미적분학으로 수정해주셔야 할 것 같습니다.'
    },
    {
      cre_user_name: '박성진',
      cre_dt: '2020-07-31',
      comment: '안녕하세요 유재철 학우님. 이번 2학기 개설강좌를 확인한 결과, 이번 메카트로닉스공학부 1학년 대상으로 미분방정식 과목이 개설되었음을 확인할 수 있었고, 이에 따라 메카트로닉스공학부 학생회에서는 필수과목으로 미분방정식을 안내하 였습니다. 관심 가져주셔서 정말 감사드립니다.'
    }
  ]
}
```
[더 많은 예제 보기](https://github.com/refracta/koreatech-api/tree/master/koreatech-portal-board/examples)

## 기타
Pull Request 환영합니다. 개선 사항, 버그는 Issue에 등록해주세요.
