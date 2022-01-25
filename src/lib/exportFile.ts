/** @format */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as child_process from 'child_process';
import {exportFile, logger} from '../until/index';

interface deepData {
  data: Record<string, unknown> | any;
  langNumber: number;
  parent: string;
}
export default class ExportFile {
  paths: string;
  exportFileType: string;
  newFileList: string[];
  jsonData: object;
  num: number;
  Rows: string[][];
  Header: any;
  constructor() {
    this.paths = '';
    this.exportFileType = '';
    this.newFileList = [];
    this.jsonData = {};
    this.num = 0; // 词条索引
    this.Rows = []; // 表格行数据
    this.Header = [{caption: 'code', type: 'string'}]; // 表格头
  }

  init(agv: {mode: string; paths: string; type: string}) {
    console.warn('init', agv);
    this.paths = path.join(process.cwd(), agv.paths);
    this.exportFileType = agv.type;
    switch (agv.mode) {
      case 'single':
        this.modeRoot();
        break;
      case 'multiple':
        this.modeMultiple();
        break;
      default:
        logger.error(`export: --mode 错误参数 ${agv.mode}，请检查 --mode 传参`);
        break;
    }
  }

  modeRoot() {
    this.readDirectory(this.paths);
  }

  modeMultiple() {
    child_process.exec('find . -name locales', (err, stdout, stderr) => {
      if (err) {
        throw `modeMultiple: ${err}`;
      }

      const dirList = stdout.split('\n').filter(item => {
        if (typeof item === 'string' && item !== '') {
          return item;
        }
      });
      console.log('modeMultiple', this.exportFileType);
      dirList.forEach(item => {
        console.log(path.join(process.cwd(), item));

        this.readDirectory(path.join(process.cwd(), item));
      });
    });
  }

  // 读取目录
  readDirectory(directoryPath: string) {
    fs.readdir(directoryPath)
      .then(res => {
        const list = res;
        const filterList: string[] = [];

        list.map(item => {
          if (!item.toLowerCase().includes('index')) {
            filterList.push(item);
          }
        });

        if (filterList.length !== 0) {
          this.copyFile(filterList, directoryPath);
        } else {
          logger.warn(`readDirectory：目录文件为空，请确认目录 ${directoryPath} 下是否存在多语言文件`);
        }
      })
      .catch(err => {
        throw `readDirectory: ${err}`;
      });
  }

  // 转换 ts 文件、修改为 cjs 导出方式
  async copyFile(filterList, directoryPath: string) {
    await filterList.forEach((e, i) => {
      if (e.includes('.ts')) {
        const filePath = path.join(directoryPath, e);
        const newFileName = e.replace('.ts', '.js');
        const outputPath = filePath.replace('.ts', '.js');
        try {
          const file = fs.readFileSync(filePath).toString().replace('export default', 'module.exports = ');
          fs.outputFileSync(outputPath, file);
          filterList[i] = newFileName;
          this.newFileList.push(outputPath);
        } catch (err) {
          throw `copyFile(${e}文件):${err}`;
        }
      }
    });

    await this.fileDataStructure(filterList, directoryPath);
  }

  // 处理数据结构
  async fileDataStructure(filterList, filePath: string) {
    for (let i = 0; i < filterList.length; i++) {
      try {
        // 读取文件内容
        const res = await import(path.join(filePath, filterList[i]))
          .then(res => {
            return res;
          })
          .catch(err => {
            console.log(err);
          });

        if (this.exportFileType === 'xlsx') {
          // 收集 xlsx 文件数据
          // 设置表格头
          this.Header.push({
            caption: filterList[i].split('.')[0],
            type: 'string',
          });
          await this.dealNestedData({
            data: res,
            langNumber: i,
            parent: '',
          });

          this.num = 0; // 清空当前词条索引
        } else if (this.exportFileType === 'json') {
          // 收集 json 文件数据
          this.jsonData[filterList[i].split('.')[0]] = res;
        } else {
          logger.warn(`fileDataStructure: 不支${this.exportFileType} 类型文件导出。请查看文档`);
          return;
        }
      } catch (err) {
        console.log(err);
      }
    }

    // 导出文件
    exportFile(
      this.exportFileType === 'xlsx' ? {cols: this.Header, rows: this.Rows} : JSON.stringify(this.jsonData),
      this.exportFileType,
      filePath,
    );
    this.Header = [{caption: 'code', type: 'string'}];
    this.Rows = [];
    this.jsonData = {};

    this.newFileList.forEach(item => {
      fs.remove(item)
        .then(() => {
          logger.log('\n转换文件删除成功！');
        })
        .catch(err => {
          logger.warn(`\n转换文件${item}删除失败: ${err}`);
        });
    });
  }

  // 处理嵌套数据
  async dealNestedData({data, langNumber, parent}: deepData) {
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
      } else if (d === '[object Object]') {
        this.dealNestedData({
          data: data[item],
          langNumber,
          parent: parent !== '' ? parent + '.' + item : item,
        });
      }
    });
  }
}
