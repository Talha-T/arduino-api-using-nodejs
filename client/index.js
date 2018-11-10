const serialPort = require('serialport'); // Kütühanemizi import ediyoruz.
const socketClient = require('socket.io-client'); // Soket için istemci kütüphanemiz.

const socket = socketClient('http://localhost:3000/'); // Soketimizi sunucu adresine bağlıyoruz.

// Sunucuda yazdığımız gibi, bağlandığımızda ve bağlantı koptuğunda çalışacak kodlar.
socket.on('connect', function () {
    console.log("Soket bağlandı!!");
});

socket.on('disconnect', function () {
    console.log("Soket bağlantısı koptu!");
});

// Ana fonksiyonumuz
// Async (eşzamansız) olmasının sebebi, await kullanmamız.
// Kısacası await kullanmak için async olması lazım ve await o işlem bitene kadar kodu "bekletiyor".
// Daha fazla bilgi için Javascript'te await/async'i araştırın.
async function readFromArduino() {
    const delimiter = '\n'; // Her yeni satır gördüğünde gelen veriyi ayır.
    const ports = await serialPort.list(); // Bütün seri portları listele.

    if (ports.length < 1) { // Eğer 1'den az port varsa
        throw new Error("Hiçbir seri port bulunamadı!"); // Kodu hata ile bitir.
    }

    // Portun açılmasını 'bekliyoruz'.
    const port = new serialPort(ports[0].comName, {
        baudRate: 9600, // doğru baudrate'yi girin,
        autoOpen: true, // Port ile otomatik bağlantı sağlansın
    });

    // Port'tan hata gelince kodu hata ile bitir.
    port.on('error', function (error) {
        throw new Error(error);
    });

    // Port'a data gelince çalışacak fonksiyonu kütüphaneye veriyoruz.
    port.on('data', function (data) {
        // Bu fonksiyon veri gelince kütüphane tarafından çağrılacak.
        // Gelen veriyi metine çeviriyoruz
        const dataText = data.toString().replace('\n', ''); // Boş satırı siliyoruz.
        console.log(dataText); // Gelen veriyi yazdırıyoruz.
        // Gelen veride : karakteri olup olmadığını kontrol ediyoruz.
        if (dataText.includes(":")) {
            // Şimdi veriyi :'dan sağa ve sola ayırabiliriz.
            const [key, value] = dataText.split(':');
            // mesafe:150 örneğini düşünelim. Burada key = "mesafe", value="150" oldu.

            // Üstteki satır aslında şu kodların eşiti:
            /*
            const split = dataText.split(':');
            const key = split[0];
            const value = split[1];
            */

            // Artık veri ismini ve verinin değerini ayırt ettik, bu kodu şimdilik burada bırakıyoruz.
            // emit sunucuya veri göndermemizi sağlıyor.
            // Data adlı olaya, key ve value'yi içeren bir obje yolladık.
            socket.emit('data', {
                key,
                value
            });
        } else {
            console.log("Gelen veride : yok!");
        }
    });

}

readFromArduino();