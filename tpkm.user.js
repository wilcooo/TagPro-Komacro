// ==UserScript==
// @name         TagPro Komacro
// @description  Macro's // edit in-game // map-specific // no-script compatible // key combinations
// @author       Ko
// @version      2.1
// @include      *.koalabeast.com*
// @include      *.jukejuice.com*
// @include      *.newcompte.fr*
// @require      https://greasyfork.org/scripts/371240/code/TagPro%20Userscript%20Library.js
// @downloadURL  https://github.com/wilcooo/TagPro-Komacro/raw/master/tpkm.user.js
// @supportURL   https://www.reddit.com/message/compose/?to=Wilcooo
// @icon         https://github.com/wilcooo/TagPro-Komacro/raw/master/MacroKey.png
// @website      https://redd.it/no-post-yet
// @license      MIT
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      koalabeast.com
// ==/UserScript==

/* TODO

Disable input when composing a message

*/

(function(){



    // Show a notification if the script has been updated
    function update_notification(){
        if (GM_getValue('macros') && GM_getValue('version',0) < 2.0 ) {
            tpul.notify('Komacro has been updated: you can now reorder by dragging!', 'success', 12e3);
            GM_setValue('version', GM_info.script.version);
        }
    }



    const chars={8:"⌫",9:"↹",13:"↩",16:"⇧",17:"✲",18:"⎇",19:"❚❚",20:"⇪",27:"⎋",32:"␣",33:"⇞",34:"⇟",35:"⇲",36:"⇱",37:"◀",38:"▲",39:"▶",40:"▼",45:"⎀",46:"⌦",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",65:"A",66:"B",67:"C",68:"D",69:"E",70:"F",71:"G",72:"H",73:"I",74:"J",75:"K",76:"L",77:"M",78:"N",79:"O",80:"P",81:"Q",82:"R",83:"S",84:"T",85:"U",86:"V",87:"W",88:"X",89:"Y",90:"Z",91:navigator.platform.toLowerCase().includes("mac")?"⌘":"⊞",93:"≣",96:"0️⃣",97:"1️⃣",98:"2️⃣",99:"3️⃣",100:"4️⃣",101:"5️⃣",102:"6️⃣",103:"7️⃣",104:"8️⃣",105:"9️⃣",106:"✖️",107:"➕",109:"➖",110:"▣",111:"➗",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"⇭",145:"⇳",182:"💻",183:"🖩",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"};






    // =====STYLE SECTION=====



    // Create our own stylesheet to define the styles in:

    var style = document.createElement('style');
    document.head.appendChild(style);
    style.id = 'komacro-style';

    var styleSheet = style.sheet;

    // The 'type' button next to a macro
    styleSheet.insertRule(` .komacro-type { width: 100%; padding: 0; height: 37px; font-weight: bolder; color: black; }`);

    styleSheet.insertRule(` .komacro-type:active, .komacro-type:focus, .komacro-type:hover { background: darkseagreen; color: black; animation: unset; }`);

    // Put text on the type button
    styleSheet.insertRule(` .komacro-type[data-type=all]::after   { content: "all";   }`);
    styleSheet.insertRule(` .komacro-type[data-type=team]::after  { content: "team";  }`);
    styleSheet.insertRule(` .komacro-type[data-type=group]::after { content: "group"; }`);
    styleSheet.insertRule(` .komacro-type[data-type=mod]::after   { content: "mod";   }`);

    styleSheet.insertRule(` @keyframes teamcolors { from {background: #FFB5BD;} to {background: #CFCFFF;} }`);

    styleSheet.insertRule(` .komacro-type[data-type=all]   { background: white;  }`);
    styleSheet.insertRule(` .komacro-type[data-type=team]  { background: linear-gradient(135deg, #FF7F7F, #7F7FFF); }`);
    styleSheet.insertRule(` .komacro-type[data-type=group] { background: #E7E700; }`);
    styleSheet.insertRule(` .komacro-type[data-type=mod]   { background: #00B900; }`);

    styleSheet.insertRule(` .komacro-combo::placeholder { font-size: small; font-style: italic; }`);

    styleSheet.insertRule(` .komacro-del:hover, .komacro-del:active, .komacro-del:focus { background: darkred; }`);

    styleSheet.insertRule(` #Komacro_wrapper [draggable=true] { cursor: move; transition: padding .3s, background .3s, border .3s, box-shadow .3s; }`);

    styleSheet.insertRule(` .komacro-dragging { background: #CDDC39; border-radius: 3px; border: 1px solid #827717; box-shadow: 0 3px #827717; padding: 10px 0; }`);





    // =====SOME FUNCTIONS=====



    // Get all existing maps through the TagPro JSON api

    var maps = new Promise(function(resolve,reject){

        if (GM_getValue('maps')) resolve(GM_getValue('maps'));

        GM_xmlhttpRequest({
            method: "GET",
            url: "http://" + location.hostname + "/maps.json",
            onload: function(response) {
                var maps = JSON.parse(response.responseText);
                resolve(maps);
                GM_setValue('maps',maps);
            },
            onerror: reject
        });
    });

    // Update the maps in the selection boxes
    // f.e. after changing the "distinguish mirrored" option

    function update_maps() {
        maps.then(function(maps){

            [...settings.macrolist.getElementsByTagName("select")].forEach( function(select) {
                select.innerHTML = '<option value="null">all maps</option>' });

            for (var category of [maps.rotation, maps.retired]) {
                for (var mapobj of category) {

                    if (!show_mirrored && mapobj.key.endsWith("_Mirrored")) continue;

                    let option = document.createElement("option");
                    option.innerText = mapobj.name;
                    option.value = mapobj.key;

                    [...settings.macrolist.getElementsByTagName("select")].forEach(function(select){
                        select.add(option.cloneNode(true));
                        select.value = select.parentElement.parentElement.macro.map || null;
                    });
                }
            }
        });
    }


    // Save all macros in Tamper/Grease monkey

    function save_macros(){GM_setValue("macros",macros);}


    // Convert a macro to a few characters that we can display

    function visual_macro(macro) {
        var combo = [];

        if (macro.ctrlKey) combo.push(chars[17]);
        if (macro.shiftKey) combo.push(chars[16]);
        if (macro.altKey) combo.push(chars[18]);
        if (macro.metaKey) combo.push(chars[91]);
        combo.push(chars[macro.keyCode]);

        return combo.join(" ");
    }


    // Capture macro's that are typed into the box

    function capture_macro(keyevent){

        keyevent.preventDefault();

        var macro = keyevent.target.parentElement.parentElement.macro;

        macro.keyCode = keyevent.keyCode;
        macro.shiftKey = keyevent.shiftKey && keyevent.keyCode != 16;
        macro.ctrlKey = keyevent.ctrlKey && keyevent.keyCode != 17;
        macro.altKey = keyevent.altKey && keyevent.keyCode != 18;
        macro.metaKey = keyevent.metaKey && keyevent.keyCode != 91;
        macro.location = keyevent.location;

        save_macros();

        keyevent.target.value = visual_macro(macro);
    }



    var dragging = null;

    function ondragstart() {
        dragging = this;
        this.classList.add('komacro-dragging');
    }

    function ondragend() {
        dragging = this;
        this.classList.remove('komacro-dragging');
    }

    function ondragover() {
        if (this.parentNode !== dragging.parentNode) return;

        if (this == dragging) return;

        const old_pos = [...dragging.parentNode.children].indexOf(dragging);
        const new_pos = [...this.parentNode.children].indexOf(this);

        if (new_pos < old_pos) this.parentNode.insertBefore(dragging, this);
        else this.parentNode.insertBefore(dragging, this.nextSibling);

        let old_i = macros.indexOf(dragging.macro);
        let new_i = macros.indexOf(this.macro);
        return macros.splice(new_i, 0, macros.splice(old_i,1)[0]);
    }

    // Create a new macro entry in the config panel.
    // Either based on an existing macro, or a new line

    function create_macro(macro){

        // If it's a new macro
        if (!macro) {
            macro = {
                type: 'team',
                map: current_map,
            };
            if (!show_mirrored && current_map)
                macro.map = current_map.replace('_Mirrored','');
            macros.unshift(macro);
            save_macros();
        }

        var entry = document.createElement('div');
        entry.className = "form-group";

        // Dragging
        entry.draggable = true;
        entry.ondragstart = ondragstart;
        entry.ondragend = ondragend;
        entry.ondragover = ondragover;

        entry.macro = macro;

        entry.innerHTML = `
            <div class="col-xs-1"><button class="btn btn-default komacro-type"></div>
            <div class="col-xs-2"><select class="form-control"><option value="null">all maps</option></select></div>
            <div class="col-xs-2"><input type="text" readonly placeholder="type a macro..." autocomplete="off" class="form-control komacro-combo"></div>
            <div class="col-xs-6"><input type="text" autocomplete="off" class="form-control"></div>
            <div class="col-xs-1"><input type="button" value="X" class="btn btn-default komacro-del" style="width:100%;"></div>`;

        var [type,map,combo,message,remove] = [...entry.children].map(a=>a.firstElementChild);

        type.dataset.type = macro.type || 'all';
        map.value = macro.map || null;
        combo.value = visual_macro(macro);
        message.value = macro.message || '';

        type.onclick = function(){
            var types = ["all","team","group","mod","all"];
            this.dataset.type = types[types.indexOf(this.dataset.type) + 1];
            this.parentElement.parentElement.macro.type = this.dataset.type;
            save_macros();
            this.blur();
        }

        map.onchange = function(){
            this.parentElement.parentElement.macro.map = this.value;
            save_macros();
        }

        combo.onkeydown = capture_macro;

        combo.onfocus = function(){
            this.value = '';
            // Disable movement while composing a macro
            if (tagpro) tagpro.disableControls = true;
        }

        combo.onblur = function(){
            this.value = visual_macro(this.parentElement.parentElement.macro);
            if (tagpro) tagpro.disableControls = false;
        }

        message.onchange = function(){
            this.parentElement.parentElement.macro.message = this.value;
            save_macros();
        }

        message.onfocus = function(){ if (tagpro) tagpro.disableControls = true; }
        message.onblur = function(){ if (tagpro) tagpro.disableControls = false; }

        // Disable movement while composing a message
        message.onfocus = function(){ if (tagpro) tagpro.disableControls = true; }
        message.onblur = function(){ if (tagpro) tagpro.disableControls = false; }

        remove.onclick = function(){
            entry.remove();
            macros.splice(macros.indexOf(this.parentElement.parentElement.macro),1);
            save_macros();
        }

        return entry;

    }





    // =====SETTINGS SECTION=====



    // I use tpul for this userscripts' options.
    // see: https://github.com/wilcooo/TagPro-UserscriptLibrary


    var settings = tpul.settings.addSettings({
        id: 'Komacro',
        title: "Configure Komacro",
        tooltipText: "Komacro",
        icon: "https://github.com/wilcooo/TagPro-Komacro/raw/master/MacroKey.png",

        buttons: ['close','reset'],

        fields: {
            show_mirrored: {
                type: 'checkbox',
                default: false,
                section: ['',"You can drag your Komacro's to reorder them."],
                label: "Distinguish mirrored maps:",
            }
        },

        events: {
            open: function() {

                // Add all saved macros to this config panel when it opens...

                var panel = document.getElementById("Komacro_wrapper");

                var macrolist = this.macrolist = document.createElement("div");
                panel.appendChild(this.macrolist);

                for (var macro of macros) macrolist.appendChild(create_macro(macro));
                update_maps();

                var new_btn = document.createElement("button");
                new_btn.className = "btn btn-primary";
                new_btn.style = "right: 30px; position: absolute;";
                new_btn.innerText = "New Komacro";
                document.getElementById('Komacro_show_mirrored_var').appendChild(new_btn);

                new_btn.onclick = function(){
                    macrolist.insertBefore(create_macro(), macrolist.firstChild);
                    update_maps();
                }

                document.getElementById("Komacro_field_show_mirrored").onchange = function(){
                    settings.save();
                    show_mirrored = settings.get('show_mirrored');
                    update_maps();
                }

                update_notification();
            },

            close: function(){
                // By default, 'options canceled' is notified. We overwrite this notification directly after.
                setTimeout(tpul.notify,0,'Your Komacro\'s are saved!','success');
            },

            reset: function(){
                if (confirm("This will delete ALL your Komacro's!")) {
                    macros = []; save_macros();
                    this.macrolist.innerHTML = "";
                    setTimeout(tpul.notify,0,'All your Komacro\'s are deleted','warning');
                } else {
                    setTimeout(tpul.notify,0,'Nothing happened :)','warning');
                }
            },
        }
    });

    var show_mirrored = settings.get('show_mirrored');





    // =====LOGIC SECTION=====



    var macros = GM_getValue('macros', [

        // The default komacros:

        {keyCode: 71, message: "gg"},
        {keyCode: 71, shiftKey: true, message: "GG"},
        {keyCode: 72, type: "team", message: "Handing off!"},
        {keyCode: 72, type: "team", shiftKey: true, message: "On regrab"},
        {keyCode: 72, shiftKey: true, ctrlKey: true, altKey: true, map: "teamwork", message: "This map is awesome!"},
        {keyCode: 72, shiftKey: true, ctrlKey: true, altKey: true, map: "bomber", message: "Oh no.. not this map..."},
        {keyCode: 66, type: "group", message: "Back to group"},
        {keyCode: 82, type: "team", message: "We need someone on regrab!"},
        {keyCode: 77, type: "mod", message: "Please stop doing that."},

    ]);

    // All possible options:
    // keyCode, location, altKey, ctrlKey, shiftKey, metaKey, map, type, message




    var current_map = null;

    // When in a game:
    if (location.port) {


        // Find out what map is being played

        if (tagpro && !tagpro.map) {
            // Method 1: using the TagPro API
            // Preferable since it's the quickest

            tagpro.ready(function() {
                tagpro.socket.on('map', function(map) {
                    maps.then(function(maps){
                        var mapobj = maps.rotation.find(m=> m.author == map.info.author && m.name == map.info.name);
                        if (mapobj) current_map = mapobj.key;
                    });
                });
            });

        } else {
            // Method 2: in case of no-script
            // or if the 'map' event has been received before we could intercept it.

            var mapInfo = document.getElementById('mapInfo');

            (function getMapFromDom(i){

                // This will be tried 2 times per second for max. 10 seconds
                if (i > 20) throw 'Komacro couldn\'t find out what map is being played';

                var map = mapInfo.innerText.match(/Map: (.*) by (.*)/);

                if (!map) setTimeout(getMapFromDom, 500, ++i);

                maps.then(function(maps){
                    var mapobj = maps.rotation.find(m=> m.author == map[2] && m.name == map[1]);
                    if (mapobj) current_map = mapobj.key;
                });

            })(0);
        }



        // Define how to chat

        var chatbox = document.getElementById('chat');

        function sendChat(message, type='all'){
            // type: all/team/group/mod

            if (tagpro && tagpro.socket) {
                // Method 1: Emit a message using the socket.
                // Preferable since it has the most chance
                // to work with other scripts.

                if (type == 'group') tagpro.group && tagpro.group.socket.emit('chat', message);

                else tagpro.socket.emit('chat',{
                    message:message,
                    toAll:type!='team',
                    asMod:type=='mod',
                });

            } else {
                // Method 2: Send a message manually (because no-script)

                // Open the chat box:
                var open_chat = new Event("keydown");
                open_chat.keyCode = 'Komacro';
                switch (type) {
                    case 'team':
                        tagpro.keys.chatToTeam.push('Komacro');
                        document.dispatchEvent(open_chat);
                        tagpro.keys.chatToTeam.pop();
                        break;
                    case 'group':
                        tagpro.keys.chatToGroup.push('Komacro');
                        document.dispatchEvent(open_chat);
                        tagpro.keys.chatToGroup.pop();
                        break;
                    case 'mod':
                        tagpro.keys.chatAsMod.push('Komacro');
                        document.dispatchEvent(open_chat);
                        tagpro.keys.chatAsMod.pop();
                        break;
                    case 'all':
                    default:
                        tagpro.keys.chatToAll.push('Komacro');
                        document.dispatchEvent(open_chat);
                        tagpro.keys.chatToAll.pop();
                        break;
                }

                // Type out the message:
                chatbox.value = message;

                // Send the chat
                var send_chat = new Event("keydown");
                send_chat.keyCode = 'Komacro';
                tagpro.keys.sendChat.push('Komacro');
                document.dispatchEvent(send_chat);
                tagpro.keys.sendChat.pop();
            }
        }



        // Listening/handling macros:



        var ignore_ctrlKey = false,
            ignore_shiftKey = false,
            ignore_altKey = false,
            ignore_metaKey = false;

        function handleMacro(keyevent) {

            // If we're recording a macro: return;
            if (keyevent.target.classList.contains('komacro-combo')) return;

            // While the controls are disabled: return;
            // (This is usually when typing a chat message or changing your name)
            if (tagpro && tagpro.disableControls) return;

            // When no-script is enabled, we can detect the chat box and name-change box like this:
            if (["chat", "name"].includes( keyevent.target.id )) return;

            var global_macro = null;

            // Find a matching macro

            for (var macro of macros) {

                if (macro.keyCode == keyevent.keyCode &&
                    (!macro.location || macro.location == keyevent.location) &&
                    !!macro.ctrlKey == !!keyevent.ctrlKey &&
                    !!macro.shiftKey == !!keyevent.shiftKey &&
                    !!macro.altKey == !!keyevent.altKey &&
                    !!macro.metaKey == !!keyevent.metaKey) {

                    // Send a macro of which the map matches:

                    if (macro.map && (macro.map == current_map ||
                        !show_mirrored && macro.map.replace('_Mirrored','') == current_map.replace('_Mirrored','') )) {
                        keyevent.preventDefault();
                        sendChat(macro.message, macro.type);
                        return;
                    }

                    // Save the global macro, but don't send it yet.
                    // because we could find another map-specific macro.

                    if (!macro.map || macro.map == "null") global_macro = macro;
                }
            }

            // No map-specific macro has been found.
            // We can send the global macro (if we found one)

            if (global_macro) {
                keyevent.preventDefault();
                sendChat(global_macro.message, global_macro.type);
                return;
            }
        }






        // Wait for any (non-modifier) key to be pressed

        document.addEventListener('keydown', function(keydown) {

            // Pressing down a modifier key is ignored,
            // as they could be used to modify another key.
            // Instead we look at their keyup event later.
            if (['Control','Shift','Alt','Meta'].includes(keydown.key)) return;

            // Remember what modifier keys are used during this event,
            // so that we know to ignore their next keyup.
            ignore_ctrlKey = keydown.ctrlKey;
            ignore_shiftKey = keydown.shiftKey;
            ignore_altKey = keydown.altKey;
            ignore_metaKey = keydown.metaKey;

            handleMacro(keydown);
        });


        // Wait for any modifier to be released:

        document.addEventListener('keyup', function(keyup) {

            // This time; ignore non-modifier keys
            if ( ! ['Control','Shift','Alt','Meta'].includes(keyup.key)) return;

            // Ignore modifiers that have been used to modify other keys
            if (ignore_ctrlKey  && keyup.key == 'Control' ||
                ignore_shiftKey && keyup.key == 'Shift' ||
                ignore_altKey   && keyup.key == 'Alt' ||
                ignore_metaKey  && keyup.key == 'Meta') return;

            // Remember what modifier keys are used during this event,
            // so that we know to ignore their next keyup.
            ignore_ctrlKey  |= keyup.ctrlKey;
            ignore_shiftKey |= keyup.shiftKey;
            ignore_altKey   |= keyup.altKey;
            ignore_metaKey  |= keyup.metaKey;

            handleMacro(keyup);
        });
    }
})();
