var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
        
    };
    var addPolygonToCAnvas = function(pta){

        var canvas = document.getElementById("canvas");
        var c2 = canvas.getContext("2d");
        var Array =JSON.parse(pta);
        c2.fillStyle = '#f00';
        c2.beginPath();
        c2.moveTo(Array[0].x,Array[0].y);
        for (var i=1;i<Array.length;i++) {
            c2.lineTo(Array[i].x,Array[i].y);
        }
        c2.closePath();
        c2.fill();

    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        var id = document.getElementById("frame").value.toString();
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, async function (frame) {

            console.log('Connected: ' + frame);
            await stompClient.subscribe("/topic/newpoint." + id, function (message) {
                var pt = JSON.parse(message.body);
                addPointToCanvas(pt);

            });
            await stompClient.subscribe("/topic/newpolygon." + id, function (message) {
                addPolygonToCAnvas(message.body);

            });
        });

    };

    var setConnected = function(connected) {
        $("#connect").prop("disabled", connected);
        $("#disconnect").prop("disabled", !connected);
        if (connected) {
            $("#canvas").show();
        }
        else {
            $("#canvas").hide();
        }
        
    };

    var sendPoint= function(point){
        var id = document.getElementById("frame").value.toString();
         stompClient.send("/app/newpoint."+id, {}, JSON.stringify(point));
    };
    
    var eventCanvas = function(event) {
        let coordenadas = getMousePosition(event);
        app.publishPoint(coordenadas.x,coordenadas.y);
    };
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            //websocket connection
            connectAndSubscribe();
            setConnected(true);
            if(window.PointerEvent){
                canvas.addEventListener("pointerdown", eventCanvas);
            }else{
                canvas.addEventListener("mousedown", eventCanvas);
            }
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            sendPoint(pt);

            //publicar el evento
        },

        disconnect: function () {

            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
            var canvas = document.getElementById("canvas");
            var ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

})();

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $( "#connect" ).click(function() { app.init(); });
    $( "#disconnect" ).click(function() { app.disconnect(); });

});
