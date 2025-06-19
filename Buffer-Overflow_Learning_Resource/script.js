document.addEventListener('DOMContentLoaded', () => {

    // --- 元素選擇器 ---
    const navLinks = document.querySelectorAll('#main-nav li');
    const pageContents = document.querySelectorAll('.page-content');
    const mainNav = document.getElementById('main-nav');
    const container = document.querySelector('.container');
    const startLearningBtn = document.getElementById('start-learning-btn');
    const prevPageBtn = document.getElementById('prev-page-btn');
    const nextPageBtn = document.getElementById('next-page-btn');

    // 頁面順序，用於上下頁切換
    const pageOrder = [
        'home-page', 'intro-page', 'types-page', 'usage-page', 
        'history-page', 'ctf-page', 'writeup-page', 'reading-page'
    ];
    let currentPageIndex = 0;

    // --- Write-Up 內容 ---
    const writeupData = [
        {
            title: "步驟一：觀察題目",
            content: `
                <p>成功執行映像檔後會看到如圖的內容</p>
                <img src="https://hackmd.io/_uploads/H1HpZJWEll.png" alt="觀察題目程式碼">
            `
        },
        {
            title: "步驟二：嘗試輸入",
            content: `
                <p>系統詢問你的名字，如果你如實告訴他，例如：Snoopy</p>
                <img src="https://hackmd.io/_uploads/BJPQf1-Elg.png" alt="尋找 get_shell 函式位址">
                <p>那他只會告訴你歡迎，但你卻沒辦法得到 flag。</p>
            `
        },
        {
            title: "步驟三：嘗試讓緩衝區溢位",
            content: `
                <p>我們要試著輸入超過 16 個字元的內容，例如：Snooooooooooooooooooooooooooooooooopy</p>
                <img src="https://hackmd.io/_uploads/rk1hGy-Vxe.png" alt="嘗試讓緩衝區溢位">
            `
        }
    ];

    // --- 函式定義 ---

    /**
     * 顯示指定的頁面
     * @param {string} pageId - 要顯示的頁面的 ID
     */
    function showPage(pageId) {
        // 1. 隱藏所有頁面
        pageContents.forEach(page => page.classList.remove('active'));

        // 2. 顯示目標頁面
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');

            // 3. 更新導航欄樣式
            navLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.target === pageId);
            });
            
            // 4. 處理首頁的特殊佈局 (隱藏/顯示導航欄)
            if (pageId === 'home-page') {
                mainNav.classList.add('nav-hidden');
                container.classList.add('home-active');
            } else {
                mainNav.classList.remove('nav-hidden');
                container.classList.remove('home-active');
            }
            
            // 5. 更新當前頁面索引
            currentPageIndex = pageOrder.indexOf(pageId);
            updatePageNavButtons();

            // 6. 滾動到頁面頂部
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // 7. 將當前頁面存入 Cookie
            setCookie('lastPage', pageId, 7);
        }
    }
    
    /**
     * 更新上下頁按鈕的顯示狀態
     */
    function updatePageNavButtons() {
        // 首頁不顯示上下按鈕
        if (currentPageIndex === 0) {
            prevPageBtn.classList.add('hidden');
            nextPageBtn.classList.add('hidden');
            return;
        }

        prevPageBtn.classList.remove('hidden');
        nextPageBtn.classList.remove('hidden');
        
        // 如果是第一頁(非首頁)，隱藏上一頁按鈕
        prevPageBtn.classList.toggle('hidden', currentPageIndex <= 1);
        // 如果是最後一頁，隱藏下一頁按鈕
        nextPageBtn.classList.toggle('hidden', currentPageIndex >= pageOrder.length - 1);
    }

    /**
     * 初始化內部頁籤功能
     */
    function initializeInnerTabs() {
        const tabContainers = document.querySelectorAll('.inner-tabs');
        tabContainers.forEach(container => {
            const tabButtons = container.querySelectorAll('.inner-tab-btn');
            const contentWrapper = container.nextElementSibling;
            
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // 移除所有按鈕的 active
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    // 為點擊的按鈕加上 active
                    button.classList.add('active');

                    // 隱藏所有內容
                    const contents = contentWrapper.querySelectorAll('.inner-tab-content');
                    contents.forEach(content => content.classList.remove('active'));

                    // 顯示對應的內容
                    const targetContent = contentWrapper.querySelector(`#${button.dataset.tab}`);
                    if (targetContent) {
                        targetContent.classList.add('active');
                    }
                });
            });
        });
    }

    /**
     * 初始化 CTF 題解頁面
     */
    function initializeWriteupPage() {
        const contentContainer = document.querySelector('#writeup-page .writeup-content');
        const navContainer = document.querySelector('#writeup-page .step-navigation');
        if (!contentContainer || !navContainer) return;
        
        // 清空容器
        contentContainer.innerHTML = '';
        navContainer.innerHTML = '';

        // 生成內容和導航按鈕
        writeupData.forEach((step, index) => {
            // 內容
            const stepDiv = document.createElement('div');
            stepDiv.id = `step-${index + 1}`;
            stepDiv.classList.add('writeup-step');
            if (index === 0) stepDiv.classList.add('active');
            stepDiv.innerHTML = `<h3>${step.title}</h3>${step.content}`;
            contentContainer.appendChild(stepDiv);

            // 按鈕
            const stepBtn = document.createElement('button');
            stepBtn.classList.add('step-btn');
            stepBtn.dataset.target = `step-${index + 1}`;
            stepBtn.textContent = index + 1;
            if (index === 0) stepBtn.classList.add('active');
            navContainer.appendChild(stepBtn);
        });

        // 為按鈕添加事件監聽
        const stepButtons = navContainer.querySelectorAll('.step-btn');
        stepButtons.forEach(button => {
            button.addEventListener('click', () => {
                stepButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const allSteps = contentContainer.querySelectorAll('.writeup-step');
                allSteps.forEach(step => step.classList.remove('active'));
                
                const targetStep = document.getElementById(button.dataset.target);
                if(targetStep) targetStep.classList.add('active');
            });
        });
    }

    // --- Cookie 處理函式 ---
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // --- 事件監聽器設定 ---

    // 導航欄點擊
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetId = link.dataset.target;
            showPage(targetId);
        });
    });

    // 開始學習按鈕
    if (startLearningBtn) {
        startLearningBtn.addEventListener('click', () => {
            showPage('intro-page');
        });
    }
    
    // 上一頁按鈕
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPageIndex > 0) {
                currentPageIndex--;
                showPage(pageOrder[currentPageIndex]);
            }
        });
    }
    
    // 下一頁按鈕
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            if (currentPageIndex < pageOrder.length - 1) {
                currentPageIndex++;
                showPage(pageOrder[currentPageIndex]);
            }
        });
    }

    // --- 初始化 ---
    
    // 初始化內部頁籤
    initializeInnerTabs();
    
    // 初始化 CTF 題解頁面
    initializeWriteupPage();

    // 檢查 Cookie 並載入上次停留的頁面，否則顯示首頁
    const lastPage = getCookie('lastPage');
    if (lastPage && pageOrder.includes(lastPage)) {
        showPage(lastPage);
    } else {
        showPage('home-page');
    }

});