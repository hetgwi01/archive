exports.name = "renderSchemaCard";
exports.params = [{name: "tiddler"}, {name: "desc"}];

exports.run = function(tiddler, desc) {
    var text = $tw.wiki.getTiddlerText(tiddler) || "";
    var count = (text.match(/class="api-card"/g) || []).length;
    return '<div class="api-doc-grid"><div class="api-doc-card" data-doc-navigate="' + tiddler + '">' +
        '<div class="api-doc-card-header">' +
        '<span class="api-doc-card-name">Data Schemas</span>' +
        '<span class="api-doc-card-count">' + count + '개</span>' +
        '</div>' +
        '<div class="api-doc-card-desc">' + (desc || "") + '</div>' +
        '</div></div>';
};
