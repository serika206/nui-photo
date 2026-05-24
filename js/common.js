
document.addEventListener('DOMContentLoaded', () => {

// --- [A] ファイルが選択された時のプレビュー処理 ---
  document.getElementById('photo-input').addEventListener('change', (e) => {
     // まず全スロットを空にする
  document.querySelectorAll('.photo-slot img').forEach(img => {
    img.src = '';
  });

    const files = Array.from(e.target.files).filter(file => file.type.match('image.*')); // 画像だけを抽出
    
    if (files.length === 0) return; // 画像がなければ何もしない

  if (files.length > 8) {
    alert('写真は一度に8枚までしか選べないよ！自動的に最初の4枚を配置するね。');
    // もし選択自体を完全にキャンセル（リセット）させたい場合は、以下の2行を有効にしてください
    // e.target.value = ''; // 選択されたファイルをクリア
    // return;
  }

    // 常に4回ループを回す
    for (let i = 0; i < 8; i++) {
      const file = files[i % Math.min(files.length, 8)];

      const reader = new FileReader();
      
      // 非同期のタイミングでスロット番号がズレないよう、関数に閉じ込めて現在の「i」を固定する
      ((slotIndex) => {
        reader.onload = (event) => {
          const targetImg = document.getElementById(`img-slot-${slotIndex}`);
          if (targetImg) {
            targetImg.src = event.target.result;
          }
        };
      })(i); // 現在のループの i を slotIndex として渡す
      
      reader.readAsDataURL(file);
    }
  });

  // --- [B] ダウンロードボタンがクリックされた時の画像化処理 ---
  document.getElementById('download-btn').addEventListener('click', () => {
    const target = document.getElementById('print-canvas');
    
    // まだ画像が1枚も選択されていない場合は一応ブロック
    const firstImg = document.getElementById('img-slot-0');
    if (!firstImg || !firstImg.src) {
      alert('写真を最低1枚は選択してください！');
      return;
    }

    // ボタンのテキストを「生成中...」に変えて連打防止
    const btn = document.getElementById('download-btn');
    const originalText = btn.textContent;
    btn.textContent = '画像を作成中...';
    btn.disabled = true;

    // html2canvasでHTML要素を擬似的にキャプチャ
    html2canvas(target, {
      scale: 5,       // 300→1500x1052pxの実寸サイズでそのまま出力
      useCORS: true,  // ローカル環境や外部画像でのクロスドメインエラー対策
      logging: false  // コンソールのログを非表示にしてスッキリさせる
    }).then(canvas => {
      
      // CanvasをPNGのデータ（Data URL）に変換
      const imgData = canvas.toDataURL('image/png');
      
      // 仮想のリンクタグを作って自動クリック（ダウンロード発火）
      const link = document.createElement('a');
      link.href = imgData;
      link.download = 'lawson-seal-print.png'; // ダウンロードされるファイル名
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // 使い終わったら即削除

      // ボタンの状態を元に戻す
      btn.textContent = originalText;
      btn.disabled = false;
    }).catch(err => {
      console.error('画像生成エラー:', err);
      alert('画像の作成に失敗しました。');
      btn.textContent = originalText;
      btn.disabled = false;
    });
  });


document.getElementById('reset-btn').addEventListener('click', () => {

  // img を空に
  document.querySelectorAll('.photo-slot img').forEach(img => {
    img.src = '';
  });

  // file input をリセット
  document.getElementById('photo-input').value = '';

});

});