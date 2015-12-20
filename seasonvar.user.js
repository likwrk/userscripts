// ==UserScript==
// @name           Seasonvar.ru
// @namespace      http://blog.monstuff.com/archives/cat_greasemonkey.html
// description     Create direct urls to video instead of web player
// @include        http://seasonvar.ru/
// @match          http://seasonvar.ru/*
// @version        0.0.2
// updateURL       https://raw.githubusercontent.com/likwrk/userscripts/master/seasonvar.meta.js
// @updateURL      https://raw.githubusercontent.com/likwrk/userscripts/master/seasonvar.meta.js
// @downloadURL    https://raw.githubusercontent.com/likwrk/userscripts/master/seasonvar.user.js
// @run-at document-end
// ==/UserScript==



function Interceptor(nativeOpenWrapper, nativeSendWrapper) {

    var playlistLoaded = function(playlist) {
        var flashPlayer = document.getElementById('flashPlayer');

        while (flashPlayer.hasChildNodes()) {
            flashPlayer.removeChild(flashPlayer.lastChild);
        }

        flashPlayer.style.height = 'auto';
        flashPlayer.parentElement.style.height = 'auto';
        flashPlayer.parentElement.style.minHeight = '0px';

        var svtabr = document.createElement('div');
            svtabr.classList.add("svtabr");
        var epinfo = document.createElement('epinfo');
            epinfo.classList.add("epinfo");
        var ul = document.createElement('ul');
        for(var i = 0; i < playlist.playlist.length; i++) {
            var episode = playlist.playlist[i],
                li = document.createElement('li'),
                span = document.createElement('span'),
                b = document.createElement('b'),
                a = document.createElement('a');
            b.textContent = episode.comment.split(' ')[0];
            span.textContent = episode.comment.split(' ')[1].replace('<br>', ' ');
            a.setAttribute('href', episode.file);
            a.setAttribute('target', '_blank');
            a.appendChild(b);
            a.appendChild(span);
            li.appendChild(a);
            ul.appendChild(li);
        }
        svtabr.appendChild(epinfo);
        epinfo.appendChild(ul);
        flashPlayer.appendChild(svtabr);
    };

    XMLHttpRequest.prototype.open = function () {
       var xhr = this;
       if (arguments[1].indexOf('list.xml') !== -1) {
           this.onload = function() {
               var playlist = JSON.parse(xhr.response);
               console.log('playlist', playlist);
               console.log('playlistLoaded');
               playlistLoaded(playlist);
           }
       }
       return nativeOpenWrapper.apply(this, arguments);
    }

    XMLHttpRequest.prototype.send = function () {
        return nativeSendWrapper.apply(this, arguments);
    }
}


document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        var html5 = document.documentElement.querySelector('.html5play');
        if (html5.style.display) return;
        var click = new Event('click');
        if (html5) html5.dispatchEvent(click);
    }
}

var script = document.createElement("script");
script.type = "text/javascript";
script.textContent = "(" + Interceptor + ")(XMLHttpRequest.prototype.open, XMLHttpRequest.prototype.send);";
document.body.style.marginTop = '-300px';
console.log(document.body.style);
document.documentElement.appendChild(script);
document.documentElement.removeChild(script);