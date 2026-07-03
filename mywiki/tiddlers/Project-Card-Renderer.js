(function(){

if(typeof window !== "undefined" && !window._projectCardListenerAdded) {
    window._projectCardListenerAdded = true;
    setTimeout(function() {
        document.addEventListener("click", function(e) {
            var btn = e.target.closest ? e.target.closest("[data-project-navigate]") : null;
            if (btn) {
                e.preventDefault();
                var tiddler = btn.getAttribute("data-project-navigate");
                var storyList = $tw.wiki.getTiddlerList("$:/StoryList") || [];
                var alreadyOpen = storyList.indexOf(tiddler) !== -1;
                if (!alreadyOpen) {
                    var currentTiddler = null;
                    var el = btn;
                    while (el) {
                        if (el.getAttribute && el.getAttribute("data-tiddler-title")) {
                            currentTiddler = el.getAttribute("data-tiddler-title");
                            break;
                        }
                        el = el.parentElement;
                    }
                    var insertIdx = currentTiddler ? storyList.indexOf(currentTiddler) : -1;
                    if (insertIdx !== -1) {
                        storyList.splice(insertIdx + 1, 0, tiddler);
                    } else {
                        storyList = storyList.concat([tiddler]);
                    }
                    $tw.wiki.setText("$:/StoryList", "list", null, storyList.join(" "));
                }
                // 렌더링 후 스크롤
                setTimeout(function() {
                    var target = document.querySelector('[data-tiddler-title="' + tiddler + '"]');
                    if (target) target.scrollIntoView({behavior: "smooth", block: "start"});
                }, 200);
            }
        });
    }, 100);
}

// ── projectCard: 간단 버전 (Projects 목록용) ──────────────────
exports.name = "projectCard";
exports.params = [
    {name:"name"},{name:"type"},{name:"period"},
    {name:"desc"},{name:"role"},
    {name:"bullets"},{name:"badges"},
    {name:"tiddler"},{name:"github"}
];
exports.run = function(name,type,period,desc,role,bullets,badges,tiddler,github) {
    return renderCard(name,type,period,desc,role,bullets,badges,tiddler,github,false);
};

})();

function renderCard(name,type,period,desc,role,bullets,badges,tiddler,github,full) {
    var html = '<div class="project-list-card">';

    // 헤더
    html += '<div class="project-list-header">';
    html += '<div>';
    if(name)   html += '<span class="project-card-title">'  + name   + '</span>';
    if(type)   html += '<span class="project-card-type">'   + type   + '</span>';
    html += '</div>';
    if(period) html += '<span class="project-card-period">' + period + '</span>';
    html += '</div>';

    if(desc) html += '<div class="project-card-desc">' + desc + '</div>';
    if(role) html += '<div class="project-card-role">' + role + '</div>';

    // 불릿 (full이면 전부, 간단이면 최대 3개)
    if(bullets) {
        var list = bullets.split('|').filter(function(b){ return b.trim(); });
        if(!full) list = list.slice(0,3);
        html += '<ul class="project-card-bullets">';
        list.forEach(function(b){ html += '<li>' + b.trim() + '</li>'; });
        html += '</ul>';
    }

    // 배지
    if(badges) {
        html += '<div class="tech-stack" style="margin:8px 0;">';
        badges.split('|').forEach(function(b){
            var p = b.split(':');
            var n = p[0] ? p[0].trim() : '';
            var t = p[1] ? p[1].trim() : 'backend';
            if(n) html += '<span class="tech-badge ' + t + '">' + n + '</span>';
        });
        html += '</div>';
    }

    // 링크
    html += '<div class="project-card-links">';
    if(tiddler) html += '<a class="tc-tiddlylink project-link-btn" href="javascript:;" data-project-navigate="' + tiddler + '"><svg width="14" height="14" style="vertical-align:-2px; margin-right:4px;"><use href="#icon-doc"/></svg> 자세히 보기</a>';
    if(github)  html += '<a href="' + github + '" target="_blank" class="project-link-btn" style="font-size:12px;padding:3px 10px;">⎋ GitHub</a>';
    html += '</div>';

    html += '</div>';
    return html;
}
