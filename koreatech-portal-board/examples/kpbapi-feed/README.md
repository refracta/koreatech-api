# koreatech-feed
API를 이용한 게시판 Feed 서버의 구현 예제입니다.

## 설치 방법
```
npm install
```

## 설정 방법 [(index.js)](https://github.com/refracta/koreatech-api/blob/master/koreatech-portal-board/examples/kpbapi-feed/index.js)
```
const port = process.env.PORT || 6060;
// 포트를 설정하는 부분입니다.
const UPDATE_TIME = 1000 * 60 * 5;
// 데이터 갱신 주기를 설정합니다.
var feed = new Feed({
    title: '한국기술교육대학교 아우누리 포털',
    description: `한국기술교육대학교 아우누리 포털의 게시글의 피드입니다. 포함 게시판: ${boardIdList.map(id => ` $ {
        kpbapi.BOARD_ID_MAP_REVERSE[id]
    }
    게시판 `).join(', ')}`,
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
// https://github.com/jpmonette/feed#example
```

## 사용 방법
```
npm start ID PW
```


## 기타
Pull Request 환영합니다. 개선 사항, 버그는 Issue에 등록해주세요.
