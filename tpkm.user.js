// ==UserScript==
// @name         TagPro Komacro
// @description  Macro's // edit in-game // map-specific // no-script compatible // key combinations
// @author       Ko
// @version      0.1
// @include      *.koalabeast.com:*
// @include      *.jukejuice.com:*
// @include      *.newcompte.fr:*
// @downloadURL  https://github.com/wilcooo/TagPro-Komacro/raw/master/tpkm.user.js
// @supportURL   https://www.reddit.com/message/compose/?to=Wilcooo
// @website      https://redd.it/no-post-yet
// @license      MIT
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==




/* Structure of the configuration modal: (for reference)

div#Komacro-config-wrapper

    div#Komacro-config-panel

*/




(function(){

    // =====STYLE SECTION=====


    // Create our own stylesheet to define the styles in:

    var style = document.createElement('style');
    document.head.appendChild(style);
    var styleSheet = style.sheet;

    styleSheet.insertRule(` #Komacro-config-wrapper {
position: fixed;
z-index: 1;
left: 0;
top: 0;
width: 100%;
height: 100%;
overflow: auto;
background-color: rgba(0,0,0,0.4);

transition: opacity .5s;
opacity: 0;
pointer-events: none;
}`);

    styleSheet.insertRule(` #Komacro-config-wrapper.shown {
opacity: 1;
pointer-events: auto;
}`);

    styleSheet.insertRule(` #Komacro-config-panel {
width: 80%;
margin: auto;
position: relative;
padding: 20px;
border: 1px solid #888;

transition: top .5s;
top: 100%;
}`);

    styleSheet.insertRule(`.shown > #Komacro-config-panel {
top: 80%;
}`);

    // The open button
        styleSheet.insertRule(`#Komacro-open-button {
color: #aaa;
float: right;
cursor: pointer;
}`);

    styleSheet.insertRule(`#Komacro-open-button:hover, #Komacro-open-button:focus {
color: #000;
}`);

    /* The Close Button */
    styleSheet.insertRule(`#Komacro-close-button {
color: #aaa;
float: right;
cursor: pointer;
}`);

    styleSheet.insertRule(`#Komacro-close-button:hover, #Komacro-close-button:focus {
color: #000;
}`);

    // =====NOITCES ELYTS=====





    // =====DOM SECTION=====


    // The vanilla TagPro element that houses everything
    var game = document.getElementsByClassName('game')[0];

    var open_button = document.createElement('div');
    open_button.id = 'Komacro-open-button';
    game.appendChild(open_button);

    var config_wrapper = document.createElement('div');
    config_wrapper.id = 'Komacro-config-wrapper';
    game.appendChild(config_wrapper);

    var config_panel = document.createElement('div');
    config_panel.id = 'Komacro-config-panel';
    config_wrapper.appendChild(config_panel);

    var close_button = document.createElement('span');
    close_button.id = 'Komacro-close-button';
    close_button.innerText = '×';


    // =====NOITCES MOD=====





    // =====LOGIC SECTION: HANDLING MACROS=====



    var macros = GM_getValue('macros', [

        // Simplest macro: works on any map, defaults to all-chat
        {key: 'm', message: 'My bad...'},

        // Map-specific macro, which will override previous macro (with the same key)
        // The erder of these macros doesn't matter, map-specific macros are always prioritized.
        {key: 'm', map: {name: 'Wormy', author: 'Flail'}, message: 'My bad in Wormy...'},

        // All possible options: (map:false means any map)
        {key: 'h', altKey: false, ctrlKey: false, shiftKey: false, metaKey: false, map: false, type: 'all', message: 'Hello!'},
    ]);





    // Find out what map is being played:

    var current_map = {
        name: undefined,
        author: undefined,
    };

    if (tagpro && !tagpro.map) {
        // Method 1: using the TagPro API
        // Preferable since it's the quickest

        tagpro.ready(function() {
            tagpro.socket.on('map', function(map) {
                current_map = {
                    name: map.info.name,
                    author: map.info.author,
                };
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

            else current_map = {
                name: map[1],
                author: map[2],
            };
        })(0);
    }





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





    var ignore_ctrlKey = false,
        ignore_shiftKey = false,
        ignore_altKey = false,
        ignore_metaKey = false;

    function findMacro(keyevent) {

        // Remember what modifier keys are used during this event,
        // so that we know to ignore their next keyup.
        ignore_ctrlKey = keyevent.ctrlKey;
        ignore_shiftKey = keyevent.shiftKey;
        ignore_altKey = keyevent.altKey;
        ignore_metaKey = keyevent.metaKey;

        var global_macro = null;

        // Find a matching macro

        for (var macro of macros) {

            if (macro.key == keyevent.key &&
                macro.ctrlKey == keyevent.ctrlKey &&
                macro.shiftKey == keyevent.shiftKey &&
                macro.altKey == keyevent.altKey &&
                macro.metaKey == keyevent.metaKey) {

                // Send a macro of which the map matches:

                if (macro.map.name == current_map.name &&
                    macro.map.author == current_map.author) {
                    keyevent.preventDefault();
                    sendChat(macro.message, macro.type);
                    return;
                }

                // Save the global macro, but don't send it yet.
                // because we could find another map-specific macro.

                if (macro.map == null) global_macro = macro;
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





    function recordMacro(keyevent) {

        // Remember what modifier keys are used during this event,
        // so that we know to ignore their next keyup.
        ignore_ctrlKey = keyevent.ctrlKey;
        ignore_shiftKey = keyevent.shiftKey;
        ignore_altKey = keyevent.altKey;
        ignore_metaKey = keyevent.metaKey;

        var macro = {
            key: keyevent.Key,
            ctrlKey: keyevent.ctrlKey,
            shiftKey: keyevent.shiftKey,
            altKey: keyevent.altKey,
            metaKey: keyevent.metaKey,
        };

        var keystring =
            (keyevent.ctrlKey ? 'CTRL + ' : '') +
            (keyevent.shiftKey ? 'SHIFT + ' : '') +
            (keyevent.altKey ? 'ALT + ' : '') +
            (keyevent.metaKey ? 'META + ' : '') +
            keyevent.key.toUpperCase();

    }





    // Wait for any (non-modifier) key to be pressed

    document.addEventListener('keydown', function(keydown) {

        // Pressing down a modifier key is ignored,
        // as they could be used to modify another key.
        // Instead we look at their keyup event later.
        if (['Control','Shift','Alt','Meta'].includes(keydown.key)) return;

        if (recording) recordMacro(keydown);

        else findMacro(keydown);
    });





    // Wait for any modifier to be released:

    document.addEventListener('keyup', function(keyup) {

        // This time; ignore non-modifier keys
        if ( ! ['Control','Shift','Alt','Meta'].includes(keydown.key)) return;

        // Ignore modifiers that have been used to modify other keys
        if (ignore_ctrlKey && keyup.key == 'Control' ||
            ignore_shiftKey && keyup.key == 'Shift' ||
            ignore_altKey && keyup.key == 'Alt' ||
            ignore_metaKey && keyup.key == 'Meta') return;

        if (recording) recordMacro(keyup);

        else findMacro(keyup);
    });



    // =====SORCAM GNILDNAH :NOITCES CIGOL=====





    // =====LOGIC SECTION: CONFIG PANEL=====

    // OPENING AND CLOSING

    document.addEventListener('click', function(click) {

        // Close when clicking outside the panel, or on ×
        if ([config_wrapper, close_button].includes(click.target)) config_wrapper.classList.remove('shown');

        // Open when clicking the button: TODO
        if (open_button == click.target) config_wrapper.classList.add('shown');
    });

    document.addEventListener('wheel', function(wheel) {

        // Open when scrolling down
        if (wheel.deltaY > 0) config_wrapper.classList.add('shown');

        // Close when scrolling up far enough
        if (config_wrapper.scrollTop == 0 && wheel.deltaY < 0) config_wrapper.classList.remove('shown');
    });

    // =====LENAP GIFNOC :NOITCES CIGOL=====


})();
