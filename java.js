/* =========================================
   1. สั่งให้ทำงานเมื่อโหลดหน้าจอเสร็จ (DOMContentLoaded)
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    // สั่งให้ระบบ Journal เริ่มทำงาน
    initTradingJournal();
    
    // สั่งให้ระบบเช็คสถานะตลาดเริ่มทำงาน (ถ้ามีฟังก์ชันนี้)
    if (typeof updateMarketStatus === "function") {
        updateMarketStatus();
    }
});

/* =========================================
   2. ฟังก์ชันระบบ Trading Journal
   ========================================= */
function initTradingJournal() {
    const journalForm = document.getElementById('journal-form');
    const journalBody = document.getElementById('journal-body');

    if (!journalForm || !journalBody) return;

    // --- 1. โหลดข้อมูลจากเครื่องมาแสดงเมื่อเปิดหน้าเว็บ ---
    loadJournalData();

    journalForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // สร้าง ID เฉพาะตัวด้วยเวลา (Timestamp) เพื่อใช้ระบุแถวที่จะลบ
        const id = Date.now(); 
        const date = document.getElementById('date').value;
        const pair = document.getElementById('pair').value;
        const side = document.getElementById('side').value;
        const setup = document.getElementById('setup').value;
        const rr = document.getElementById('rr').value;
        const result = document.getElementById('result').value;
        const note = document.getElementById('note').value;
        const imageFile = document.getElementById('trade-image').files[0];

        const reader = new FileReader();
        reader.onload = function(event) {
            const imgSrc = imageFile ? event.target.result : null;
            const tradeData = { id, date, pair, side, setup, rr, result, note, imgSrc };

            renderRow(tradeData); // แสดงบนหน้าเว็บ
            saveTradeToLocal(tradeData); // บันทึกลงเครื่อง
            journalForm.reset();
        };

        if (imageFile) {
            reader.readAsDataURL(imageFile);
        } else {
            reader.onload({ target: { result: null } });
        }
    });

    // --- 2. ฟังก์ชันแสดงผลแถว (เพิ่มปุ่มลบ) ---
    function renderRow(data) {
        const row = document.createElement('tr');
        row.setAttribute('data-id', data.id); // ใส่ ID ไว้ที่แถว
        
        const resClass = data.result.includes('WIN') ? 'res-win' : 'res-loss';
        const sideColor = data.side.includes('BUY') ? '#26a69a' : '#ef5350';
        const finalImg = data.imgSrc ? data.imgSrc : 'https://via.placeholder.com/80x50?text=No+Chart';

        row.innerHTML = `
            <td>${data.date}</td>
            <td><strong>${data.pair}</strong></td>
            <td style="color: ${sideColor}; font-weight: bold;">${data.side}</td>
            <td>${data.setup}</td>
            <td>${data.rr}</td>
            <td><span class="${resClass}">${data.result}</span></td>
            <td><img src="${finalImg}" class="trade-thumb" alt="Chart" onclick="window.open(this.src)"></td>
            <td><small>${data.note}</small></td>
            <td><button class="btn-delete" onclick="deleteTrade(${data.id})">🗑️</button></td>
        `;
        journalBody.insertBefore(row, journalBody.firstChild);
    }

    // --- 3. ระบบบันทึกลงเครื่อง ---
    function saveTradeToLocal(data) {
        let trades = JSON.parse(localStorage.getItem('myTrades')) || [];
        trades.push(data);
        localStorage.setItem('myTrades', JSON.stringify(trades));
    }

    // --- 4. ระบบโหลดข้อมูล ---
    function loadJournalData() {
        let trades = JSON.parse(localStorage.getItem('myTrades')) || [];
        // เรียงจากเก่าไปใหม่เพื่อให้ตอนแสดงผล insertBefore ทำงานถูกต้อง
        trades.forEach(trade => renderRow(trade));
    }
}

// --- 5. ฟังก์ชันลบข้อมูล (ต้องอยู่นอก init เพื่อให้เรียกใช้งานจากปุ่มได้) ---
function deleteTrade(id) {
    if (confirm('คุณต้องการลบบันทึกนี้ใช่หรือไม่?')) {
        // 1. ลบออกจากหน้าจอ
        const row = document.querySelector(`tr[data-id="${id}"]`);
        if (row) row.remove();

        // 2. ลบออกจาก localStorage
        let trades = JSON.parse(localStorage.getItem('myTrades')) || [];
        trades = trades.filter(trade => trade.id !== id);
        localStorage.setItem('myTrades', JSON.stringify(trades));
    }
}