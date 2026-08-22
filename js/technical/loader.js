// Load files

for (let file = 0; file < modInfo.modFiles.length; file++) {
    let script = document.createElement("script");
    script.setAttribute("src", "js/" + modInfo.modFiles[file]);
    script.setAttribute("async", "false");
    document.head.insertBefore(script, document.getElementById("temp"));
}

// for (file in modInfo.modFiles) {
//     let script = document.createElement("script");
//     script.setAttribute("src", "js/" + modInfo.modFiles[file]);
//     script.setAttribute("async", "false");
//     document.head.insertBefore(script, document.getElementById("temp"));
// }