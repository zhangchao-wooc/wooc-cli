/*
 * 导入多语言文件，更新本地兜底语言
 *
 * @format
 */
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
var shell = require('shelljs');
class ImportFile {
    constructor(options) {
        this.newData = {};
        this.filePath = options.path; // 写入路径
    }
    analyticalData(data) {
        Object.keys(data).forEach((item, index) => {
            this.newData[item] = {};
            let obj = {};
            Object.keys(data[item]).forEach((it, id) => {
                const o = this.stringToObject(it, data[item][it]);
                _.merge(obj, o);
            });
            this.newData[item] = obj;
        });
        this.writeFile();
    }
    // 三级嵌套整合
    stringToObject(key, value) {
        const arr = key.split('.');
        const obj = {};
        if (arr.length > 1 && obj[arr[0]] === undefined) {
            obj[arr[0]] = {};
        }
        else {
            obj[arr[0]] = value;
        }
        if (arr.length > 2 && obj[arr[0]][arr[1]] === undefined) {
            obj[arr[0]][arr[1]] = {};
        }
        else {
            obj[arr[0]][arr[1]] = value;
        }
        if (arr.length === 3) {
            obj[arr[0]][arr[1]][arr[2]] = value;
        }
        return obj;
    }
    // 导出文件并格式化
    writeFile() {
        Object.keys(this.newData).forEach(item => {
            const data = JSON.stringify(this.newData[item], '', '\t');
            const fileName = path.join(process.cwd(), this.filePath, item + '.ts');
            fs.writeFile(fileName, 'export default ' + data, null, function (err) {
                if (err) {
                    console.log(err);
                }
            });
        });
        // 格式化文件
        if (shell.exec('npm run lint').code !== 0) {
            shell.echo('Error: Git commit failed');
            shell.exit(1);
        }
    }
}
const fil = new ImportFile({
    path: 'src/locales/',
});
const l = {
    en: {
        'home.btn.one': '1',
        'home.btn.two': '2',
        'home.box': '3',
        'home.li': 'li',
        'home.btn.home': 'home',
    },
    zh: {
        'home.btn.one': '1',
        'home.btn.two': '2',
        'home.box': '3',
        'home.li': 'li',
        'home.btn.home': 'home',
    },
};
fil.analyticalData(l);
//# sourceMappingURL=importFile.js.map