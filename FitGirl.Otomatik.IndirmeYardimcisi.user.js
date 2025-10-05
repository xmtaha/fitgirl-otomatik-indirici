// ==UserScript==
// @name         FitGirl Otomatik Fuckingfast İndirme Yardımcısı
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  FitGirl sayfasında tüm fuckingfast.co bağlantılarını eşleştirir ve yeni sekmede indirme butonuna otomatik olarak tıklar.
// @author       You
// @match        https://fitgirl-repacks.site/*
// @match        https://fuckingfast.co/*
// @grant        GM_openInTab
// @grant        window.close
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // --- Alt sayfa mantığı (fitgirl-repacks.site) ---
    // Ana sayfada çalışmayacak, sadece oyun detay sayfalarında çalışacak
    if (window.location.hostname.includes('fitgirl-repacks.site')) {
        // Ana sayfayı kontrol et - ana sayfa genellikle sadece domain veya domain/ şeklindedir
        const currentPath = window.location.pathname;
        const isMainPage = currentPath === '/' || currentPath === '' || 
                          currentPath === '/index.html' || 
                          currentPath.match(/^\/page\/\d+\/?$/); // sayfalama sayfaları da ana sayfa sayılır
        
        if (isMainPage) {
            console.log('[FitGirl Yardımcısı] Ana sayfada, script çalıştırılmıyor.');
            return; // Ana sayfada çalıştırma
        }
        
        console.log('[FitGirl Yardımcısı] Script oyun detay sayfasında başlatıldı.');

        const checkInterval = setInterval(() => {
            // Bağlantıları ve içerik eklenebilecek hedef konumu bulana kadar sürekli kontrol et
            const links = document.querySelectorAll('a[href*="fuckingfast.co/"]');
            const entryContent = document.querySelector('.entry-content');

            // Sayfada en az bir uygun bağlantı olduğundan ve buton eklenebilecek alan bulunduğundan emin ol
            if (links.length > 0 && entryContent) {
                console.log(`[FitGirl Yardımcısı] Başarıyla ${links.length} bağlantı ve içerik alanı bulundu, arayüz oluşturuluyor.`);
                // Bulunduktan sonra kontrol etmeyi durdur, tekrar oluşturmayı önle
                clearInterval(checkInterval);

                // Tekrar eklemeyi önle, zaten var mı diye kontrol et
                if (document.getElementById('auto-downloader-container')) {
                    return;
                }

                // Ana konteyner oluştur
                const linkContainer = document.createElement('div');
                linkContainer.id = 'auto-downloader-container'; // Kontrol için ID ekle
                linkContainer.style.marginTop = '20px';
                linkContainer.style.marginBottom = '20px';
                linkContainer.style.border = '2px solid #4CAF50';
                linkContainer.style.borderRadius = '5px';
                linkContainer.style.padding = '15px';
                linkContainer.style.backgroundColor = '#f0fff0';

                // Başlık oluştur
                const title = document.createElement('h3');
                title.innerText = 'Otomatik İndirme Yardımcısı';
                title.style.marginTop = '0';
                linkContainer.appendChild(title);

                // Bağlantı listesi konteyneri oluştur
                const listContainer = document.createElement('div');
                listContainer.style.display = 'flex';
                listContainer.style.flexDirection = 'column';
                listContainer.style.gap = '10px';

                links.forEach((link, index) => {
                    const originalUrl = link.href;
                    // Bağlantıdan dosya adını buton metni olarak çıkar
                    const fileName = originalUrl.split('#')[1] || `Bölüm ${index + 1}`;
                    const fileLabel = fileName.replace(/_/g, ' ');

                    // Her bağlantı için onay kutusu içeren liste öğesi oluştur
                    const listItem = document.createElement('div');
                    listItem.style.display = 'flex';
                    listItem.style.alignItems = 'center';
                    listItem.style.gap = '8px';

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `download-item-${index}`;
                    checkbox.value = originalUrl;
                    checkbox.style.cursor = 'pointer';

                    const label = document.createElement('label');
                    label.htmlFor = `download-item-${index}`;
                    label.innerText = fileLabel;
                    label.style.cursor = 'pointer';

                    listItem.appendChild(checkbox);
                    listItem.appendChild(label);
                    listContainer.appendChild(listItem);
                });

                linkContainer.appendChild(listContainer);

                // Tümünü seç/seçimi kaldır butonu ekle
                const selectAllButton = document.createElement('button');
                selectAllButton.innerText = 'Tümünü Seç';
                selectAllButton.style.marginTop = '10px';
                selectAllButton.style.padding = '8px 16px';
                selectAllButton.style.cursor = 'pointer';
                selectAllButton.style.border = '1px solid #2196F3';
                selectAllButton.style.borderRadius = '5px';
                selectAllButton.style.backgroundColor = '#2196F3';
                selectAllButton.style.color = 'white';
                selectAllButton.style.marginRight = '10px';

                selectAllButton.onmouseover = () => selectAllButton.style.backgroundColor = '#1976D2';
                selectAllButton.onmouseout = () => selectAllButton.style.backgroundColor = '#2196F3';

                let allSelected = false;
                selectAllButton.onclick = () => {
                    const checkboxes = document.querySelectorAll('#auto-downloader-container input[type="checkbox"]');
                    allSelected = !allSelected;
                    
                    checkboxes.forEach(checkbox => {
                        checkbox.checked = allSelected;
                    });
                    
                    selectAllButton.innerText = allSelected ? 'Tümünü Kaldır' : 'Tümünü Seç';
                };

                linkContainer.appendChild(selectAllButton);

                // Seçilen tüm öğeleri indirmek için bir indirme butonu ekle
                const downloadAllButton = document.createElement('button');
                downloadAllButton.innerText = 'Seçilenleri İndir';
                downloadAllButton.style.marginTop = '15px';
                downloadAllButton.style.padding = '10px 20px';
                downloadAllButton.style.cursor = 'pointer';
                downloadAllButton.style.border = '1px solid #4CAF50';
                downloadAllButton.style.borderRadius = '5px';
                downloadAllButton.style.backgroundColor = '#4CAF50';
                downloadAllButton.style.color = 'white';

                downloadAllButton.onmouseover = () => downloadAllButton.style.backgroundColor = '#45a049';
                downloadAllButton.onmouseout = () => downloadAllButton.style.backgroundColor = '#4CAF50';

                // --- Ana değişiklik bölümü ---
                // Bağlantıların sırayla açılmasını sağlamak için async/await kullan
                downloadAllButton.onclick = async () => {
                    const checkedItems = document.querySelectorAll('input[type="checkbox"]:checked');
                    if (checkedItems.length === 0) {
                        // alert yerine div kullan
                        showMessage('Lütfen önce indirilecek dosyaları seçin!');
                        return;
                    }

                    // Tekrar tıklanmayı önlemek için butonu devre dışı bırak
                    downloadAllButton.disabled = true;
                    downloadAllButton.innerText = 'Sırayla açılıyor...';

                    for (const item of checkedItems) {
                        const url = item.value;
                        console.log(`[FitGirl Yardımcısı] Seçilen bağlantı açılıyor: ${url}`);
                        // GM_openInTab'ın ikinci parametresi, active: true yeni sekmede açar ve aktive eder
                        // Yeni sekmenin işlenmesini beklemek için Promise kullanabiliriz
                        await new Promise(resolve => {
                            GM_openInTab(url, { active: true });
                            // 1 saniye bekle, tarayıcının yeni sekmeyi açması ve işlemesi için zaman ver
                            setTimeout(resolve, 1000);
                        });
                    }

                    console.log('[FitGirl Yardımcısı] Tüm bağlantılar sırayla açılma tamamlandı.');
                    downloadAllButton.disabled = false;
                    downloadAllButton.innerText = 'Seçilenleri İndir';
                };
                // --- Ana değişiklik sonu ---

                linkContainer.appendChild(downloadAllButton);
                entryContent.prepend(linkContainer);
                console.log('[FitGirl Yardımcısı] İndirme yardımcısı arayüzü başarıyla oluşturuldu.');

                // Alert yerine mesaj kutusu fonksiyonu
                function showMessage(msg) {
                    const messageBox = document.createElement('div');
                    messageBox.style.cssText = `
                        position: fixed;
                        top: 20px;
                        left: 50%;
                        transform: translateX(-50%);
                        background-color: #ffc107;
                        color: #333;
                        padding: 15px 30px;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        z-index: 9999;
                        font-family: sans-serif;
                        opacity: 0;
                        transition: opacity 0.5s ease-in-out;
                    `;
                    messageBox.innerText = msg;
                    document.body.appendChild(messageBox);

                    setTimeout(() => {
                        messageBox.style.opacity = '1';
                    }, 10);

                    setTimeout(() => {
                        messageBox.style.opacity = '0';
                        messageBox.addEventListener('transitionend', () => {
                            messageBox.remove();
                        });
                    }, 3000);
                }

            } else {
                console.log('[FitGirl Yardımcısı] Sayfa içeriğinin yüklenmesi bekleniyor...');
            }
        }, 1000); // Her saniye bir kontrol et
    }

    // --- İndirme sayfası mantığı (fuckingfast.co) ---
    // Bu bölüm değişmeden kalır
    if (window.location.hostname.includes('fuckingfast.co')) {
        console.log('[İndirme Sayfası] Script başlatıldı, indirme butonuna tıklamaya hazırlanıyor.');
        const interval = setInterval(() => {
            const downloadButton = document.querySelector('button.link-button.text-5xl.gay-button');
            if (downloadButton) {
                console.log('[İndirme Sayfası] İndirme butonu bulundu, tıklanıyor...');
                clearInterval(interval);
                downloadButton.click();

                setTimeout(() => {
                    // Sayfayı kapatmaya çalış
                    window.close();
                }, 3000); // 3 saniye sonra kapat
            } else {
                console.log('[İndirme Sayfası] İndirme butonunun görünmesi bekleniyor...');
            }
        }, 1000);
    }
})();