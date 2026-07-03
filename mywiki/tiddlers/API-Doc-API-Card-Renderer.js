(function(){

if(typeof window !== "undefined" && !window._docRendererListenerAdded) {
    window._docRendererListenerAdded = true;
    setTimeout(function() {
        document.addEventListener("click", function(e) {
            var card = e.target.closest ? e.target.closest("[data-doc-navigate]") : null;
            if (card) {
                e.preventDefault();
                var tiddler = card.getAttribute("data-doc-navigate");
                var storyList = $tw.wiki.getTiddlerList("$:/StoryList") || [];
                var alreadyOpen = storyList.indexOf(tiddler) !== -1;
                if (!alreadyOpen) {
                    var currentTiddler = null;
                    var el = card;
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
                setTimeout(function() {
                    var target = document.querySelector('[data-tiddler-title="' + tiddler + '"]');
                    if (target) target.scrollIntoView({behavior: "smooth", block: "start"});
                }, 200);
            }
        });
    }, 100);
}

exports.name = "renderApiDoc";
exports.params = [{name: "groups"}];

exports.run = function(groups) {
    try {
        var groupList = JSON.parse(groups);
        var html = [];
        for (var i = 0; i < groupList.length; i++) {
            html.push(renderCard(groupList[i]));
        }
        return '<div class="api-doc-grid">' + html.join("") + '</div>';
    } catch(e) {
        return "<em>Error: " + e.message + "</em>";
    }
};

function renderCard(group) {
    var tiddler = group.tiddler;
    var text = $tw.wiki.getTiddlerText(tiddler) || "";
    var methodMatches = text.match(/api-method api-(\w+)/g) || [];
    var methods = [];
    var seen = {};
    for (var i = 0; i < methodMatches.length; i++) {
        var m = methodMatches[i].replace("api-method api-", "");
        if (!seen[m]) { seen[m] = true; methods.push(m); }
    }
    var count = (text.match(/class="api-card"/g) || []).length;
    var order = ["get","post","put","patch","delete"];
    methods.sort(function(a, b) { return order.indexOf(a) - order.indexOf(b); });
    var badges = methods.map(function(m) {
        return '<span class="api-method api-' + m + '" style="font-size:11px;padding:2px 6px;">' + m.toUpperCase() + '</span>';
    }).join(" ");
    return '<div class="api-doc-card" data-doc-navigate="' + tiddler + '">' +
        '<div class="api-doc-card-header">' +
        '<span class="api-doc-card-name">' + group.name + '</span>' +
        '<span class="api-doc-card-count">' + count + '개</span>' +
        '</div>' +
        '<div class="api-doc-card-desc">' + group.desc + '</div>' +
        '<div class="api-doc-card-badges">' + badges + '</div>' +
        '</div>';
}

})();
