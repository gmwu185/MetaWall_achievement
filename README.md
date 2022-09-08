
## API 格式與 DEMO

- [前端 GetHub Repo](https://github.com/sino980294/MetaWall)、[GitHub Pages](https://sino980294.github.io/MetaWall/login)
- [前端 GetHub Pages](https://sino980294.github.io/MetaWall/login)
- [swagger 文件](https://damp-plateau-24758.herokuapp.com/api-doc/)


## 還原專案

- 專案資料夾透過 `.env` 檔案 (`.env.example`) 設定環境變數。
- 向遠端 mongoDB Atias 進行 DB 連線。
- 本地端與遠端主機 Heroku 都於 `http://localhost:3000` 通訊埠上進行規劃。
- 以上設定後配合下方指令安裝相關套件，在準備好環境與套件設定後，進行主機運行向遠端 DB 連線。


## 環境與套件與指令

專案 clone 或是沒有 node_modules 資料夾情形下，而下指令透 NPM 載下專案所需的套件。
```
npm i
```
全城下需安裝 
```
npm i nodemon --save
```

- 執行 `npm run locall:dev`：環境變數使用 `dev`，需與 `nodemon` 全域套件使用，在配合下指令 會直接由變數指向 mongoDB 本地端資料庫。
- 執行 `npm run locall:prod`：環境變數使用 `production`，需與 `nodemon` 全域套件使用，在配合下指令 會直接由變數指向 mongoDB 本地端資料庫。
- 執行 `npm run server`：環境變數使用 `production`，需與 `nodemon` 全域套件使用，在配合下指令 會直接由變數指向 mongoDB Atias 遠端資料庫。
- 執行 `npm run swagger:dev`：環境變數使用 `dev`，產生 swagger 設定檔自動生成，本地主機使用 http。
- 執行 `npm run swagger:prod`：環境變數使用 `production`，產生 swagger 設定檔自動生成，正式主機使用 https。
- 執行 `npm run swagger`：同時產生正式與本地主機產生 swagger 設定檔。
- `npm start`： npm 預設指令以遠端主機與遠端 mongoDB Atias 資料庫為主。
