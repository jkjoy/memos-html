// 适配pjax
photos();

// 自适应
window.onresize = () => {
    if (location.pathname == '/') waterfall('.gallery-photos');
};

// 函数
function photos() {
    fetch('https://t.memos.ee/api/v1/memo?creatorId=1&tag=照片').then(res => res.json()).then(data => { // 记得修改memos地址
        let html='', imgs = [];
        data.forEach(item => { imgs = imgs.concat(item.content.match(/\!\[.*?\]\(.*?\)/g)) });
        imgs.forEach(item => {
            console.log(item)
            let img = item.replace(/!\[.*?\]\((.*?)\)/g,'$1'),
    time, title, tat = item.replace(/!\[(.*?)\]\(.*?\)/g,'$1');
            if (tat.indexOf(' ') != -1) {
                time = tat.split(' ')[0];
                title = tat.split(' ')[1];
            } else title = tat

            html += `<div class="gallery-photo"><a href="${img}" data-fancybox="gallery" class="fancybox" data-thumb="${img}"><img class="photo-img" loading='lazy' decoding="async" src="${img}"></a>`;
            title ? html += `<span class="photo-title">${title}</span>` : '';
            time ? html += `<span class="photo-time">${time}</span>` : '';
            html += `</div>`;
        });

        document.querySelector('.gallery-photos.page').innerHTML = html
        imgStatus.watch('.photo-img', () => { waterfall('.gallery-photos'); });
        window.Lately && Lately.init({ target: '.photo-time' });
    }).catch()
}