import Report from './report.js';

;(function (name, definition) {
  if (typeof define === 'function') {// AMD环境或CMD环境
    define(definition);
  } else if (typeof module !== 'undefined' && module.exports) {// 检查上下文环境是否为Node
    module.exports = definition();
  } else {// 将模块的执行结果挂在window变量中，在浏览器中this指向window对象
    Function('return this')()[name] = definition();
  }
})('frontError', function () {
  return Report
});
window.onload = function () {
  document.getElementById("btn").onclick = function () {
    console.log(98765);
  }
}
// new Report({useAjax: true})
