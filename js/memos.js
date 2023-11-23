var limit = bbMemo.limit
var memos = bbMemo.memos
var envId = bbtwikoo.envId
var page = 1,
  offset = 0,
  nextLength = 0,
  nextDom = '';
var bbDom = document.querySelector(bbMemo.domId);
var load = '<div class="load"><button class="load-btn button-load mb-3">加载中</button></div>'
if (bbDom) {
  bbDom.insertAdjacentHTML('afterend', load);
  getFirstList() //首次加载数据
  var btn = document.querySelector("button.button-load");
  btn.addEventListener("click", function () {
    btn.textContent = '加载中';
    updateTwikoo(nextDom)
    if (nextLength < limit) { //返回数据条数小于限制条数，隐藏
      document.querySelector("button.button-load").remove()
      return
    }
    getNextList()
  });
}

function getFirstList() {
  var bbUrl = memos + "api/v1/memo?creatorId=" + bbMemo.creatorId + "&rowStatus=NORMAL&limit=" + limit;
  fetch(bbUrl).then(res => res.json()).then(resdata => {
    updateTwikoo(resdata)
    var nowLength = resdata.length
    if (nowLength < limit) { //返回数据条数小于 limit 则直接移除“加载更多”按钮，中断预加载
      document.querySelector("button.button-load").remove()
      return
    }
    page++
    offset = limit * (page - 1)
    getNextList()
  });
}
//预加载下一页数据
function getNextList() {
  var bbUrl = memos + "api/v1/memo?creatorId=" + bbMemo.creatorId + "&rowStatus=NORMAL&limit=" + limit + "&offset=" + offset;
  fetch(bbUrl).then(res => res.json()).then(resdata => {
    nextDom = resdata
    nextLength = nextDom.length
    page++
    offset = limit * (page - 1)
    if (nextLength < 1) { //返回数据条数为 0 ，隐藏
      document.querySelector("button.button-load").remove()
      return
    }
  })
}

// 加载评论数量
function updateTwikoo(data) {
  var twiID = data.map((item) => memos + "m/" + item.id);
  twikoo.getCommentsCount({
    envId: envId, // 环境 ID
    urls: twiID,
    includeReply: false // 评论数是否包括回复，默认：false
  }).then(function (res) {
    updateCount(res)
  }).catch(function (err) {
    console.error(err)
  });

  function updateCount(res) {
    var twiCount = res.map((item) => {
      return Object.assign({},{'count':item.count})
    });
    var bbTwikoo = data.map((item,index) => {
      return {...item, ...twiCount[index]};
    });
    updateHTMl(bbTwikoo);
  }
}

