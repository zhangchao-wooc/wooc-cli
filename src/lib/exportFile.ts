/** @format */

import * as fs from 'fs-extra';
import * as path from 'path';
import {exportExcelFile} from '../until/index';

interface deepData {
  data: Record<string, unknown> | any;
  langNumber: number;
  parent: string;
}
export default class ExportFile {
  paths: string;
  newFileList: string[];
  num: number;
  Rows: string[][];
  Header: any;
  constructor() {
    this.paths = '';
    this.newFileList = [];
    this.num = 0; // 词条索引
    this.Rows = []; // 表格行数据
    this.Header = [{caption: 'code', type: 'string'}]; // 表格头
  }

  init(agv: {mode: string; paths: string}) {
    switch (agv.mode) {
      case 'root':
        this.paths = agv.paths;
        this.modeRoot();
        break;
      case 'multiple':
        this.modeMultiple();
        break;
    }
  }

  modeRoot() {
    console.log('modeRoot');
    this.readDirectory();
  }

  modeMultiple() {
    console.log('modeMultiple');
  }

  // 读取目录
  readDirectory() {
    fs.readdir(this.paths)
      .then(res => {
        const list = res;
        const filterList: string[] = [];

        list.map(item => {
          if (!item.toLowerCase().includes('index')) {
            filterList.push(item);
          }
        });

        filterList.length !== 0 && this.copyFile(filterList);
      })
      .catch(err => {
        throw `readDirectory: ${err}`;
      });
  }

  // 转换 ts 文件、修改为 cjs 导出方式
  async copyFile(filterList) {
    await filterList.forEach((e, i) => {
      if (e.includes('.ts')) {
        const filePath = path.join(process.cwd(), this.paths, e);
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

    await this.fileDataStructure(filterList, path.join(process.cwd(), './locales/'));
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
      } catch (err) {
        console.log(err);
      }
    }

    // console.log(this.Rows, this.Header);
    exportExcelFile(this.Header, this.Rows, 'locales');
    this.newFileList.forEach(item => {
      fs.remove(item)
        .then(() => {
          console.log('\n转换文件删除成功！');
        })
        .catch(err => {
          console.warn(`\n转换文件${item}删除失败: ${err}`);
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
