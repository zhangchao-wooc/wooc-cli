"use strict";
/** @format */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const child_process = require("child_process");
const index_1 = require("../until/index");
const common_1 = require("../common");
class ExportFile {
    constructor() {
        this.paths = '';
        this.exportFileType = '';
        this.newFileList = [];
        this.jsonData = {};
        this.num = 0; // 词条索引
        this.Rows = []; // 表格行数据
        this.Header = [{ caption: 'code', type: 'string' }]; // 表格头
    }
    init(agv) {
        console.warn('init', agv);
        this.paths = path.join(process.cwd(), agv.paths);
        this.exportFileType = agv.type;
        switch (agv.mode) {
            case 'single':
                this.modeSingle();
                break;
            case 'multiple':
                this.modeMultiple();
                break;
            default:
                index_1.logger.error(`export: --mode 错误参数 ${agv.mode}，请检查 --mode 传参`);
                break;
        }
    }
    modeSingle() {
        // 单文件导出
        this.readDirectory(this.paths);
    }
    modeMultiple() {
        // 多文件 递归查询处理后导出
        child_process.exec('find . -name locales', (err, stdout, stderr) => {
            if (err) {
                throw `modeMultiple: ${err}`;
            }
            const dirList = stdout.split('\n').filter(item => {
                if (typeof item === 'string' && item !== '') {
                    return item;
                }
            });
            dirList.forEach(item => {
                index_1.logger.log(`匹配文件：${path.join(process.cwd(), item)}`);
                this.readDirectory(path.join(process.cwd(), item));
            });
        });
    }
    // 读取目录
    readDirectory(directoryPath) {
        fs.readdir(directoryPath)
            .then(res => {
            const list = res;
            const filterList = [];
            const reg = /(.js|.ts|.json)/;
            list.map(item => {
                if (!item.toLowerCase().includes('index') && reg.test(item)) {
                    filterList.push(item);
                }
            });
            if (filterList.length !== 0) {
                this.copyFile(filterList, directoryPath);
            }
            else {
                index_1.logger.warn(`readDirectory：目录文件为空，请确认目录 ${directoryPath} 下是否存在多语言文件`);
            }
        })
            .catch(err => {
            throw `readDirectory: ${err}`;
        });
    }
    // 转换 ts 文件、修改为 cjs 导出方式
    copyFile(filterList, directoryPath) {
        return __awaiter(this, void 0, void 0, function* () {
            yield filterList.forEach((e, i) => {
                if (e.includes('.ts')) {
                    const filePath = path.join(directoryPath, e);
                    const newFileName = e.replace('.ts', '.js');
                    const outputPath = filePath.replace('.ts', '.js');
                    try {
                        const file = fs.readFileSync(filePath).toString().replace('export default', 'module.exports = ');
                        fs.outputFileSync(outputPath, file);
                        filterList[i] = newFileName;
                        this.newFileList.push(outputPath);
                    }
                    catch (err) {
                        throw `copyFile(${e}文件):${err}`;
                    }
                }
            });
            yield this.fileDataStructure(filterList, directoryPath);
        });
    }
    // 处理数据结构
    fileDataStructure(filterList, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0; i < filterList.length; i++) {
                try {
                    const fileName = filterList[i].split('.')[0];
                    // 读取文件内容
                    const res = yield Promise.resolve().then(() => require(path.join(filePath, filterList[i]))).then(res => {
                        return res;
                    })
                        .catch(err => {
                        console.log(err);
                    });
                    if (this.exportFileType === 'xlsx') {
                        // 收集 xlsx 文件数据
                        // 设置表格头
                        this.Header.push({
                            caption: common_1.region[fileName] ? common_1.region[fileName] : fileName,
                            type: 'string',
                        });
                        yield this.dealNestedData({
                            data: res,
                            langNumber: i,
                            parent: '',
                        });
                        this.num = 0; // 清空当前词条索引
                    }
                    else if (this.exportFileType === 'json') {
                        // 收集 json 文件数据
                        this.jsonData[fileName] = res;
                    }
                    else {
                        index_1.logger.warn(`fileDataStructure: 不支${this.exportFileType} 类型文件导出。请查看文档`);
                        return;
                    }
                }
                catch (err) {
                    console.log(err);
                }
            }
            // 导出文件
            (0, index_1.exportFile)(this.exportFileType === 'xlsx' ? { cols: this.Header, rows: this.Rows } : JSON.stringify(this.jsonData), this.exportFileType, filePath);
            // 初始数据
            this.Header = [{ caption: 'code', type: 'string' }];
            this.Rows = [];
            this.jsonData = {};
            this.newFileList.forEach(item => {
                fs.remove(item).catch(err => {
                    index_1.logger.warn(`\n转换文件${item}删除失败: ${err}`);
                });
            });
        });
    }
    // 处理嵌套数据
    dealNestedData({ data, langNumber, parent }) {
        return __awaiter(this, void 0, void 0, function* () {
            Object.keys(data).forEach(item => {
                const d = Object.prototype.toString.call(data[item]);
                if (d === '[object String]') {
                    if (this.Rows[this.num] === undefined) {
                        this.Rows[this.num] = [];
                    }
                    if (langNumber === 0) {
                        // 词条code
                        this.Rows[this.num].push(parent !== '' ? parent + '.' + item : item);
                    }
                    // 词条 value
                    this.Rows[this.num].push(data[item]);
                    this.num += 1; // 词条索引 + 1
                }
                else if (d === '[object Object]') {
                    this.dealNestedData({
                        data: data[item],
                        langNumber,
                        parent: parent !== '' ? parent + '.' + item : item,
                    });
                }
            });
        });
    }
}
exports.default = ExportFile;
//# sourceMappingURL=exportFile.js.map