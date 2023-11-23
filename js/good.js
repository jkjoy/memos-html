document.addEventListener("DOMContentLoaded", ()=>{
    memoGoods()
}
);
function memoGoods(e) {
    let t = e || 9;
    var n = "https://t.memos.ee"
      , s = n + "/api/v1/memo?creatorId=1&limit=" + t + "&tag=好物";
    let i = 1;
    const o = /\n/;
    fetch(s).then(e=>e.json()).then(e=>{
        for (var t, s, i, a, d, u, h, m, f, p, g, c = "", l = "", r = e, n = 0; n < r.length; n++)
            a = r[n].content.replace(`#好物 
`, ""),
            t = a.split(o),
            i = t[0].replace(/!\[.*?\]\((.*?)\)/g, "$1"),
            s = t[0].replace(/!\[(.*?)\]\(.*?\)/g, "$1"),
            d = s.split(",")[0],
            u = s.split(",")[1],
            h = t[1].replace(/\[.*?\]\((.*?)\)/g, "$1"), 
            m = t[1].replace(/\[(.*?)\]\(.*?\)/g, "$1"),
            c += '<div class="col-6 col-md-4 mb-3"><div class="goods-item p-3"><div class="item-album mb-2"><img loading="lazy" decoding="async" src="' + i + '"></div><div class="item-content"><div class="item-brand text-xs mb-1">' + d + '</div><div class="item-title"><h3><a href="' + h + '">' + u + '</a></h3></div><div class="item-note mt-2">' + m + "</div></div></div></div>";
        f = document.querySelector(".goods"),
        p = "",
        g = "",
        l = c,
        f.innerHTML = l
    }
    )
}

//t[1].replace(/\(([^)]+)\)/g, "$1"),