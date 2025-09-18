// script.js (更新版)
document.addEventListener('DOMContentLoaded', () => {
    // 取得所有需要的網頁元素
    const pages = document.querySelectorAll('.page');
    const actionButtons = document.querySelectorAll('.action-btn');
    const restartBtn = document.getElementById('restart-btn');
    const progressBar = document.getElementById('progress-bar');
    
    // 設定初始狀態
    let currentStep = 1;
    const totalSteps = pages.length;

    // 更新畫面的函式
    const updateUI = () => {
        // 根據目前步驟，切換顯示的頁面
        pages.forEach(page => {
            // 使用 data-step 屬性來比對目前步驟
            if (parseInt(page.dataset.step) === currentStep) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });

        // 計算並更新進度條的寬度
        // 當回到第一步時，進度為0；完成最後一步時，進度為100
        const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
        progressBar.style.width = `${progressPercent}%`;
    };

    // 處理「下一步」按鈕的點擊事件
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep < totalSteps) {
                // 如果還沒到最後一頁，就前往下一步
                currentStep++;
            } else {
                // *** 這就是修改的地方 ***
                // 如果已經在最後一頁，就回到第一步
                currentStep = 1;
            }
            updateUI(); // 更新畫面
        });
    });

    // 處理「重新開始」按鈕的點擊事件
    restartBtn.addEventListener('click', () => {
        currentStep = 1;
        updateUI();
    });

    // 網頁載入時，先初始化一次畫面
    updateUI();
});