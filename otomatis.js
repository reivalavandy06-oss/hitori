const cron = require('node-cron');
const fs = require('fs');

// Ganti dengan ID Grup atau Nomor tujuan kamu
const targetJid = '628xxx@s.whatsapp.net'; 

const fiturOtomatis = (naze) => {
    cron.schedule('* * * * *', async () => {
        try {
            // Baca database untuk cek ON/OFF & Wilayah (Hasil setsholat lewat WA)
            const db = JSON.parse(fs.readFileSync('./database.json'));
            if (db.status !== 'on') return;

            const now = new Date();
            const jamSekarang = now.toLocaleTimeString('id-ID', { 
                hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' 
            }).replace('.', ':');

            // Ambil Jadwal (Method 20 = Kemenag RI 20°)
            const response = await fetch(`https://api.aladhan.com/v1/timingsByAddress?address=${db.wilayah},Indonesia&method=20`);
            const res = await response.json();
            const t = res.data.timings;

            const jadwal = { 
                "Subuh": t.Fajr, 
                "Dzuhur": t.Dhuhr, 
                "Ashar": t.Asr, 
                "Maghrib": t.Maghrib, 
                "Isya": t.Isha 
            };

            if (Object.values(jadwal).includes(jamSekarang)) {
                const namaSholat = Object.keys(jadwal).find(key => jadwal[key] === jamSekarang);
                
                // Daftar Kata Mutiara Islami
                const quotes = [
                    "✨ *\"Sesungguhnya sholat itu adalah kewajiban yang ditentukan waktunya atas orang-orang yang beriman.\"* (QS. An-Nisa: 103)",
                    "🌟 *\"Amal yang paling dicintai Allah adalah shalat pada waktunya.\"* — HR. Bukhari",
                    "🌈 *\"Perbaiki shalatmu, maka Allah akan mempermudah urusanmu.\"*",
                    "💧 *\"Sabar dan sholatlah sebagai penolongmu.\"* — QS. Al-Baqarah: 45",
                    "🌙 *\"Jangan biarkan duniamu membuatmu lupa pada sujudmu.\"*"
                ];
                const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

                // Susun Pesan dengan Full Emoji
                let teks = `───  ⭐ *ADZAN REMINDER* ⭐  ───\n\n`;
                teks += `📢 *Waktu Sholat ${namaSholat} Telah Tiba!* 🕌\n\n`;
                teks += `📌 *Wilayah:* ${db.wilayah}\n`;
                teks += `⏰ *Jam:* ${jamSekarang} WIB\n\n`;
                teks += `${randomQuote}\n\n`;
                teks += `🌊 _Segeralah ambil air wudhu dan tunaikan sholat berjamaah. Tinggalkan sejenak urusan dunia demi panggilan-Nya._\n\n`;
                teks += `👋 *Selamat Beribadah, Kak!* 😇`;

                // Kirim dengan Gambar Besar (ExternalAdReply)
                await naze.sendMessage(targetJid, { 
                    text: teks,
                    contextInfo: {
                        externalAdReply: {
                            title: `🔔 Panggilan Sholat ${namaSholat}`,
                            body: `📍 Lokasi: ${db.wilayah}`,
                            thumbnailUrl: "https://telegra.ph/file/0c98f8ac25ac762f9247d.jpg", // Gambar Ka'bah/Masjid
                            sourceUrl: "https://whatsapp.com/channel/xxx", // Bisa link saluran/github
                            mediaType: 1,
                            renderLargerThumbnail: true, // Biar gambarnya GEDE
                            showAdAttribution: true
                        }
                    }
                });
                console.log(` ✅ [SUKSES] Adzan ${namaSholat} terkirim ke ${targetJid}`);
            }
        } catch (e) {
            console.error("❌ Error Fitur Otomatis:", e);
        }
    }, { timezone: "Asia/Jakarta" });
};

module.exports = { fiturOtomatis };
