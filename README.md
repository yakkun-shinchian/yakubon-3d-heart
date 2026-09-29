# YAKUBON STUDIO｜3D HEART v2

看護の「わからない」を30秒で、なるほどへ。

新人看護師・看護学生が、心臓を回し、透かし、構造を選んで位置関係を学ぶWeb教材です。ブラウザで利用でき、閲覧者によるソフトのインストールは不要です。

**[学習用プレビューを開く](https://yakkun-shinchian.github.io/yakubon-3d-heart/)** · [GitHubリポジトリ](https://github.com/yakkun-shinchian/yakubon-3d-heart)

## 現在の機能

- 360°回転、ズーム、パン。タッチは1本指で回転、2本指でピンチ／パン。
- 4心腔、4弁、大血管5群、RCA・LAD・LCX・左冠動脈主幹部、心筋の計18構造。
- 日本語・英語・略語の説明、モデルのタップ選択、各構造の表示ON/OFF。
- 心筋の不透明度0〜100%、弁・冠動脈モードで周囲を透過。
- 前面・背面・身体の左側・弁を上から見る視点。身体の向きを示すコンパス。
- スマートフォン縦画面、iPad、PCのレスポンシブUI。
- 矢印キーで回転、＋／−でズーム、キーボード操作可能な構造リスト。

### v2：血流アニメーション

「血流」タブで、半透明の心臓に粒子・矢印・ガイド線を重ねて表示します。

- 右心系（青）：上・下大静脈 → 右心房 → 三尖弁 → 右心室 → 肺動脈弁 → 肺動脈 → 肺へ。
- 左心系（赤）：肺静脈 → 左心房 → 僧帽弁 → 左心室 → 大動脈弁 → 大動脈 → 全身へ。
- 再生／一時停止、先頭に戻す、右心系／左心系／両方、0.5・1・2倍の表示速度。
- 経路中の構造名を押して位置を強調。回転・拡縮・視点切替も併用できます。
- 端末の「動きを減らす」設定では停止状態で開始。非表示タブでは描画を停止。

**経路は模式図（推定）です。** 元メッシュの範囲を手がかりにした位置関係の学習用ガイドで、実測の流線・血管中心線ではありません。粒子は区間ごとに繰り返し流れ、同一血球の全行程を追跡していません。表示速度は生理的流速や心拍数に対応しません。青は酸素の少なさを区別する色で、実際の血液の色ではありません。肺・全身内の循環は省略し、右心系から左心系への直接接続はありません。

拍動、弁の開閉、逆流・病態、断面切断UIは未実装。独自に推測した解剖形状は追加せず、v1のGLBをそのまま使用しています。[血流の設計・根拠](docs/flow-design.md)を参照。

## モデル選定と出典

[候補比較・採用理由](docs/model-research.md)をコード作成前に記録し、**BodyParts3D 4.0公式アーカイブ**を採用しました。Z-AnatomyとNIH 3D正常心モデルも比較しています。商用Atlasからのコピー・抽出・トレースは行っていません。

- データ提供: The Database Center for Life Science（DBCLS）
- 配布: [NBDC生命科学系データベースアーカイブ](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html)
- 取得ファイル: [isa_BP3D_4.0_obj_99.zip](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/isa_BP3D_4.0_obj_99.zip)
- 取得・利用条件確認日: **2026-09-29**
- [公式利用許諾](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html): **CC BY 4.0**（2025-02-27更新）
- 商用利用・改変・再配布・Web公開: 可。表示、ライセンスへのリンク、変更明示などの条件に従います。
- [元データ／派生GLBのSHA-256、FMAとELEMENTの対応記録](public/models/manifest.json)

古いOBJのヘッダーには **CC BY-SA 2.1 Japan** と記載されています。原本は変更せず保存しました。今回の直接取得元である公式アーカイブの現行利用許諾と配布READMEはともに **CC BY 4.0** を明記しています。そのページを `source/bodyparts3d/license-source.html` と `README-source.html` に保存しています。Z-Anatomy由来のデータをCC BYへ変更したものではありません。

### クレジット

> BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.

このクレジットと[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)へのリンクを、アプリ内にも掲載しています。公式提供元による本教材の監修・承認を意味しません。

### 変更内容

1. 公式FMA対応表で選んだ心臓関連ELEMENTを抽出。
2. 全構造に同一変換 `[(x-20)*0.025, (z-1240)*0.025, -(y+115)*0.025]` を適用。元の位置・比率を維持。反転なし。
3. OBJの頂点・法線をGLBに格納。元の99%ポリゴン削減版に、追加の形状簡略化は施していません。
4. 学習用配色、構造グループ、透過・選択表示を追加。
5. 下大静脈は腹部のFJ3659を省略し、FJ3441を元座標z=1162mmで切り詰め。切断端に架空の蓋は追加していません。

GLB: **3,273,592 bytes / 127,851 triangles / 18構造**。データとThree.jsを同一配信元に配置し、実行時CDNや外部APIに依存しません。描画ピクセル比を1.75以下に制限し、静止中は描画を止めて負荷を減らします。血流再生中のみ連続描画し、48個の粒子と16個の方向矢印をインスタンス描画します。Dracoはこのサイズでは必須ではないため未使用です。

## 医学的な表現と未完了の確認

- 心腔は内部空間の表面であり、心筋ではありません。心筋は心房壁・共通の心室壁メッシュとして別表示します。
- 弁は元データの弁尖。腱索・乳頭筋を別部品として網羅せず、動的な開閉状態や逆流を表しません。
- 冠動脈はデータセット上の走行。細枝・冠循環の優位性・個人差の全ては再現しません。
- 大動脈は上行部と弓部。末梢側・弓部の枝などを省略。肺静脈は左右上下のグループに対応する7部品を使用。
- 色は識別のための配色。実際の組織色や酸素飽和度の数値を意味しません。
- 公式座標図で +X=身体の左、+Y=後、+Z=上を確認して変換。初期前面図は画面左が身体の右。
- 解説確認: [OpenStax Heart Anatomy](https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy)、[NHLBI血流経路](https://www.nhlbi.nih.gov/health/heart/blood-flow)。本文は短い独自の学習説明です。
- **医学監修と実機iPad Safariのピンチ／2本指パン確認は未完了**。公開時も学習用プレビューとして扱い、診断・処置判断には使用しません。

## 使用技術・起動

React 19、Three.js 0.180（WebGL2 / GLTFLoader / OrbitControls）、Vite 7、Python 3標準ライブラリ（モデル変換）。開発環境: Node.js 22.12以上推奨。

```sh
npm ci
npm run dev
```

Macは `http://localhost:5173/`。同じWi-FiのiPadはターミナルに表示されるNetwork URLをSafariで開いてください。Macとサーバーを起動したままにする必要があります。ネットワーク側で端末間通信が禁止されている場合は公開URLを使います。

```sh
npm test
npm run build
npm run preview
```

`dist/` が静的な公開成果物です。`index.html`のダブルクリック（file://）ではなくHTTPサーバーで開きます。Viteは相対パス設定なのでGitHub PagesのプロジェクトURLにも対応します。

### モデルを再生成

公式ZIPを上記URLから `source/bodyparts3d/isa_BP3D_4.0_obj_99.zip` に保存して `npm run models` を実行します。ZIPは大容量のためGit管理外。選択OBJ原本と対応表はリポジトリに保持します。変換スクリプトはZIPのCRCを確認し、頂点・法線・出典記録を再生成します。

## GitHub Pages公開方法

1. このプロジェクトをGitHubリポジトリのmainブランチへpush。
2. Settings → Pages → Build and deployment → Sourceで **GitHub Actions** を選択。
3. 同梱の `.github/workflows/pages.yml` がテスト・ビルドし、`dist/`だけをPagesへ公開。
4. Actionsの完了後、Pagesに表示されたURLでモデルと操作を確認。

ソースZIP、検証画像、一時ファイルは公開サイトへ含みません。READMEやクレジットを削除せず再利用してください。

## 検証記録

[v2 QA記録](docs/QA-v2.md)と[v1 QA記録](docs/QA.md)を参照。自動検証は全8件（既存モデルの4件＋血流経路・連続性・時間制御・実描画データの4件）。内蔵ブラウザで主要操作とPC／スマートフォン／iPad相当の画面幅を確認しています。これは実際のiPhone/iPadでの検証とは異なります。

## ライセンス区分

- モデルおよび対応表: BodyParts3DのCC BY 4.0（上記参照）。元OBJの旧ヘッダーを保持。
- 本プロジェクト独自コード: MIT（`LICENSE`）。
- Three.js / React / Vite: MIT。配布に同梱する依存ソフトの通知は `public/THIRD_PARTY_NOTICES.txt` を参照。
- `docs/ui-concept.png`: UI設計の生成画像。解剖モデルとして使用しません。
