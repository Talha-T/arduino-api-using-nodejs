const express = require('express'); // Kütüphanemizi import ediyoruz.
const http = require('http');
const app = express(); // app, express server'imiz oluyor.
const server = http.createServer(app);
const io = require('socket.io')(server); // Soket serverimiz.


// Son gelen değer, varsayılan olarak boş
let lastData = {
    key: "mesafe",
    value: "Henüz değer yok!"
};

// Soket serverimize bağlantı olunca verdiğimiz fonksiyon çalışacak.
io.on('connection', function (socket) {
    console.log("Bir soket bağlandı!!");
    // Bir istemciden 'data' mesajı gelirse, bu fonksiyon çalışacak.
    socket.on('data', function (data) {
        console.log("Gelen data: " + data);
        // Artık gelen verimiz 'data' adlı değişkende.
        lastData = data;
        io.emit("received_data", lastData);
    });
});

// Sayfamıza gidilince çalışacak fonksiyon.
app.get("/", function (request, response) {
    // Değeri yazdır.
    response.sendFile(__dirname + "/index.html");
});

server.listen(3000); // Server'imizi 3000. portta başlat.