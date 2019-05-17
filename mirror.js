var receiverURL = 'ws://' + location.host + '/receiver';

window.addEventListener('DOMContentLoaded', function() {
    var base;

    var mirror = new TreeMirror(document, {
        createElement: function(tagName) {
            if (tagName === 'SCRIPT') {
                var node = document.createElement('NO-SCRIPT');
                node.style.display = 'none';
                return node;
            }

            if (tagName === 'HEAD') {
                var node = document.createElement('HEAD');
                node.appendChild(document.createElement('BASE'));
                node.firstChild.href = base;
                return node;
            }
        }
    });

    var socket = new WebSocket(receiverURL);

    function clearPage() {
        while (document.firstChild) {
            document.removeChild(document.firstChild);
        }
    }

    function handleMessage(msg) {
        if (msg.clear)
            clearPage();
        else if (msg.base)
            base = msg.base;
        else
            mirror[msg.f].apply(mirror, msg.args);
    }

    socket.onmessage = function(event) {
        var msg = JSON.parse(event.data);
        if (msg instanceof Array) {
            msg.forEach(function(subMessage) {
                handleMessage(JSON.parse(subMessage));
            });
        } else {
            handleMessage(msg);
        }
    }

    socket.onclose = function() {
        socket = new WebSocket(receiverURL);
    }
});
