
## API 格式
### POST /posts
``` JSON
// JSON 格式
{
  "userName": "邊綠小杰",
  "userPhoto": "https://unsplash.it/500/500/?random=4",
  "discussContent": "外面看起來就超冷…\n\r我決定回被窩繼續睡…>.<",
  "discussPhoto": "https://images.unsplash.com/photo-1485594050903-8e8ee7b071a8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=900&h=350&q=80"
}
```

## 環境與套件與指令

專案 clone 或是沒有 node_modules 資料夾情形下，而下指令透 NPM 載下專案所需的套件。
```
npm i
```

開發時結合 Node 環境變數於指令使用，需與 `nodemon` 全域套件使用，在配合下指令執行 `npm run dev` 會直接由變數指向 mongoDB 本地端資料庫，其他的指令與都以遠端 mongoDB Altas 資料庫為主。

```
npm i nodemon --save
```

與專案資料夾新增 .env 檔案，新增環境變數名稱 `<mongoDB_user_no>` 不列入以 DB 取得使用者名為主
```
DB_URL="mongodb+srv://<mongoDB_user_no>:<password>@cluster0.rrh0g.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
DB_NAME="<myFirstDatabase>"
DB_PASSWORD="<password>"
```

## 相關資料
- [Adobe XD 設計稿 - MetaWall 連結](https://xd.adobe.com/view/c0763dbe-fc15-42e8-be0b-8956ed03e675-9525/grid)
