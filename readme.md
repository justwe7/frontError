# 前端异常监控上报

---

### 使用  
npm 使用：
``` bash
npm i frontError -S 

main.js: 
import frontError from 'frontError'
```
单文件引入
```javascript
<script src="frontError.min.js"></script>
```

实例化
```javascript
new frontError({
  reportUrl: "https://justwe.com/img.png",//上报地址
  uuid: "justwe_uuid",//uuid 用户标识key
  timeout: 5000, //接口响应过长阈值
  radom: 1, //错误过多减少上报数量  0-1
})
```

### 目标

- 采集代码异常（如何采集）
- 将采集到的异常以合适的数据格式总结上报(数据格式，上报方式)
- 将上报的数据进行可视化展示(分析统计异常)

### 总结平时遇到的前端报错情况:

- 资源引入报错，css、js、img、font 等
- 代码报错，如使用未定义变量
- 网络请求报错，接口 40x,50x，接口响应时间过长

---

## 异常采集方式

### try...catch
try...catch可以处理一些预测可能出现的情况，将代码段包装以后，catch能捕获到异常并继续执行，但无法捕获语法错误和异步错误

### window.onerror
通过全局监听error，可以得到具体的异常信息、异常文件的URL、异常的行号与列号及异常的堆栈信息。   
但是无法捕获到网络异常错误。并且window对于语法错误还是无能为力，仍然终止执行。   
这种方式最好将方法写在所有js代码之前，否则之前的代码一旦出错无法捕获到

```javascript
window.onerror = function(errorMessage, scriptURI, lineNo, columnNo, error) {
  console.log('errorMessage: ' + errorMessage); // 异常信息
  console.log('scriptURI: ' + scriptURI); // 异常文件路径
  console.log('lineNo: ' + lineNo); // 异常行号
  console.log('columnNo: ' + columnNo); // 异常列号
  console.log('error: ' + error); // 异常堆栈信息
  return true;//如果返回true  那么将会阻止执行浏览器默认的错误处理函数 控制台不会抛错
};
```

由于网络请求异常会触发一个Event接口的error事件，并执行该元素上的onerror()处理函数，但不会事件冒泡，因此必须在捕获阶段将其捕捉到才行，但是这种方式虽然可以捕捉到网络请求的异常，但是无法判断 HTTP 的状态是 404 还是403。
```javascript
window.addEventListener('error', (msg) => {
  console.log(msg);
}, true);
```

## 异常上报方式
- 资源引入报错
  ```javascript
  {
    type: "resourceError",//类型  ErrorEvent  
    time: 17444463423,//时间戳
    errorInfo: {
      {
        resourceUri: "http://10.2.200.83:8080/iframe/bbb.css",//资源引入地址
        outerHTML: "<link rel=\"stylesheet\" type=\"text/css\" media=\"screen\" href=\"bbb.css\">",
        tagName: "LINK"
      }
    }
  }
  ```
- 代码报错
  ```javascript   
  {
    type: "eventError",//类型  ErrorEvent  
    time: 1502863944724,
    errorInfo: {
      scriptURI: "http://localhost:4000/test.js",
      message: "Uncaught ReferenceError: ASDF is not defined",
      lineNumber: 23, // 异常行号
      columnNumber: 5, // 异常列号
      errStack: "ReferenceError: ASDF is not defined\n    at http://10.2.200.83:8080/iframe/b.html:23:5"//报错堆栈
    }
  }
  ```
- 网络请求报错
  ```javascript   
  {
    type: "httpError",//类型  ErrorEvent  
    time: 1502863944724,
    errorInfo: {
      req: {
        method: "POST",
        url: "/login"
      },
      res: {
        status: 404,
        statusText: "Not Found",
        response: "404 Not Found\n",
        resMs: time //接口响应时间时长 (毫秒)
      }
    }
  }
  ```

### ajax发送数据
