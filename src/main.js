import Report from './report.js';
// new Report()  

;(function (name, definition) {
  if (typeof define === 'function') {// AMD环境或CMD环境
    define(definition);
  } else if (typeof module !== 'undefined' && module.exports) {// 检查上下文环境是否为Node
    module.exports = definition();
  } else {// 将模块的执行结果挂在window变量中，在浏览器中this指向window对象
    // window[name] = definition;
  }
  window[name] = definition();
})('frontError', function () {
  return Report
});
// import '../dist/report.js';
// console.log(Report);
// new Report({
//   reportUrl: "http://www.1763.com"
// })
// jhgfg

