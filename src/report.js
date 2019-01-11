
/**
 * XMLHttpRequest劫持源码参照 https://github.com/wendux/Ajax-hook
 * 
 * @author huaxi.li
 * @date 2019-01-09
 * @class Report
 */
import { saveStorage,getStorage,clearStorage } from './util/util';
import proxyXMLHttpRequest from './util/xhr';

export default class Report {
  constructor(props = {reportUrl: "http://127.0.0.1:8888/", auto: true}) {
    // console.log(props);
    this.reportUrl = props.reportUrl;
    this.dote = "&kx&";
    this.auto = props.auto;
    this.create();
  }
  create() {
    this.auto && this.sendError();
    this.httpError();
    this.resourceError();
    this.eventError();
  }
  sendError() {//上报报错信息
    let error = getStorage("_kx_error");
    if (error===null) {
      return false;
    }
    console.log(error);
    new Image().src = `${this.reportUrl}?kxError=${error}`;
    clearStorage("_kx_error")
  } 
  report(obj) {
    let errVal;
    try {
      errVal = encodeURI(JSON.stringify(obj))
    } catch (error) {}
    
    // new Image().src = `${this.reportUrl}?info=${errVal}`;
    // console.log(obj);
    this.saveStorage(errVal);
  }
  saveStorage(value) {//记录报错信息
    let storage = getStorage("_kx_error");
    let newError = storage===null ? value : (storage+ this.dote+value)
    saveStorage("_kx_error", newError);
    var reg = new RegExp(this.dote, "g");  
    // console.warn(newError.match(reg));
    console.log(newError.split(this.dote));
    if (newError.match(reg) !== null && newError.match(reg).length>1 && this.auto) {
      console.log(newError.match(reg).length);
      this.sendError();
    }
  }
  resourceError() {
    //资源报错
    window.addEventListener(
      "error",
      e => {
        const eventType = [].toString.call(e, e);
        if (eventType === "[object Event]") {// 过滤掉运行时错误
          // console.log(e)
          let obj = {
            type: "resourceError",//类型  
            userAgent: window.navigator.userAgent,
            baseURI: window.location.href,
            time: +new Date,
            errorInfo: {
              href: e.target.href || e.target.src,//资源
              outerHTML: e.target.outerHTML,
              tagName: e.target.tagName
            }
          }
          this.report(obj)
        }
      },
      true
    );
  }
  eventError() {
    //代码运行报错
    const self = this;
    window.onerror = function() {
      let [errorMessage, fileName, lineNo, columNo, error] = arguments;
      let obj = {
        type: "eventError",//类型  ErrorEvent  
        userAgent: window.navigator.userAgent,
        baseURI: window.location.href,
        time: +new Date,
        errorInfo: {
          "fileName": fileName,
          "message": errorMessage,
          "lineNumber": lineNo,
          "columnNumber": columNo
        }
      }
      self.report(obj)
      /* console.log("errorMessage:" + errorMessage);
      console.log("scriptURI:" + scriptURI);
      console.log("lineNo:" + lineNo); //异常行号
      console.log("columNo:" + columNo); //异常列号
      console.log("error:" + error); //异常堆栈信息 */
      return true;
    };
  }
  httpError() {
    //接口请求错误
    let self = this;
    // console.log(proxyXMLHttpRequest);
    proxyXMLHttpRequest({
      open() {
        this.method = (arguments[0] || [])[0];
      },
      send() {
        this.send_time = +new Date;
      },
      onreadystatechange: function(xhr) {
        // var ajax = xhr.xhr;
        const { xhr: ajax, method, send_time} = xhr;
        if (ajax.readyState == 4) {
          if (+new Date > (3000+send_time)) {//时间过长处理
            
          }
          //说明已经请求完毕
          if (ajax.status >= 200 && ajax.status < 208) {
            // console.log(ajax);
          } else {
            // console.log(ajax);
            let obj = {
              type: "httpError",//类型  ErrorEvent  
              userAgent: window.navigator.userAgent,
              baseURI: window.location.href,
              time: +new Date,
              errorInfo: {
                req: {
                  method: method,
                  url: ajax.responseURL
                },
                res: {
                  status: ajax.status,
                  statusText: ajax.statusText,
                  response: ajax.response
                }
              }
            }
            self.report(obj)
          }
        }
      }
    })
  }
}

/* ;(function (name, definition) {
  console.log(definition);
  alert(9);
  if (typeof define === 'function') {// AMD环境或CMD环境
    define(definition);
  } else if (typeof module !== 'undefined' && module.exports) {// 检查上下文环境是否为Node
    module.exports = definition();
  
  } else {// 将模块的执行结果挂在window变量中，在浏览器中this指向window对象
    this[name] = definition;
  }
})('Report', function () {
  return function (param) {
    new Report(param)
  };
}); */