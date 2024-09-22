const http = require('http');
const { v4: uuidv4 } = require('uuid'); // node.js建議使用此方法匯入
const errorHandle = require('./errorHandle'); // 載入錯誤處理(自行建立模組)
const todos = []; // 清單儲存

const requestListener = (req, res) => {
  const headers = { // header CORS
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
   'Content-Type': 'application/json'
 }
 let body = ''; // 接收資料
 req.on('data', chunk => { // 透過buffer接收封包，並累加到body
    body += chunk;
 });
 
  if (req.url == "/todos" && req.method == 'GET') { // 取得所有代辦
    res.writeHead(200, headers);
    res.write(JSON.stringify({ // 將回傳格式轉為JSON
      "status": "success",
      "data" : todos,
    }));
    res.end();
  } else if(req.url == "/todos" && req.method == 'POST'){ // 新增代辦
    req.on('end', () => { // 接收完成~
        try{ // 偵測資料是否為JSON錯誤
            const title = JSON.parse(body).title; //取出接收到的title
            if(title !== undefined){ // 判斷格式是否出錯
                const todo = {
                    "title": title,
                    "id": uuidv4(),
                } 
                todos.push(todo);
                res.writeHead(200, headers);
                res.write(JSON.stringify({
                "status": "success",
                "data": todos,
            }));
                res.end();
            }else {
                errorHandle(res);
            }
        }catch(error){
            errorHandle(res);
        }
        
     });
  }else if(req.url.startsWith('/todos/') && req.method == 'PATCH'){ // 編輯單筆代辦
    req.on('end', () => {
        try{
            const todo = JSON.parse(body).title;
            const id = req.url.split('/').pop();
            const index = todos.findIndex(element => element.id == id);
            if(todo !== undefined && index !== -1) {
                todos[index].title = todo;
                res.writeHead(200, headers);
                res.write(JSON.stringify({
                    "status" : "success",
                    "data" : todos,
                }));
                res.end();
            }else{
                errorHandle(res);
            }
            
        }catch(error){
            errorHandle(res);
        }
    })
  }else if(req.url == "/todos" && req.method == 'DELETE'){ // 刪除全部代辦
    todos.length = 0;
    res.writeHead(200, headers);
    res.write(JSON.stringify({ 
      "status": "success",
      "data" : todos,
      "message": "已刪除全部代辦",
    }));
    res.end();
  }else if(req.url.startsWith('/todos/') && req.method == 'DELETE'){ //刪除單筆代辦
    const id = req.url.split('/').pop(); // 取的id
    const index = todos.findIndex(element => element.id == id); // 取的此id在陣列的位置
    if(index !== -1){
        todos.splice(index, 1);
        res.writeHead(200, headers);
        res.write(JSON.stringify({ 
          "status": "success",
          "data" : todos,
          "message": `已刪除${id}的資料`,
        }));
    res.end();
    }else{
        errorHandle(res);
    }
    
  }else if(req.method == 'OPTIONS'){ // 需要上線到伺服器才能測試
    res.writeHead(200,headers);
    res.end();
  }else{
    res.writeHead(404, headers);
    res.write(JSON.stringify({ // 將回傳格式轉為JSON
      "status": "False",
      "message" : "無此路由",
    }));
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);