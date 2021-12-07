import * as fs from 'fs-extra'
import { exportExcelFile } from '../until/index'


export default class ExportFile {
  paths: string;
  mode: string;
  constructor () {
    this.paths = ''
    this.mode = 'root'
  }

  init (agv:{mode: string, paths: string}) {
    switch (agv.mode) {
      case 'root':
        this.paths = agv.paths
        this.modeRoot()
        break;
      case 'multiple':
        this.modeMultiple()
        break;
    }
  }

  modeRoot () {
    console.log('modeRoot');
    this.readDirectory()
  }

  modeMultiple () {
    console.log('modeMultiple');
  }

  // 读取目录
  readDirectory () {
    fs.readdir(this.paths).then(res => {
      const list = res
      const filterList: string[] = []

      list.map(item => {
        if(!item.toLowerCase().includes('index')) {
          filterList.push(item)
        }
      })

      filterList.length !== 0 && this.fileDataStructure(filterList)
      
    }).catch((err) => {
      console.log(err);
    })
  }

  // 处理数据结构
  fileDataStructure (filterList) {
    const Rows: string[][]= []
    const Header: Object[] = [{caption: 'code', type: 'string'}];
    
    for(let i = 0; i < filterList.length; i++) {
      try {
        // 读取文件、转为Object
        const file = fs.readFileSync(this.paths + '/' + filterList[i]);
        const files = file.toString().replace('export default', '')
        const obj = eval('(' + files + ')');

        // 设置表格头
        Header.push({caption: filterList[i].split('.')[0], type: 'string'})

        // 设置表格行内容
        Object.keys(obj).forEach((it, id) => {

          if(Rows[id] === undefined) {
            Rows[id] = []
          }
          if(i === 0) {
            Rows[id].push(it)
          } 
          Rows[id].push(obj[it])

        })
      } catch (err) {
        console.log(err);
      }
    }

    exportExcelFile(Header, Rows, 'locales')
    
  }
  
}