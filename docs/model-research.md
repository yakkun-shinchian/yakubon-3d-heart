# Phase 1 — モデル調査・採用決定

確認日・取得日: 2026-09-29。既存の有料Atlasのモデル・画像は使用しない。

| 項目 | BodyParts3D 4.0（採用） | Z-Anatomy | NIH 3D 3DPX-002636 v2 |
|---|---|---|---|
| 提供元 | DBCLS / NBDC生命科学系データベースアーカイブ | Gauthier Kervyn、Marcin Zielinskiほか | Matthew Bramlet / NIH 3D |
| 医学的内容 | 人体の解剖学的部品、FMA概念とメッシュIDの対応表 | BodyParts3D由来の全身解剖モデルを拡充 | 17歳女性の正常心、拡張期CT由来 |
| 形式 | Wavefront OBJ（99%削減版ZIP） | Blenderテンプレート・ZIP | 印刷向け3Dデータ。今回取得せず形式未確定 |
| ライセンス | **CC BY 4.0**。公式2025-02-27更新を確認 | 原則CC BY-SA 4.0。第三者部品に別条件あり | 項目ページから具体的ライセンスを確認できず |
| 商用利用 | 可、表示等の条件に従う | 可、ただし個別部品条件を要確認 | 未確認につき不採用 |
| 改変 | 可、変更明示 | 可、継承条件あり | 未確認 |
| Web公開・再配布 | 可、クレジットとライセンスリンクを付す | 可、同一ライセンスで派生モデルを共有 | 未確認 |
| RCA/LAD/LCX | 対応表で3者を確認。FMA3802 / FMA74912 / FMA3895 | 今回個別メッシュは未監査 | 個別部品は未確認 |
| 弁 | 三尖弁3尖、僧帽弁2尖、肺動脈弁3尖、大動脈弁3尖を対応表で確認 | 今回個別メッシュは未監査 | 提供者がCTでは弁の詳細表現が不十分と説明 |
| 適性 | 独立構造と位置情報を追跡でき、v1に最適 | 有力だが全身データからの抽出と追加権利確認が必要 | 個体形状の学習向け。今回の4弁個別選択に不向き |

## 採用理由と制約

BodyParts3D公式アーカイブから直接取得する。Z-Anatomy等の派生モデルをCC BYへ変更するものではない。古いBodyParts3DのCC BY-SA 2.1 Japan表記とは取得元・適用表示を区別する。

元の解剖座標と部品IDを維持する。独自に弁位置や冠動脈を推測して作らない。4心腔は空間の表面モデルであり心筋そのものではない。心室壁は左右独立ではなく共通の壁メッシュなので、4心腔の個別識別には腔モデルを用いる。

99%削減版は微細構造を省略する。弁の開閉・拍動・血流速度を再現するモデルではない。医学監修および実機iPad試験の完了とは別に管理する。

## 一次資料

- [BodyParts3D公式ダウンロード](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html)
- [公式利用許諾（2025-02-27更新）](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html)
- [配布README（同じCC BY 4.0表記）](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/README_e.html)
- [公式部品名一覧](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/isa_parts_list_e.txt)
- [公式概念とELEMENTの対応表](https://dbarchive.biosciencedbc.jp/data/bodyparts3d/LATEST/isa_element_parts.txt)
- [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- [Z-Anatomy配布元](https://github.com/Z-Anatomy/Models-of-human-anatomy)
- [Z-Anatomyライセンス・第三者部品の注意](https://github.com/Z-Anatomy/Models-of-human-anatomy/blob/master/License.txt)
- [NIH 3D正常心モデル](https://3d.nih.gov/entries/2636?version=2)
- [NIH 3D FAQ（モデルごとのライセンス確認）](https://3d.nih.gov/faqs)
- [OpenStax 19.1 Heart Anatomy](https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy)
- [NHLBI 血流経路](https://www.nhlbi.nih.gov/health/heart/blood-flow)
