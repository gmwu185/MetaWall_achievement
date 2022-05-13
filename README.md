
## API 格式

- [swagger 文件](https://stormy-plateau-16452.herokuapp.com/api-doc/)


## 環境與套件與指令

專案 clone 或是沒有 node_modules 資料夾情形下，而下指令透 NPM 載下專案所需的套件。
```
npm i
```

- 執行 `npm run dev`：開發時結合 Node 環境變數於指令使用，需與 `nodemon` 全域套件使用，在配合下指令 會直接由變數指向 mongoDB 本地端資料庫。
- 執行 `npm run server`：開發時結合 Node 環境變數於指令使用，需與 `nodemon` 全域套件使用，在配合下指令 會直接由變數指向 mongoDB Atias 遠端資料庫。
- 執行 `npm run swagger`： 產生 swagger 設定檔自動生成。
- `npm start`： npm 預設指令以遠端主機與遠端 mongoDB Atias 資料庫為主。

```
npm i nodemon --save
```

專案資料夾透過 `.env` 檔案，向遠端 mongoDB Atias，請參考 `ex.env` 檔做做設定


## 相關資料
- [第二週小組任務 - 文件與說明](https://hackmd.io/3a69ZWYYRWedOBFN3GZx0g?view)
- [npm swagger-autogen 本版使用文件 (使用 v2.5.10 但此版文件找不到使用 v2.5.12)] (https://www.npmjs.com/package/swagger-autogen/v/2.5.12)
