import * as path from 'path'
import * as fs from 'fs'
import * as nodeExcel from 'excel-export'
import { DateFormat } from '@wooc/brokenwheel';

export const getRootPath = () => {
  return path.resolve(__dirname, '../../');
}
export const getVersion = () => {
  return require(path.join(getRootPath(), 'package.json')).version;
}

// 导出 Excel 文件
export const exportExcelFile =  (cols, rows, fileName = '') => {
  const result = nodeExcel.execute({cols, rows });
  const time = new Date().getTime(); // 用来保证生成不同的文件名
  fileName =  `${fileName ||  DateFormat(time)}.xlsx`;  // 文件名
  
  console.log('正在导出...');
  
  fs.writeFile(fileName, result, 'binary', function(err){
    if(err){
      console.log(err);
    }
    console.log('导出完成：' + fileName);
  });
}