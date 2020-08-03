const fetch = require('fetch-cookie')(require('node-fetch'));
const cheerio = require('cheerio');
const PORTAL_URL = 'https://portal.koreatech.ac.kr';
const BOARD_URL = 'https://portal.koreatech.ac.kr/ctt/bb/bulletin?b=';
const BOARD_ID_MAP = {
  '코로나19관련공지': 142,
  '일반공지사항': 14,
  '학사공지사항': 16,
  '민원실': 72,
  '시설보수신청': 47,
  '학생생활': 21,
  '자유게시판': 22,
  '부정행위(시험)신고': 147,
  '학사행정서식': 23,
  '교육자료실': 24,
  '일반자료실': 25,
  '코리아텍 위키피디아': 102
};

// 0: 로그인 없이 모든 글을 확인 가능
// 1: 로그인 없이 글 목록을 확인 가능, 글 내용은 확인 불가
// 2: 로그인 없이 글 목록과 글 내용 모두 확인 불가
const BOARD_PRIVILEGE_MAP = {
  '코로나19관련공지': 0,
  '일반공지사항': 0,
  '학사공지사항': 0,
  '민원실': 2,
  '시설보수신청': 1,
  '학생생활': 0,
  '자유게시판': 1,
  '부정행위(시험)신고': 2, // 글이 없는 관계로 권한 파악 불가
  '학사행정서식': 0,
  '교육자료실': 1,
  '일반자료실': 1,
  '코리아텍 위키피디아': 0
}



const BOARD_ID_MAP_REVERSE = Object.keys(BOARD_ID_MAP).reduce((a, e) => (a[BOARD_ID_MAP[e]] = e, a), {});
const BOARD_PRIVILEGE_MAP_REVERSE = Object.keys(BOARD_PRIVILEGE_MAP).reduce((a, e) => (a[BOARD_ID_MAP[e]] = BOARD_PRIVILEGE_MAP[e], a), {});
const QUERY_SIZE = 20;
const GET_QUERY_SIZE = _ => !isNaN(parseInt(module.exports.QUERY_SIZE)) ? module.exports.QUERY_SIZE : QUERY_SIZE;

