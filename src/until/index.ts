/** @format */

import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';
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

// 导出文件
export const exportFile = (file, type, filePath: string) => {
  const result = type === 'xlsx' ? nodeExcel.execute(file) : file;
  const time = new Date().getTime(); // 用来保证生成不同的文件名
  const fileName = `locales_${DateFormat(time)}.${type}`; // 文件名
  const exportPath = path.join(filePath, '../', fileName); // 导出路径 当前 locales 同级目录下
  const encoding = type === 'xlsx' ? 'binary' : 'utf-8';
  const spinner = ora('正在导出...').start();

  try {
    fs.writeFileSync(exportPath, result, encoding);
    spinner.succeed('导出完成：' + exportPath);
  } catch (err) {
    spinner.stop();
    throw `exportFile: ${err}`;
  }
};

export const logger = {
  error: (text: string) => console.log(chalk.red(text)),
  warn: (text: string) => console.log(chalk.magenta(text)),
  log: (text: string) => console.log(chalk.green(text)),
};
