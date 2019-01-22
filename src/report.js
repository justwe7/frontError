/**
 * @author huaxi.li
 * @date 2019-01-09
 * @class Report
 */
import { saveStorage,getStorage,clearStorage } from './util/util';
import proxyXMLHttpRequest from './util/xhr';

var Report = function (props = {reportUrl: "http://127.0.0.1:8888/", auto: true}) {
  this.reportUrl = props.reportUrl;
  this.splitSymbol = "&kx&";
  this.auto = props.auto;
  this.create();
}
Report.prototype.create = function () {
  this.auto && this.sendError();
  this.httpError();
  this.resourceError();
  this.eventError();
}
Report.prototype.sendError = function () {//上报报错信息
  let error = getStorage("_kx_error");
  if (error===null) {
    return false;
  }
  // console.log(error);
  new Image().src = `${this.reportUrl}?kxError=${error}`;
  clearStorage("_kx_error")
}
Report.prototype.report = function(obj) {
  let errVal;
  try {
    errVal = encodeURI(JSON.stringify(obj))
  } catch (error) {}
  
  new Image().src = `${this.reportUrl}?info=${errVal}`;
  // console.log(obj);
  // this.saveStorage(errVal);
}
Report.prototype.saveStorage = function(value) {//记录报错信息
  let storage = getStorage("_kx_error");
  let newError = storage===null ? value : (storage + this.splitSymbol + value);
  saveStorage("_kx_error", newError);
  var reg = new RegExp(this.splitSymbol, "g");  
  // console.warn(newError.match(reg));
  if (newError.match(reg) !== null && newError.match(reg).length>5 && this.auto) {
    // console.log(newError.match(reg).length);
    this.sendError();
  }
}
Report.prototype.resourceError = function() {
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
Report.prototype.eventError = function() {
  //代码运行报错
  const self = this;
  window.onerror = function() {
    let [errorMessage, fileName, lineNo, columNo] = arguments;
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
    // return true;
  };
}
Report.prototype.httpError = function() {
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
      const {status, statusText, response, responseURL} = ajax;
      const longTime = (+new Date > (3000+send_time)),httpError = !(status >= 200 && status < 208);

        //说明已经请求完毕
        if (longTime || httpError) {
          let obj = {
            type: "httpError",//类型  ErrorEvent  
            userAgent: window.navigator.userAgent,
            baseURI: window.location.href,
            time: +new Date,
            errorInfo: {
              req: {
                method: method,
                url: responseURL
              },
              res: {
                status,
                statusText,
                response,
                longTime
              }
            }
          }
          self.report(obj)
        }
      }
    }
  })
}
export default Report;