/** @format */

module.exports = {
  extends: ['@commitlint/config-conventional'], // 当前 commit 校验使用的标准库（可插拔），内容可见下方
  rules: {
    // 这里自定义的配置会覆盖 @commitlint/config-conventional 中的规则
    // 'scope-enum': [
    //   // 自定义 范围规则
    //   2,
    //   'always',
    //   ['server', 'client'],
    // ],
    // 'type-enum': [
    //   // 自定义 类型规则
    //   2,
    //   'always',
    //   ['feature'],
    // ],
  },
};
