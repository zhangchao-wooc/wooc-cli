"use strict";
/** @format */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.exportFile = exports.getVersion = exports.getRootPath = void 0;
const path = require("path");
const fs = require("fs");
const chalk_1 = require("chalk");
const nodeExcel = require("excel-export");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ora = require('ora');
const brokenwheel_1 = require("@wooc/brokenwheel");
const getRootPath = () => {
    return path.resolve(__dirname, '../../');
};
exports.getRootPath = getRootPath;
const getVersion = () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(path.join((0, exports.getRootPath)(), 'package.json')).version;
};
exports.getVersion = getVersion;
// 导出文件
const exportFile = (file, type, filePath) => {
    const result = type === 'xlsx' ? nodeExcel.execute(file) : file;
    const time = new Date().getTime(); // 用来保证生成不同的文件名
    const fileName = `locales_${(0, brokenwheel_1.DateFormat)(time)}.${type}`; // 文件名
    const exportPath = path.join(filePath, '../', fileName); // 导出路径 当前 locales 同级目录下
    const encoding = type === 'xlsx' ? 'binary' : 'utf-8';
    const spinner = ora('正在导出...').start();
    try {
        fs.writeFileSync(exportPath, result, encoding);
        spinner.succeed('导出完成：' + exportPath);
    }
    catch (err) {
        spinner.stop();
        throw `exportFile: ${err}`;
    }
};
exports.exportFile = exportFile;
exports.logger = {
    error: (text) => console.log(chalk_1.default.red(text)),
    warn: (text) => console.log(chalk_1.default.magenta(text)),
    log: (text) => console.log(chalk_1.default.green(text)),
};
//# sourceMappingURL=index.js.map