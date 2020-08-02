# koreatech-query-test
API 사용의 기본적인 예제입니다.

## 사용 방법
```
npm start ID PW
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
  cre_dt: '1972-11-21 20:12:11',
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

## 기타
Pull Request 환영합니다. 개선 사항, 버그는 Issue에 등록해주세요.
