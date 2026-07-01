/*
 * API Schema Renderer Macro
 * Reads schema data from a JSON tiddler and renders HTML
 * Usage: <<renderSchema dataTiddler:"Project:daiso-book-API-Schemas-Data" schemaName:"BookRespDTO">>
 */

(function(){

if(typeof window !== "undefined" && !window._schemaListenerAdded) {
    window._schemaListenerAdded = true;

    setTimeout(function() {
        document.addEventListener("click", function(e) {
            var t = e.target;
            if (!t.closest) return;

            var btn = t.closest("[data-schema-toggle]");
            var pop = t.closest("[data-schema-popup]");
            var cls = t.closest("[data-schema-close]");
            var ovl = t.closest("[data-schema-overlay]");

            if (btn) {
                e.preventDefault();
                var sid = btn.getAttribute("data-schema-toggle");
                var el = document.getElementById(sid);
                if (!el) return;
                if (el.style.display === "none" || el.style.display === "") {
                    el.style.display = "block";
                    btn.textContent = btn.textContent.replace("\u25b8", "\u25be");
                } else {
                    el.style.display = "none";
                    btn.textContent = btn.textContent.replace("\u25be", "\u25b8");
                }
            }
            if (pop) {
                e.preventDefault();
                var pid = pop.getAttribute("data-schema-popup");
                var el = document.getElementById(pid);
                if (el) el.style.display = "flex";
            }
            if (cls) {
                e.preventDefault();
                var pid = cls.getAttribute("data-schema-close");
                var el = document.getElementById(pid);
                if (el) el.style.display = "none";
            }
            if (ovl) {
                e.preventDefault();
                var pid = ovl.getAttribute("data-schema-overlay");
                var el = document.getElementById(pid);
                if (el) el.style.display = "none";
            }
        });
    }, 100);
}

exports.name = "renderSchema";
exports.params = [
    {name: "dataTiddler"},
    {name: "schemaName"},
    {name: "depth", default: "0"}
];

exports.run = function(dataTiddler, schemaName, depth) {
    depth = parseInt(depth) || 0;
    try {
        var rawData = $tw.wiki.getTiddlerText(dataTiddler);
        if (!rawData) return "<em>Schema data not found: " + dataTiddler + "</em>";
        var allSchemas = JSON.parse(rawData);
        var fields = allSchemas[schemaName];
        if (!fields) return "<em>Schema not found: " + schemaName + "</em>";
        return renderFields(fields, allSchemas, schemaName, depth);
    } catch(e) {
        return "<em>Error: " + e.message + "</em>";
    }
};

function badge(type, format, enumVals) {
    if (enumVals && enumVals.length) {
        return '<span class="schema-type">string</span><span class="schema-badge schema-badge-enum">enum</span><span class="schema-type">' + enumVals.join(", ") + '</span>';
    }
    if (format === "int64" || format === "int32") return '<span class="schema-type">integer</span><span class="schema-badge">' + format + '</span>';
    if (format === "date-time") return '<span class="schema-type">string</span><span class="schema-badge schema-badge-date">date-time</span>';
    if (format === "date") return '<span class="schema-type">string</span><span class="schema-badge schema-badge-date">date</span>';
    if (format === "binary") return '<span class="schema-type">string</span><span class="schema-badge schema-badge-date">binary</span>';
    if (type === "boolean") return '<span class="schema-type">boolean</span><span class="schema-badge schema-badge-boolean">boolean</span>';
    if (type === "number") return '<span class="schema-type">number</span><span class="schema-badge schema-badge-string">number</span>';
    if (type === "string") return '<span class="schema-type">string</span><span class="schema-badge schema-badge-string">string</span>';
    if (type === "integer") return '<span class="schema-type">integer</span>';
    return '<span class="schema-type">' + (type || "") + '</span>';
}

function renderFields(fields, allSchemas, parentId, depth) {
    var html = [];
    var keys = Object.keys(fields);
    for (var i = 0; i < keys.length; i++) {
        html.push(renderField(keys[i], fields[keys[i]], allSchemas, parentId, depth));
    }
    return html.join("");
}

function renderField(fname, fi, allSchemas, parentId, depth) {
    if (fi["$ref"] && !fi["type"]) {
        var ref = fi["$ref"];
        var refFields = allSchemas[ref];
        if (depth < 2 && refFields) {
            var sid = "sjs-" + parentId + "-" + fname;
            return '<div class="schema-field"><span class="schema-field-name">' + fname + '</span>' +
                '<button class="api-schema-link" data-schema-toggle="' + sid + '">' + ref + ' \u25b8</button>' +
                '</div>' +
                '<div class="schema-nested" id="' + sid + '" style="display:none">' +
                renderFields(refFields, allSchemas, parentId + "-" + fname, depth + 1) +
                '</div>';
        } else {
            var pid = "spop-" + parentId + "-" + fname;
            return '<div class="schema-field"><span class="schema-field-name">' + fname + '</span>' +
                '<button class="api-schema-link" data-schema-popup="' + pid + '">\u2192 ' + ref + '</button>' +
                '</div>' +
                renderPopup(ref, refFields || {}, allSchemas, pid, depth + 1);
        }
    }

    if (fi["type"] === "array" && fi["$ref"]) {
        var ref = fi["$ref"];
        var refFields = allSchemas[ref];
        if (depth < 2 && refFields) {
            var sid = "sjs-" + parentId + "-" + fname;
            return '<div class="schema-field"><span class="schema-field-name">' + fname + '</span>' +
                '<span class="schema-array-label">array</span>' +
                '<button class="api-schema-link" data-schema-toggle="' + sid + '">' + ref + ' \u25b8</button>' +
                '</div>' +
                '<div class="schema-nested" id="' + sid + '" style="display:none">' +
                renderFields(refFields, allSchemas, parentId + "-" + fname, depth + 1) +
                '</div>';
        } else {
            var pid = "spop-" + parentId + "-" + fname;
            return '<div class="schema-field"><span class="schema-field-name">' + fname + '</span>' +
                '<span class="schema-array-label">array</span>' +
                '<button class="api-schema-link" data-schema-popup="' + pid + '">\u2192 ' + ref + '</button>' +
                '</div>' +
                renderPopup(ref, refFields || {}, allSchemas, pid, depth + 1);
        }
    }

    if (fi["type"] === "array" && fi["items"]) {
        var fmt = fi["items"]["format"] || "";
        var typ = fi["items"]["type"] || "string";
        return '<div class="schema-field"><span class="schema-field-name">' + fname + '</span>' +
            '<span class="schema-array-label">array</span>' + badge(typ, fmt, []) + '</div>';
    }

    return '<div class="schema-field"><span class="schema-field-name">' + fname + '</span>' +
        badge(fi["type"], fi["format"], fi["enum"]) + '</div>';
}

function renderPopup(ref, refFields, allSchemas, pid, depth) {
    var inner = renderFields(refFields, allSchemas, pid, depth);
    return '<div id="' + pid + '" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;z-index:9998;align-items:center;justify-content:center;">' +
        '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);" data-schema-overlay="' + pid + '"></div>' +
        '<div style="position:relative;background:#2a2a2a;border:1px solid #444;border-radius:8px;padding:20px;z-index:9999;min-width:300px;max-width:500px;max-height:70vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,0.6);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid #444;padding-bottom:8px;">' +
        '<span style="font-weight:bold;color:#d4d4d4;font-family:monospace;">' + ref + '</span>' +
        '<button style="background:transparent;border:none;color:#aaa;cursor:pointer;font-size:16px;" data-schema-close="' + pid + '">\u2715</button>' +
        '</div><div class="schema-body">' + inner + '</div></div></div>';
}

})();