async function login(user_id, user_pwd) {
  user_id = encodeURIComponent(user_id);
  user_pwd = encodeURIComponent(user_pwd);
  await fetch(`${PORTAL_URL}/sso/sso_login.jsp`, {
    'body': `user_id=${user_id}&user_pwd=${user_pwd}&RelayState=%2Findex.jsp&id=PORTAL&targetId=PORTAL&user_password=${user_pwd}`,
    'method': 'POST',
  });
  await fetch(`${PORTAL_URL}/ktp/login/checkLoginId.do`, {
    'headers': {
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    'body': `login_id=${user_id}&login_pwd=${user_pwd}&login_type=&login_empno=&login_certDn=&login_certChannel=`,
    'method': 'POST',
  });
  await fetch(`${PORTAL_URL}/ktp/login/checkSecondLoginCert.do`, {
    'body': `login_id=${user_id}`,
    'method': 'POST',
  });
  var manualRedirection = res => fetch(res.headers.get('location'), {
    'method': 'GET',
    redirect: 'manual'
  });
  await fetch(`${PORTAL_URL}/exsignon/sso/sso_assert.jsp`, {
    'body': 'certUserId=&certLoginId=&certEmpNo=&certType=&secondCert=&langKo=&langEn=',
    'method': 'POST',
    redirect: 'manual'
  }).then(manualRedirection).then(manualRedirection).then(manualRedirection).then(manualRedirection);
}

function toCommentUrl(url) {
  return (url.replace('dm=r', '') + '&dm=cr').replace('&&dm=', '&dm=');
}

function parseIntWithDefault(value, defaultValue = 0) {
  return !isNaN(parseInt(value)) ? parseInt(value) : defaultValue;
}

function getPostList(url, filter_notice = false) {
  return fetch(url)
    .then(res => res.text())
    .then(body => {
      const $ = cheerio.load(body);
      return $('[data-name="post_list"]').toArray().map(e => ({
        post_seq: parseInt($(e).find('.bc-s-post_seq').text()),
        title: $(e).find('.bc-s-title span').length > 0 ? $(e).find('.bc-s-title span').text().trim() : $(e).find('.bc-s-title').text().trim(),
        attach_file: $(e).find('.bc-s-title img').length > 0,
        notice: $(e).find('img[src$="notice.gif"]').length > 0,
        // url_raw: $(e).data('url'),
        // TODO bc-s-file_cnt 부정행위(시험)신고 게시판
        url: PORTAL_URL + $(e).data('url'),
        comment_sum: parseIntWithDefault($(e).find('.bc-s-title div:nth-child(3)').length > 0 ? parseInt($(e).find('.bc-s-title div:nth-child(3)').text().split('').slice(1).reverse().slice(1).reverse().join('')) : 0),
        comment_url: toCommentUrl(PORTAL_URL + $(e).data('url')),
        cre_dt: $(e).find('.bc-s-cre_dt').text().trim(),
        prefix: $(e).find('.bc-s-prefix').text().trim(),
        etc0: $(e).find('.bc-s-etc0').text().trim(),
        etc1: $(e).find('.bc-s-etc1').text().trim(),
        etc2: $(e).find('.bc-s-etc2').text().trim(),
        cre_user_name: $(e).find('.bc-s-cre_user_name').text().trim(),
        visit_cnt: parseInt($(e).find('.bc-s-visit_cnt').text()),
      })).filter(e => filter_notice ? !e.notice : true).sort((a, b) => a.post_seq < b.post_seq ? -1 : a.post_seq > b.post_seq ? 1 : 0);
    });
}

function parseCommentURL(url) {
  return fetch(url)
    .then(res => res.text())
    .then(body => {
      const $ = cheerio.load(body);
      var comment_sum = parseIntWithDefault($('.bc-s-sum').text());
      var comment_list = $('#bi_cont_middle dl').toArray().map(e => ({
        cre_user_name: $(e).find('.bc-b-subsection span:nth-child(1)').text().trim(),
        cre_dt: $(e).find('.bc-b-subsection span.bc-s-memodate').text().trim(),
        comment: $(e).find('.bc-s-memocont pre').text().trim()
      }));
      return {
        comment_sum,
        comment_list
      };
    });
}


async function getCommentList(url) {
  var comment_data = await parseCommentURL(url + `&cs=${GET_QUERY_SIZE()}&cn=1`);
  if (comment_data.comment_sum <= 10) {
    return comment_data;
  } else {
    var leftCn = Math.ceil((comment_data.comment_sum - QUERY_SIZE) / QUERY_SIZE);
    var comment_data_queue = [comment_data];
    for (var i = 0 + 2; i < leftCn + 2; i++) {
      comment_data_queue.push(parseCommentURL(url + `&cs=${GET_QUERY_SIZE()}&cn=${i}`));
    }
    comment_data_queue = await Promise.all(comment_data_queue);
    return {
      comment_sum: comment_data.comment_sum,
      comment_list: comment_data_queue.reduce((a, e) => [...a, ...e.comment_list], [])
    }
  }
}

function getPostInfo(url) {
  return fetch(url)
    .then(res => res.text())
    .then(body => {
      const $ = cheerio.load(body);
      var replaceURL = e => {
        var src = $(e).attr('src');
        if (src && src.startsWith('/ctt/bb/bulletin')) {
          $(e).attr('src', PORTAL_URL + src);
        }
        var href = $(e).attr('href');
        if (href && href.startsWith('/ctt/bb/bulletin')) {
          $(e).attr('href', PORTAL_URL + href);
        }
      };

      $('script').remove();
      $('.bc-s-post-ctnt-area *').toArray().forEach(replaceURL);
      $('.bc-s-tbledit *').toArray().forEach(replaceURL);

      var attach_list = $('.bc-s-tbledit #tx_attach_list dt > a:nth-child(1)').toArray().map(e => ({
        name: $(e).text().split('(').reverse().slice(1).reverse().join('('),
        size: $(e).text().match(/\(.+?\)/g) ? $(e).text().match(/\(.+?\)/g).pop().split('').slice(1).reverse().slice(1).reverse().join('') : void 0,
        url: $(e).attr('href')
      }));
      var all_file_down_url = url + '&a=afd';
      $('#tx_attach_all_file_down').parent().append($(`<a href="${all_file_down_url} style="background: #555555; border-color: #111; color: #fff;">모두저장</>`));
      $('#tx_attach_all_file_down').remove();

      var comment_sum = parseIntWithDefault($('#bi_cmmt_list .bc-s-sum').text());

      var comment_url = toCommentUrl(url);
      $('#cmmtListSize').remove();
      $('.bc-s-btnmemomod').remove();
      $('.bc-s-btndelmemo').remove();

      if ($('#bi_cmmt_list .bc-s-sum').length > 0) {
        $('#bi_cmmt_list .bc-s-sum').parent().html($('#bi_cmmt_list .bc-s-sum').parent().html().replace('&#xAC74;/', '10&#xAC74;/'));
      }
      $('input').remove();
      $('textarea').remove();

      var post_content = $('.bc-s-post-ctnt-area').html();
      var attach_content = $('.bc-s-tbledit').html();
      var comment_content = $('#bi_cmmt_list').html();

      var content = (post_content ? post_content : '') + (attach_content ? attach_content : '') + (comment_content ? comment_content : '');
      content = content.trim();

      var data = {
        title: $('.kut-board-title-table span:nth-of-type(1)').text().trim(),
        cre_user_name: $('.kut-board-title-table td:nth-of-type(1)').text().trim(),
        cre_dt: $('.kut-board-title-table td:nth-of-type(2)').text().trim(),
        visit_cnt: parseInt($('.kut-board-title-table td:nth-of-type(3)').text().trim()),
        content,
        attach_list,
        all_file_down_url,
        comment_sum,
        comment_url
      }
      if (attach_list.length == 0) {
        delete data.all_file_down_url;
      }
      return data;
    });
}


function getPortalBoardURL(board_identifier) {
  if (isNaN(parseInt(board_identifier))) {
    return BOARD_URL + BOARD_ID_MAP[board_identifier] + `&ls=${GET_QUERY_SIZE()}`;
  } else {
    return BOARD_URL + board_identifier + `&ls=${GET_QUERY_SIZE()}`;
  }
}

module.exports = {
  PORTAL_URL,
  BOARD_URL,
  BOARD_ID_MAP,
  BOARD_ID_MAP_REVERSE,
  BOARD_PRIVILEGE_MAP,
  BOARD_PRIVILEGE_MAP_REVERSE,
  QUERY_SIZE,
  fetch,
  login,
  getPostList,
  getPostInfo,
  getCommentList,
  getPortalBoardURL
}