// 加载评论内容
function loadTwikoo(memo_id) {
  var twikooDom = document.querySelector('.twikoo-'+memo_id);
  if (twikooDom.classList.contains('d-none')) {
    document.querySelectorAll('.item-twikoo').forEach((item) => {item.classList.add('d-none');})
    if(!document.getElementById("twikoo")){
      twikooDom.classList.remove('d-none');
      twikoo.init({
        envId: envId,
        el: '#twikoo-' + memo_id,
        path: memos + "m/" + memo_id 
      });
      setTimeout(function(){
        document.getElementById("twikoo").id='twikoo-' + memo_id;
      }, 600)
    }
  }else{
    twikooDom.classList.add('d-none');
  }
}
//请求Umami数据
function updateUmami(res) {
  var umiTime = Date.parse(new Date());
  var umiUrl = umami.url + "/api/websites/" + bbMemo.umiId + "/metrics?startAt=0&endAt=" + umiTime + "&type=url"

  fetch(umiUrl,{
    method: 'GET',
    mode: 'cors',
    cache: 'default',
    headers: {
      'Authorization': 'Bearer ' + umami.token,
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json()).then(umidata => { 
    const umiArr = res.map(item => {
      const memoID = '/m/' + item.id
      const data = umidata.find(i => memoID == i.x)
      return {
        ...item,
        ...data,
        products: data ? data.products : []
      }
    })
    updateHTMl(umiArr)
  });
}


// 插入 html 
function updateHTMl(data) {
  var result = "",
    resultAll = "";
  const TAG_REG = /#([^\s#]+?) /g,
    IMG_REG = /!\[.*?\]\((.*?)\)/g,
    LINK_REG = /\[(.*?)\]\((.*?)\)/g, 
    BILIBILI_REG = /<a.*?href="https:\/\/www\.bilibili\.com\/video\/((av[\d]{1,10})|(BV([\w]{10})))\/?".*?>.*<\/a>/g,
    NETEASE_MUSIC_REG = /<a.*?href="https:\/\/music\.163\.com\/.*id=([0-9]+)".*?>.*<\/a>/g,
    GITHUB_REG = /<a.*?href="https:\/\/github\.com\/(.*)".*?>.*?<\/a>/g,
    QQMUSIC_REG = /<a.*?href="https\:\/\/y\.qq\.com\/.*(\/[0-9a-zA-Z]+)(\.html)?".*?>.*?<\/a>/g,
    QQVIDEO_REG = /<a.*?href="https:\/\/v\.qq\.com\/.*\/([a-z|A-Z|0-9]+)\.html".*?>.*<\/a>/g,
    YOUKU_REG = /<a.*?href="https:\/\/v\.youku\.com\/.*\/id_([a-z|A-Z|0-9|==]+)\.html".*?>.*<\/a>/g,
    YOUTUBE_REG = /<a.*?href="https:\/\/www\.youtube\.com\/watch\?v\=([a-z|A-Z|0-9]{11})\".*?>.*<\/a>/g;
  marked.setOptions({
    breaks: !0,
    smartypants: !0,
    langPrefix: 'language-'
  });

  for (var i = 0; i < data.length; i++) {
    var bbContName = data[i].creatorName
    var bbContLink = memos + "m/" + data[i].id
    var bbCount = data[i].count
    var bbContREG = data[i].content
      .replace(TAG_REG, "<span class='tag-span'>#$1</span>")
      .replace(IMG_REG, '')
      .replace(LINK_REG, '<a href="$2" target="_blank"><span>$1</span><i class="iconfont iconlink"></i></a>')
    bbContREG = marked.parse(bbContREG)
      .replace(BILIBILI_REG, "<div class='video-wrapper'><iframe src='//player.bilibili.com/player.html?bvid=$1&as_wide=1&high_quality=1&danmaku=0' scrolling='no' border='0' frameborder='no' framespacing='0' allowfullscreen='true'></iframe></div>")
      .replace(NETEASE_MUSIC_REG, "<meting-js auto='https://music.163.com/#/song?id=$1'></meting-js>")
      .replace(GITHUB_REG, "<i class='iconfont icon-github'></i><a href='https://github.com/$1'target='_blank' rel='noopener noreferrer'>$1</a> ")
      .replace(QQMUSIC_REG, "<meting-js auto='https://y.qq.com/n/yqq/song$1.html'></meting-js>")
      .replace(QQVIDEO_REG, "<div class='video-wrapper'><iframe src='//v.qq.com/iframe/player.html?vid=$1' allowFullScreen='true' frameborder='no'></iframe></div>")
      .replace(YOUKU_REG, "<div class='video-wrapper'><iframe src='https://player.youku.com/embed/$1' frameborder=0 'allowfullscreen'></iframe></div>")
      .replace(YOUTUBE_REG, "<div class='video-wrapper'><iframe src='https://www.youtube.com/embed/$1' title='YouTube video player' frameborder='0' allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' allowfullscreen title='YouTube Video'></iframe></div>")
    
    //解析 content 内 md 格式图片
    var IMG_ARR = data[i].content.match(IMG_REG)
    var IMG_STR = String(IMG_ARR).replace(/[,]/g, '')
    if (IMG_ARR) {
        var bbContIMG = IMG_STR.replace(IMG_REG, "<div class='memo-resource width-100'><img src='$1' loading='lazy' decoding='async'></div>")
        bbContREG += '<div class="resource-wrapper"><div class="images-wrapper my-2">' + bbContIMG + '</div></div>'
    }
    //解析内置资源文件
    if (data[i].resourceList && data[i].resourceList.length > 0) {
      var resourceList = data[i].resourceList;
      var imgUrl = '',
        resUrl = '',
        resImgLength = 0;
      for (var j = 0; j < resourceList.length; j++) {
        var restype = resourceList[j].type.slice(0, 5);
        if (restype == 'image') {
          imglink =  resourceList[j].externalLink,
          imgUrl += '<div class="memo-resource w-100"><img src="' + imglink + '"> loading="lazy"  decoding="async"/></div>',
          //imgUrl += '<div class="memo-resource w-100"><img src="' + memos + 'o/r/' + resourceList[j].id + '/' + resourceList[j].publicId  + '/' + resourceList[j].filename + '" loading="lazy"  decoding="async"></div>',
          resImgLength = resImgLength + 1
        }
        if (restype !== 'image') {
          resUrl += '<a target="_blank" rel="noreferrer" href="' + memos + 'o/r/' + resourceList[j].id + '/' + resourceList[j].publicId  + '/' + resourceList[j].filename + '">' + resourceList[j].filename + '</a>'
        }
      }
      if (imgUrl) {
        bbContREG += '<div class="resource-wrapper"><div class="images-wrapper my-2">' + imgUrl + '</div></div>'
      }
      if (resUrl) {
        bbContREG += '<p class="datasource">' + resUrl + '</p>'
      }
    }

    result += "<li class='mb-3 d-flex'><div class='item-body flex-fill'><div class='item-header d-flex mb-3'><div class='item-thumb mr-3'></div><div class='item-creator'><a href="+ bbContLink +" target='_blank'>" + bbContName + "</a></div><div class='item-mate'>" + new Date(data[i].createdTs * 1000).toLocaleString() + "</div></div><div class='item-content'><div class='item-body'>" + bbContREG + "</div><div class='item-footer'><div class='item d-flex mt-2'><a onclick='loadTwikoo("+ data[i].id +")' title='回复'><i class='iconfont iconmessage'> </i><span class='ml-2'>" + bbCount + "</span></a></div></div><div class='item-twikoo twikoo-"+ data[i].id +" my-2 d-none'><div id='twikoo-"+ data[i].id +"'></div></div></div></div></li>"

  } // end for

  var bbBefore = "<section class='timeline'><ul>"
  var bbAfter = "</ul></section>"
  resultAll = bbBefore + result + bbAfter
  bbDom.insertAdjacentHTML('beforeend', resultAll);
  document.querySelector('button.button-load').textContent = '加载更多';

  

  //图片灯箱
  window.ViewImage && ViewImage.init('.images-wrapper img')
  //相对时间
  window.Lately && Lately.init({
    target: '.item-mate'
  });
}
//获取总条数
//获取 Memos 总条数
function getTotal() {
    var totalUrl = memos + "api/v1/memo/stats?creatorId=" + bbMemo.creatorId 
    fetch(totalUrl).then(res => res.json()).then(resdata => {
        if (resdata) {
            var allnums = resdata.length
            var memosCount = document.getElementById('memosCount');
            memosCount.innerHTML = allnums;
        }
    }).catch(err => {
        // Do something for an error here
    });
};
window.onload = getTotal();