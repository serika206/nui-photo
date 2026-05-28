document.addEventListener('DOMContentLoaded', () => {

  // --- [A] ファイルが選択された時のプレビュー処理 ---
  document.getElementById('photo-input').addEventListener('change', async (e) => {
    // まず全スロットを空にする
    document.querySelectorAll('.photo-slot img').forEach(img => {
      img.src = '';
    });

    const files = Array.from(e.target.files).filter(file => file.type.match('image.*')); // 画像だけを抽出
    
    if (files.length === 0) return; // 画像がなければ何もしない

    if (files.length > 4) {
      alert('写真は一度に4枚までしか選べないよ！自動的に最初の4枚を配置するね。');
    }

    // 有効な画像枚数（最大4枚）
    const maxFiles = Math.min(files.length, 4);

    // 【ステップ1】 選択された画像（最大4枚）をあらかじめBase64データ（Data URL）に変換する
    // ※FileReaderの生成を選択された枚数分（1〜4回）だけに抑えてメモリを節約
    const base64Images = [];
    for (let i = 0; i < maxFiles; i++) {
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(files[i]);
      });
      base64Images.push(dataUrl);
    }

    // 【ステップ2】 変換済みのBase64配列を使って、9つのスロットに順番に配置する
    // ※即時関数（IIFE）によるクロージャが不要になり、完全にバグの起きないシンプルなループに
    for (let i = 0; i < 9; i++) {
      const targetImg = document.getElementById(`img-slot-${i}`);
      if (targetImg) {
        // 計算通りのインデックス（画像Aがslot-0, 1, 5に入る黄金比率）でsrcを割り当て
        targetImg.src = base64Images[i % base64Images.length];
      }
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
      scale: 3,       
      useCORS: true,  
      logging: false  
    }).then(canvas => {
      
      // CanvasをPNGのデータ（Data URL）に変換
      const imgData = canvas.toDataURL('image/png');
      
      // 🟢【スマホ対策】自動DLではなく、画面に長押し用の画像を表示するモーダルを作成
      const modal = document.createElement('div');
      modal.id = 'image-modal';
      // スタイルをJSから直接注入（画面全体を覆う黒背景）
      Object.assign(modal.style, {
        position: 'fixed',
        top: '0', left: '0', width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.85)',
        zIndex: '10000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '20px', boxSizing: 'border-box'
      });

      // 案内テキスト
      const guideText = document.createElement('p');
      guideText.innerHTML = '画像が完成したよ！<br><b>画像を長押しして保存</b>してね！';
      Object.assign(guideText.style, {
        color: '#fff', fontSize: '16px', textAlign: 'center',
        marginBottom: '15px', lineHeight: '1.5', fontFamily: 'sans-serif'
      });

      // 完成した画像タグ
      const resultImg = document.createElement('img');
      resultImg.src = imgData;
      Object.assign(resultImg.style, {
        maxWidth: '100%', maxHeight: '70%',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
      });

      // 閉じるボタン
      const closeBtn = document.createElement('button');
      closeBtn.textContent = ' 閉じる ';
      Object.assign(closeBtn.style, {
        marginTop: '20px', padding: '10px 30px',
        fontSize: '14px', borderRadius: '20px',
        border: 'none', backgroundColor: '#fff', color: '#333',
        cursor: 'pointer'
      });
      // 閉じるボタンか背景を押したらモーダルを消す
      const closeModal = () => document.body.removeChild(modal);
      closeBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => {
        if(e.target === modal) closeModal();
      });

      // モーダルに要素を詰め込んで画面に追加
      modal.appendChild(guideText);
      modal.appendChild(resultImg);
      modal.appendChild(closeBtn);
      document.body.appendChild(modal);

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

  // --- [C] リセットボタンの処理 ---
  document.getElementById('reset-btn').addEventListener('click', () => {
    // img を空に
    document.querySelectorAll('.photo-slot img').forEach(img => {
      img.src = '';
    });

    // file input をリセット
    document.getElementById('photo-input').value = '';
  });

});