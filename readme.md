# 前端异常监控上报  
---

[GitHub地址](https://github.com/justwe7/frontError)  

## 使用
此项目只捕获前端错误信息并整合，可搭配[kibana](https://www.elastic.co/guide/cn/kibana/current/setup.html)或接口进行上报   

  
npm 使用：
``` bash
npm i front-error -S 

main.js: 
import frontError from 'front-error'
```
单文件引入
```javascript
<script src="frontError.min.js"></script>
//（解决跨域的js脚本错误上报）iframe嵌套页面添加 crossorigin 属性否则无法获取报错信息 添加 crossOrigin 属性完成跨域上报，别忘了服务器也设置 Access-Control-Allow-Origin 的响应头。
```

实例化(默认值,非必选配置)
```javascript
new frontError({
  useAjax: false,//是否使用接口上报信息 接口地址为reportUrl  默认使用图片地址发送 
  reportKey: "frontErrorInfo",//上报请求的key
  reportUrl: "https://justwe.com/img.png",//上报地址 接口地址/图片地址
  uuid: "justwe_uuid",//uuid 用户标识
  timeout: 5000, //接口响应过长阈值
  radom: 1, //错误过多减少上报数量  0-1 上报百分比 默认为100%上报
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
};
```

由于网络请求异常会触发一个Event接口的error事件，并执行该元素上的onerror()处理函数，但不会事件冒泡，因此必须在捕获阶段将其捕捉到才行，但是这种方式虽然可以捕捉到网络请求的异常，但是无法判断 HTTP 的状态是 404 还是403。通过断点调试发现当出现404错误时类型为ErrorEvent，对应的event确实是没有message的
```javascript
window.addEventListener('error', (msg) => {
  console.log(msg);
}, true);
```

## 异常上报方式
- 资源引入报错
  ```javascript
  {
    type: "resourceError",
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
    type: "eventError",
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
    type: "httpError"
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
        duration: time //接口响应时间时长 (毫秒)
      }
    }
  }
  ```

### 已知问题  
- 无法监测到jQuery2.x版本以下的接口报错，原因是jq重写了onreadystatechange方法覆盖 
- 压缩代码无法定位到错误具体位置，开sourceMap感觉不太好  
- 图片直接上报不太妥,考虑添加OPTIONS确定  

#### 参考   
[监控](https://segmentfault.com/a/1190000016959011#articleHeader10)    
[监控github](https://github.com/happylindz/blog/issues/5)