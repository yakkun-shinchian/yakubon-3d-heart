# UI設計

`ui-concept.png` は組み込みimage_genによる画面設計参考。解剖形状は生成せず、ライセンス確認済み実メッシュを配置する。逐次承認を求めず進めるというユーザー指示に従って実装する。

- 白のヘッダー・右パネル、淡い青灰色の3D領域。主色 #137a78、文字 #202c3b、境界 #dce3e9。
- 日本語システムSans。見出し28–36px、本文15px、補助12–13px。44px以上のタッチ対象。
- PC/iPad横: 大きな3D領域＋幅350–390pxの構造リスト。縦画面: 3Dを上、操作パネルを下。指操作は3D領域だけに適用し、ページスクロールを妨げない。
- 構造リストは色点・和名・略称・表示切替。選択説明、心筋の不透明度、リセット、出典。
- 必須の差分: 参考画像の誤った提供元表記をDBCLSに修正。未依頼のFAQリンクは省略。解剖学的意味が明確になるようスライダーは「心筋の不透明度」（100%=透けない）と明示。血流アニメーションはv2。
- 参照画像プロンプト: Japanese nursing anatomy app / white header / cool gray large viewport left 72% / white structure sidebar right / teal accent / chamber tabs and four rows / model area left empty to avoid invented anatomy / touch-first stacked mobile layout。
