/**
 * @author huaxi.li
 * @date 2019-01-09
 * @class Report
 */
import {
  getUuid,
  getCookie
} from "./util/util";
import proxyXMLHttpRequest from "./util/xhr";

const Report = function(
  {
    useAjax = false,//是否使用接口上报信息 接口地址为reportUrl  默认使用图片地址发送 
    reportKey = "frontErrorInfo",//上报请求的key
    reportUrl = "https://justwe.com/img.png",//上报地址 接口地址/图片地址
    uuid = "justwe_uuid",//uuid 用户标识
    timeout = 5000, //接口响应过长阈值
    radom = 1, //错误过多减少上报数量  0-1 上报百分比 默认为100%上报
  } = {}
) {
  this.useAjax = useAjax;
  this.reportUrl = reportUrl;
  this.reportKey = reportKey;
  this.httpLongTime = timeout;
  this.uuid = getCookie(uuid) || getUuid(uuid); 
  this.radom = parseFloat(radom);
  this.create();
};
Report.prototype.create = function() {
  this.httpError();
  this.resourceError();
  this.eventError();
};
Report.prototype.report = function(obj) {
  if(Math.random() > this.radom) {// 随机上报错误信息
    return false;
  }
  const isDevReg = new RegExp("^(http|https):(\/\/)localhost:");
  const {uuid, useAjax, reportKey, reportUrl} = this;
  if (isDevReg.test(window.location.origin)) return false;//localhost环境不上报
  let errVal;
  try {
    obj.uuid = uuid;
    errVal = JSON.stringify(obj);
    !useAjax && (errVal = errVal.replace(/"/g,""))//使用cdn地址上报删除"增加可读性
  } catch (error) {}
  const errInfo = `${reportUrl}?${reportKey}=${errVal}`;
  if (useAjax) {
    const ajax = new XMLHttpRequest();
    ajax.open('get', `${reportUrl}?${reportKey}=${errVal}`);
    ajax.send();
  } else {
    new Image().src = errInfo;
  }
};
Report.prototype.resourceError = function() {
  //资源请求异常
  window.addEventListener(
    "error",
    e => {
      const eventType = [].toString.call(e, e);
      if (eventType === "[object Event]") {
        // 过滤掉运行时错误
        /* var r, n = (r = e.target ? e.target : e.srcElement) && r.outerHTML;
        n && n.length > 200 && (n = n.slice(0, 200)); */
        let theTag = e.srcElement || e.originalTarget || e.target;
        var { tagName, outerHTML, href, src, currentSrc } = theTag;
        // let { srcElement: { tagName, outerHTML, href, src, currentSrc }} = e;
        // console.log(tagName);
        let resourceUri = href || src;
        if (tagName === "IMG") {
          Boolean(currentSrc) ? (resourceUri = currentSrc) : (resourceUri = "undefined");
          if (theTag.onerror !== null)  return false;//存在行内的 error事件  终止执行
        } else {
          (resourceUri === window.location.href) && (resourceUri = "undefined");
        }
        
        let obj = {
          type: "resourceError", //类型
          time: +new Date,
          errorInfo: {
            resourceUri, //资源
            outerHTML: outerHTML,
            tagName: tagName
          }
        };
        this.report(obj);
      }
    },
    true
  );
};
Report.prototype.eventError = function() {
  //代码运行报错
  const self = this;
  window.onerror = function() {
    let [errorMessage, scriptURI, lineNo, columNo, err] = arguments;
    let errStack;
    if (!!err && !!err.stack) {
      //可以直接使用堆栈信息
      errStack = err.stack.toString();
    } else if (!!arguments.callee) {
      //尝试通过callee获取异常堆栈
      let errmsg = [];
      try {
        let f = arguments.callee.caller,
          c = 3; //防止堆栈信息过大
        while (f && --c > 0) {
          errmsg.push(f.toString());
          if (f === f.caller) {
            break;
          }
          f = f.caller;
        }
      } catch (error) {}
      errmsg = errmsg.join(",");
      errStack = errmsg;
    } else {
      errStack = "";
    }
    let obj = {
      type: "eventError", //语法报错
      time: +new Date(),
      errorInfo: {
        scriptURI: scriptURI,
        message: errorMessage,
        lineNumber: lineNo,
        columnNumber: columNo,
        errStack: errStack.substring(0, 1000) || ""
      }
    };
    self.report(obj);
    // return true;
  };
};
Report.prototype.httpError = function() {
  //接口请求错误
  const self = this;
  proxyXMLHttpRequest({
    open() {
      this.method = (arguments[0] || [])[0];
    },
    send() {
      this.send_time = +new Date;
    },
    onreadystatechange: function(xhr) {
      const { xhr: ajax, method, send_time } = xhr;
      if (ajax.readyState == 4) {
        const { status, statusText, response, responseURL } = ajax;
        const ready_time = +new Date();
        const longTime = ready_time > (self.httpLongTime + send_time),
          httpError = (!(status >= 200 && status < 208) && (status !== 0));
        if (longTime || httpError) {
          let obj = {
            type: "httpError", //接口异常
            time: +new Date(),
            errorInfo: {
              req: {
                method: method,
                url: responseURL.split("?").shift()
              },
              res: {
                status,
                statusText,
                response,
                duration: ready_time-send_time
              }
            }
          };
          self.report(obj);
        }
      }
    }
  });
};

export default Report;