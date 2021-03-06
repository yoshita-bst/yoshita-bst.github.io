/*
   1. Send an impression on page load and ad click as of now.
   2. Render ads on document's readystate. Make APi calls one by one.
   3. Always send uid from the cookies. (Resolve localhost error)
   4. Send all the tracking parameters in all the api calls.
   5. Handle Ad rendering for multiple ads in single page. (make use of a for loop)
   6. Handling for corrupt image.
*/


function getAds () {
    let adDiv = document.getElementsByClassName("adsbybgn");
    for(let i = 0; i < adDiv.length; i++){
        let w = adDiv[i].style.width.split('px')[0];
        let h = adDiv[i].style.height.split('px')[0];
        
        let ed = {
            w,
            h,
            sid: 'c2e86222-44ab-4fd7-8023-b24cf10e4b64',
        }
        let params = getUrlFromParams();
        params = `${params}&ed=${JSON.stringify(ed)}`;
        console.log('...calling ads api', i);
        fetch(`https://bgn-1-dot-bluestacks-cloud-qa.appspot.com/ad/c?${params}`)
            .then((response) => (response.json()))
            .then(data => {
                adDiv[i].style.backgroundImage = `url('${data.url}')`;
                params = getUrlFromParams();
                ed.pkg = data.pkg;
                ed.url = data.url;
                params = `${params}&ed=${JSON.stringify(ed)}`;
                sendImpression('ad_client_impression', params);
                adDiv[i].style.cursor = 'pointer';
                adDiv[i].onclick = function(e){
                    window.open(data.clk);
                    sendImpression('ad_click', params);
                }
            });
    }
}

function getDeviceType () {
    const ua = window.navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    }
    if (
      /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      return "mobile";
    }
    return "desktop";
};

function getBrowser() {
    var test = function(regexp) {return regexp.test(window.navigator.userAgent)}
    switch (true) {
        case test(/edg/i): return "Microsoft Edge";
        case test(/trident/i): return "Microsoft Internet Explorer";
        case test(/firefox|fxios/i): return "Mozilla Firefox";
        case test(/opr\//i): return "Opera";
        case test(/ucbrowser/i): return "UC Browser";
        case test(/samsungbrowser/i): return "Samsung Browser";
        case test(/chrome|chromium|crios/i): return "Google Chrome";
        case test(/safari/i): return "Apple Safari";
        default: return "Other";
    }
}

function getOS() {
    let OSName = "Unknown";
    if (window.navigator.userAgent.indexOf("Windows NT 10.0")!= -1) OSName="Windows 10";
    if (window.navigator.userAgent.indexOf("Windows NT 6.2") != -1) OSName="Windows 8";
    if (window.navigator.userAgent.indexOf("Windows NT 6.1") != -1) OSName="Windows 7";
    if (window.navigator.userAgent.indexOf("Windows NT 6.0") != -1) OSName="Windows Vista";
    if (window.navigator.userAgent.indexOf("Windows NT 5.1") != -1) OSName="Windows XP";
    if (window.navigator.userAgent.indexOf("Windows NT 5.0") != -1) OSName="Windows 2000";
    if (window.navigator.userAgent.indexOf("Mac") != -1) OSName="Mac/iOS";
    if (window.navigator.userAgent.indexOf("X11") != -1) OSName="UNIX";
    if (window.navigator.userAgent.indexOf("Linux") != -1) OSName="Linux";
    return OSName;
}

function appendParam(paramKey, paramValue, string) {
    if(paramKey){
        string = string + `&${paramKey}=${paramValue}`;
    }
    return string;
}

function getUrlFromParams() {
    let params = getParams();
    let paramString = "";
    Object.keys(params).forEach(p => {
        paramString = appendParam(p, params[p], paramString);
    })
    return paramString;
}

function getRandomNumber() {
    return Math.floor(1000 + Math.random() * 9000);
}

function getParams() {
    let cn = (new URL(window.location.href)).searchParams.get('utm_campaign');
    let cs = (new URL(window.location.href)).searchParams.get('utm_source');
    let ct = (new URL(window.location.href)).searchParams.get('utm_term');
    let cm = (new URL(window.location.href)).searchParams.get('utm_medium');
    let cc = (new URL(window.location.href)).searchParams.get('utm_content');
    let cookie = document.cookie.split(";").find(it => {return it.includes('bgn_id')});
    let bdt = getDeviceType();
    let bn = getBrowser();
    let bdo = getOS();
    let z = getRandomNumber();
    let params = {
        id: 'afr2b-beta-a4033079974eade5f6534dc126f73533',
        dl: encodeURIComponent(window.location.href),
        dh: encodeURIComponent(window.location.hostname),
        dp: encodeURIComponent(window.location.pathname),
        de: encodeURIComponent(document.charset),
        sr: encodeURIComponent(window.screen.width + 'x' + window.screen.height),
        vp: encodeURIComponent(window.innerWidth + 'x' + window.innerHeight),
        sd: encodeURIComponent(window.screen.colorDepth),
        dt: encodeURIComponent(document.title),
        ul: encodeURIComponent(window.navigator.language),
        ce: +window.navigator.cookieEnabled,
        je: +window.navigator.javaEnabled(),
        dpr: encodeURIComponent(window.devicePixelRatio),
        ua: encodeURIComponent(window.navigator.userAgent),
        dr: document.referrer,
        bdt: bdt,
        bn: bn,
        bdo: bdo,
        z: z
    };
    if(cookie) params.uid = cookie.split("=")[1];
    if(cn) params.cn = cn;
    if(cs) params.cs = cs;
    if(ct) params.ct = ct;
    if(cm) params.cm = cm;
    if(cc) params.cc = cc;
    console.log('params:', params);
    return params;
}

function sendImpression (type, params) {
    if(!params) {
        params = getUrlFromParams();
    }
    params = params + `&ev=${type}`;
    console.log('...calling impression api');
    fetch(`https://bgn-1-dot-bluestacks-cloud-qa.appspot.com/ad/i?${params}`)
        .then(response => response.text())
        .then(data => {
            console.log('response from impression API:', data);
        });
}

document.addEventListener("DOMContentLoaded", function(){
    sendImpression('pageview');
    getAds();
});


