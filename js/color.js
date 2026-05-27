document.addEventListener('DOMContentLoaded', () => {
    const colorButtons = document.querySelectorAll('.color_btn div a');
    const body = document.body;
    const themes = ['blue', 'pink', 'yellow', 'purple', 'green'];

    colorButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // data-theme 属性の値を取得
            const targetTheme = btn.getAttribute('data-theme');
            if (!targetTheme) return;

            // クラスの付け替え
            themes.forEach(theme => body.classList.remove(theme));
            body.classList.add(targetTheme);
        });
    });
});