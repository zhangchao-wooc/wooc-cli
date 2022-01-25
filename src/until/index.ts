/** @format */

import * as path from 'path';
import * as fs from 'fs';
import * as nodeExcel from 'excel-export';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ora = require('ora');
import {DateFormat} from '@wooc/brokenwheel';

export const getRootPath = () => {
  return path.resolve(__dirname, '../../');
};
export const getVersion = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(path.join(getRootPath(), 'package.json')).version;
};

// 导出 Excel 文件
export const exportExcelFile = (cols, rows, fileName = '') => {
  const result = nodeExcel.execute({cols, rows});
  const time = new Date().getTime(); // 用来保证生成不同的文件名
  fileName = `${fileName || DateFormat(time)}.xlsx`; // 文件名

  const spinner = ora('正在导出...').start();
  fs.writeFile(fileName, result, 'binary', function (err) {
    if (err) {
      console.log(err);
    }
    console.log();
    spinner.succeed('导出完成：' + fileName);
  });
};
