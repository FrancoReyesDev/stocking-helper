import XLSX, { Sheet2JSONOpts } from "xlsx"
import path from "path"

export class WorkbookService{

    workbook:XLSX.WorkBook

    constructor(filename:string){
   
        this.workbook = this.createWorkbook(filename)
    }

    private createWorkbook(filename:string){
        const workbook = XLSX.readFile(filename)
        return workbook
    }

    public sheetToAoJson<item = unknown>(sheetName:string,headers:string[]){
        const opts:Sheet2JSONOpts = {header:headers,defval:null}
        const arrayOfJsons = XLSX.utils.sheet_to_json<item>(this.workbook.Sheets[sheetName],opts)
        return arrayOfJsons
    }

   

    
}