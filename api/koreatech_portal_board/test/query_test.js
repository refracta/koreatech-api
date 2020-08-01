process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
// WARNING: https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs

const fetch = require('fetch-cookie')(require('node-fetch'));
const cheerio = require('cheerio');
const PORTAL_URL = "https://portal.koreatech.ac.kr";

async function login(user_id, user_pwd) {
    user_id = encodeURIComponent(user_id);
    user_pwd = encodeURIComponent(user_pwd);
    await fetch(`${PORTAL_URL}/sso/sso_login.jsp`, {
        "body": `user_id=${user_id}&user_pwd=${user_pwd}&RelayState=%2Findex.jsp&id=PORTAL&targetId=PORTAL&user_password=${user_pwd}`,
        "method": "POST",
    });
    await fetch(`${PORTAL_URL}/ktp/login/checkLoginId.do`, {
        "headers": {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        "body": `login_id=${user_id}&login_pwd=${user_pwd}&login_type=&login_empno=&login_certDn=&login_certChannel=`,
        "method": "POST",
    });
    await fetch(`${PORTAL_URL}/ktp/login/checkSecondLoginCert.do`, {
        "body": `login_id=${user_id}`,
        "method": "POST",
    });
    var manualRedirection = res => fetch(res.headers.get('location'), {
        "method": "GET",
        redirect: 'manual'
    });
    await fetch(`${PORTAL_URL}/exsignon/sso/sso_assert.jsp`, {
        "body": "certUserId=&certLoginId=&certEmpNo=&certType=&secondCert=&langKo=&langEn=",
        "method": "POST",
        redirect: 'manual'
    }).then(manualRedirection).then(manualRedirection).then(manualRedirection).then(manualRedirection);
}

function getPostList(url) {
    return fetch(url)
    .then(res => res.text())
    .then(body => {
        const $ = cheerio.load(body);
        return $('[data-name="post_list"]').toArray().map(e => ({
                post_seq: parseInt($(e).find('.bc-s-post_seq').text()),
                title: $(e).find('.bc-s-title').text().trim(),
                attach_file: $(e).find('.bc-s-title img').length > 0,
                url_raw: $(e).data('url'),
                url: PORTAL_URL + $(e).data('url'),
                cre_dt: $(e).find('.bc-s-cre_dt').text().trim(),
                cre_user_name: $(e).find('.bc-s-cre_user_name').text().trim(),
                visit_cnt: parseInt($(e).find('.bc-s-visit_cnt').text()),
            }))
    });
}

function getPostContents(url) {
    return fetch(url)
    .then(res => res.text())
    .then(body => {
        const $ = cheerio.load(body);
        $('.bc-s-post-ctnt-area *').toArray().forEach(e => {
            var $e = $(e);
            var src = $e.attr('src');
            if (src && src.startsWith("/ctt/bb/bulletin")) {
                $e.attr('src', PORTAL_URL + src);
            }
        });
        return $('.bc-s-post-ctnt-area').html();
    });
}

login("", "").then(async _ => {
	var l = await getPostList("https://portal.koreatech.ac.kr/ctt/bb/bulletin?b=22");
	var p = l.shift();
	console.log(p);
	var r = p.url;
	var c = await getPostContents(r);
	console.log(c);
});
