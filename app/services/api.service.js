
const request = require("request");
const GenericModel = require("../model/generic-model")
const moment = require('moment')
const _ = require("underscore")
const mongojs = require("mongojs");
const mongo = require("mongodb")
const fetch = require('node-fetch');
const cryptoServices = require("./cryptography.service");
const AWS = require('aws-sdk')
const config = require('../../config/config');
const stringSimilarity = require("string-similarity");
const { error } = require("console");
const https = require('https');
const send = require('koa-send');
const crypto = require('crypto')
const code = ''
var access_token1 = ''
var document_id=''
let pdf = false
let database = require('../../config/database')
const ExcelJS = require('exceljs');
const fs = require('fs').promises;  
const util = require('util');
const { resolve } = require("path");
const readFileAsync = util.promisify(fs.readFile);

            




class apiService {
    constructor() {
        this.transactionRequest = new GenericModel("signdesk_verification_requests");
        this.apiLogs = new GenericModel("signdesk_verification_api_logs");
        this.transactionLog = new GenericModel("signdesk_verification_transactions");
        this.apiCredentials = new GenericModel("signdesk_api_credentials");
        this.organisationInfo = new GenericModel("signdesk_organisation");
        this.kycSettings = new GenericModel("signdesk_kyc_workflow_settings");
        this.externalapiLog = new GenericModel("signdesk_vcip_external_api_log");
        this.masterSettings = new GenericModel("signdesk_master_settings");
        this.webhookLog = new GenericModel("signdesk_webhooks");
        this.subscriptionLogs = new GenericModel("signdesk_subscriptions");
        this.companyDataLogs = new GenericModel("finsensor_company_data")
        this.csvLogs = new GenericModel("finsensor_company_client_xl_logs")
    }


    async submitOiFormdata(ctx){
        return new Promise(async(resolve, reject) => {
            try {
                let params = ctx.request.body
                console.log("🚀 ~ file: api.service.js:43 ~ apiService ~ returnnewPromise ~ params:", params)
                params.dataToSet = {OiData:params.OiData}
                // let insert_data = {
                //     api_body: params,
                //     service_type: "authenticaton",
                //     reference_id: params?.reference_id,
                //     ip_address: ctx.request.ip,
                //     source: "",//add
                //     request_at: new Date,
                //     response: {},
                //     response_at: "",
                //     status:""
                // }
                let up_api_log = await this.companyDataLogs.updateById(params)
                if(up_api_log){
                    // await this.fillAndDownloadOiFile()

                    resolve({status:"success",uuid:up_api_log.insertedId})
                }
            } catch (error) {
                console.log("🚀 ~ file: api.service.js:107 ~ returnnewPromise ~ error:", error)
                
            }
        })
    }
    
    async  fillAndDownloadcocFile(uuid) {
        return new Promise(async(resolve, reject) => {
        try {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Input AJE');
            let up_api_log = await this.companyDataLogs.getInfo({_id: uuid})
            let data = up_api_log.excelData;
            // Extract unique years from the data
            // const uniqueYears = [...new Set(data.map(item => item.period))];
            const columns = ["Entity", "Gl Code", "Gl Description", "coc_name"];
            // Headers
            sheet.addRow(columns);
            // Fill data rows
            data.forEach(item => {
              const row = [
                // item.period,
                // "",
                item.Entity, // You mentioned making COC Name empty if not present
                item["Gl Code"],
                item["Gl Description"],
                "",
                // item.adjusted_amt,
                // item.narration
              ];
          
              // Fill data for each unique year
            //   uniqueYears.forEach(year => {
            //     const matchingData = data.find(dataItem => dataItem.unit_code === item.unit_code && dataItem.period === year);
            //     row.push(matchingData ? matchingData.period : ""); // Fill empty if the data is not present for the current entity and year
            //   });
          
              sheet.addRow(row);
            });
            // Save to a file
            await workbook.xlsx.writeFile('uploads/cocFile.xlsx');
            resolve('Excel file generated successfully!');
          
    
        } catch (err) {
          reject("Error:", err);
        }
    })
      }

    async  fillAndDownloadAdjFile(uuid) {
        return new Promise(async(resolve, reject) => {
        try {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Input AJE');
            let up_api_log = await this.companyDataLogs.getInfo({_id: uuid})
            let data = up_api_log.adjustmentControls;
            // Extract unique years from the data
            // const uniqueYears = [...new Set(data.map(item => item.period))];
            const columns = ["Fy", "Entity", "Adjustment Type", "Gl code", "Gl description", "CoC Name", "Amount", "Narration"];
            // Headers
            sheet.addRow(columns);
            // Fill data rows
            data.forEach(item => {
              const row = [
                item.period,
                // "",
                item.unit_code, // You mentioned making COC Name empty if not present
                item.adjustmentType,
                item.gl_code,
                item.gl_description,
                item.coc_name,
                item.adjusted_amt,
                item.narration
              ];
          
              // Fill data for each unique year
            //   uniqueYears.forEach(year => {
            //     const matchingData = data.find(dataItem => dataItem.unit_code === item.unit_code && dataItem.period === year);
            //     row.push(matchingData ? matchingData.period : ""); // Fill empty if the data is not present for the current entity and year
            //   });
          
              sheet.addRow(row);
            });
            // Save to a file
            await workbook.xlsx.writeFile('uploads/output2.xlsx');
            resolve('Excel file generated successfully!');
          
    
        } catch (err) {
          reject("Error:", err);
        }
    })
      }

    async  fillAndDownloadOiFile(uuid,date) {
        return new Promise(async(resolve, reject) => {
        try {
            const workbook = new ExcelJS.Workbook();
            const sheet = workbook.addWorksheet('Pivot OI');
            let up_api_log = await this.companyDataLogs.getInfo({_id: uuid})
            let data = up_api_log.OiData;
            // Extract unique years from the data
            const uniqueYears = [...new Set(data.map(item => item.period))];
            const columns = ["unit code", "area", "nature of information", "source of information", "measeurement", date, ...uniqueYears.map(year => `Year${year}`)];
            // Headers
            sheet.addRow(columns);
            // Fill data rows
            data.forEach(item => {
              const row = [
                item.unit_code,
                item.area, // You mentioned making COC Name empty if not present
                item.nature_of_information,
                item.source_of_information,
                item.measeurement,
                item.value
              ];
          
              // Fill data for each unique year
              uniqueYears.forEach(year => {
                const matchingData = data.find(dataItem => dataItem.unit_code === item.unit_code && dataItem.period === year);
                row.push(matchingData ? matchingData.period : ""); // Fill empty if the data is not present for the current entity and year
              });
              if(item.source_of_information != "" || item.value != "")
              sheet.addRow(row);
            });
            // Save to a file
            await workbook.xlsx.writeFile('uploads/output1.xlsx');
            resolve('Excel file generated successfully!');
          
    
        } catch (err) {
          reject("Error:", err);
        }
    })
      }
async  fillAndDownloadFile(uuid,date) {
    try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Client TB');
        // _id: "657f6dcc6bf2a85534e7493c"
        let up_api_log = await this.companyDataLogs.getInfo({_id: uuid})
        let data = up_api_log.excelData;
        // Extract unique years from the data
        const uniqueYears = [...new Set(data.map(item => item.Period))];
        // const columns = ["Entity", "COC Name", "GL Code", "GL Description", ...uniqueYears.map(year => `Year${year}`)];
        const columns = ["Entity", "COC Name", "GL Code", "GL Description",date];
        let checkData = []
        // Headers
        sheet.addRow(columns);
        // Fill data rows
        data.forEach(item => {
          const row = [
            item.Entity,
            item.coc_name, // You mentioned making COC Name empty if not present
            item["Gl Code"],
            item["Gl Description"],
            item.Amount
          ];
      
          // Fill data for each unique year
        //   let push
        //   uniqueYears.forEach(year => {
            // const matchingData = data.find(dataItem => dataItem.Entity === item.Entity && dataItem["Gl Code"] === item["Gl Code"] && dataItem["Gl Description"] === item["Gl Description"] && dataItem.Period === year);
            // let matchingData1
            // if(checkData.length>0)
                // let matchingData1 = checkData.find(dataItem => dataItem?.Entity === item.Entity && dataItem["Gl Code"] === item["Gl Code"] && dataItem["Gl Description"] === item["Gl Description"] && dataItem.Period === year && dataItem?.Amount === matchingData.Amount);
                // if(matchingData != null)
                // checkData.push(matchingData)
                // push = true
                // if(matchingData == matchingData1)
                // push = false
            // else 
            // row.push(matchingData ? matchingData.Amount : ""); // Fill empty if the data is not present for the current entity and year
        //   });
          if(item.coc_name != null){
            sheet.addRow(row);
          }
        });
        // Save to a file
        await workbook.xlsx.writeFile('uploads/output.xlsx');
        console.log('Excel file generated successfully!');
      

    } catch (err) {
      console.error("Error:", err);
    }
  }
    async submitData(ctx){
    return new Promise(async(resolve, reject) => {
        try {
            let params = ctx.request.body
            console.log("🚀 ~ file: api.service.js:43 ~ apiService ~ returnnewPromise ~ params:", params)
            // let insert_data = {
            //     api_body: params,
            //     service_type: "authenticaton",
            //     reference_id: params?.reference_id,
            //     ip_address: ctx.request.ip,
            //     source: "",//add
            //     request_at: new Date,
            //     response: {},
            //     response_at: "",
            //     status:""
            // }
            // 659801ed674995ccdce3cbe5
            let up_api_log = await this.companyDataLogs.insertOne(params)
            if(up_api_log){
            
                resolve({status:"success",uuid:up_api_log.insertedId})
            }
        } catch (error) {
            console.log("🚀 ~ file: api.service.js:107 ~ returnnewPromise ~ error:", error)
            
        }
    })
    }

    async  fileToArrayBuffer(filePath) {
        return new Promise(async(resolve, reject) => {
        try {
          // Read the file as a Buffer
          const fileBuffer = await fs.readFile(filePath);
      
          // Convert the Buffer to ArrayBuffer
          const arrayBuffer = fileBuffer.buffer.slice(
            fileBuffer.byteOffset,
            fileBuffer.byteOffset + fileBuffer.byteLength
          );
      
          resolve (arrayBuffer);
        } catch (err) {
          console.error('Error reading file:', err);
          throw err;
        }
    })
      }
    async fillAndSaveExistingFile () {
        return new Promise(async(resolve, reject) => {
        try {
            const { spawn } = require('child_process');
            const pythonProcess = spawn('python3', ['/home/mohits/UAE (copy)/app/services/document.py']);

            pythonProcess.stdout.on('data', (data) => {
              console.log(`Python Script Output: ${data}`);
            });

            pythonProcess.stderr.on('data', (data) => {
              console.error(`Error in Python Script: ${data}`);
            });

            pythonProcess.on('close', (code) => {
              console.log(`Python Script exited with code ${code}`);
              resolve({status:"success"})
            });
    //         const fs = require('fs');
    //         const util = require('util');
    //         const xlsx = require('xlsx');
    //         const filePath = 'app/assets/Output_Format.xlsx';
    //         const arrayBuffer = await this.fileToArrayBuffer(filePath);
    //         // Use the arrayBuffer as needed
    //         console.log(arrayBuffer);
    //         // Read existing workbook
    //         const workbook1 = xlsx.readFile('uploads/output.xlsx');
    // const sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];

    // // Read the contents of 2.xlsx
    // // const workbook2 = xlsx.readFile('app/assets/Output_Format.xlsx');
    // const workbook2 = xlsx.read(arrayBuffer, { cellStyles:true, cellHTML:true, cellFormula:true, cellText:true });
    // const sheetNames2 = workbook2.SheetNames;

    // const dataFromSheet1 = xlsx.utils.sheet_to_json(sheet1, { header: 1 });

    // // Replace the contents of the 19th sheet in 2.xlsx with the data from 1.xlsx
    // const targetSheetIndex = 19; // 19th sheet, zero-based index
    // const targetSheetName = sheetNames2[targetSheetIndex];

    // // Remove the existing target sheet
    // delete workbook2.Sheets[targetSheetName];

    // // Copy the source sheet properties, styles, and formatting to the target sheet
    // workbook2.Sheets[targetSheetName] = xlsx.utils.aoa_to_sheet(dataFromSheet1);

    // // Write the modified 2.xlsx back to the file
    // xlsx.writeFile(workbook2, 'uploads/3_modified.xlsx');

    // console.log('Sheet replaced in 2.xlsx successfully without changing designs.');
        } catch (err) {
          console.error('Error:', err);
        }})
      };
    async submitAuditorData(ctx){
    return new Promise(async(resolve, reject) => {
        try {
            let params = ctx.request.body
            params._id = params.uuid
            params.dataToSet = params.auditor_details
            // let insert_data = {
            //     api_body: params,
            //     service_type: "authenticaton",
            //     reference_id: params?.reference_id,
            //     ip_address: ctx.request.ip,
            //     source: "",//add
            //     request_at: new Date,
            //     response: {},
            //     response_at: "",
            //     status:""
            // }
            // let up_api_log = await this.uae_api_logs.insertOne()
            let up_api_log = await this.companyDataLogs.updateById(params)
            if(up_api_log){
                resolve({status:"success"})
            }
        } catch (error) {
            
        }
    })
    }

    async fetchData(ctx){
        return new Promise(async(resolve, reject) => {
            try {
                // this.fillAndSaveExistingFile()
                let params = ctx.request.body
                let up_api_log = await this.companyDataLogs.getInfo({_id:params.uuid})
                if(up_api_log){
                    let data = up_api_log.excelData
                    function filterDataByEntitiesAndGlCodes(entities, glCodes) {
                        return data.filter(item => entities.includes(item.Entity) && glCodes.includes(item['Gl Code']));
                      }
                      // Example usage
                    let entitiesToFilter = params.unit_filter;
                    let glCodesToFilter = params.glcodes_filter;
                    let filterData = filterDataByEntitiesAndGlCodes(entitiesToFilter, glCodesToFilter );
                    if(filterData.length == 0) filterData=up_api_log.excelData
                    let filteredData = await this.filterRepeatedData(filterData);
                    console.log(filteredData);
                    resolve({status:"success",filteredData:filteredData})
                }
            } catch (error) {
                console.log("error",error);
                resolve({status:"failed",message:"something went wrong"})    
            }
        })
    }

    async filterRepeatedData(inputData) {
        return new Promise(async(resolve, reject) => {
        const seenEntities = new Set();
        const seenGlCodes = new Set();
        const seenGlDescriptions = new Set();
      
         let newData = inputData.filter(row => {
          const isRepeatedEntity = seenEntities.has(row.Entity);
          const isRepeatedGlCode = seenGlCodes.has(row["Gl Code"]);
          const isRepeatedGlDescription = seenGlDescriptions.has(row["Gl Description"]);
      
          if (!isRepeatedEntity || !isRepeatedGlCode || !isRepeatedGlDescription) {
            seenEntities.add(row.Entity);
            seenGlCodes.add(row["Gl Code"]);
            seenGlDescriptions.add(row["Gl Description"]);
            return true;
          }
      
          return false;
        });
        resolve(newData)
    })
      }

    async submitFormdata(ctx){
    return new Promise(async(resolve, reject) => {
        try {
            let params = ctx.request.body
            const fs = require('fs');
            const csv = require('csv-parser');
            const xlsx = require('xlsx');
            const workbook = xlsx.readFile("app/assets/CoC_Master.xlsx");

            // Get the first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
                        
            // Convert the worksheet to JSON
            const jsonData = xlsx.utils.sheet_to_json(worksheet);
            const newArray = params.data
            // .filter(obj1 => (obj1["CoC Name"].trim() !== null || obj1["CoC Name"].trim() !== "")) // Filter out objects with empty coc_name
            .map(obj1 => {
              const matchingObj2 = jsonData.find(obj2 => (obj2["COC Name"] === obj1.coc_name || obj2["COC Name"] === obj1["CoC Name"]));
              return matchingObj2 ? { ...obj1, coc_code: matchingObj2["COC Code"] } : null; // Add a new key-value pair if matchingObj2 is found
            })
            .filter(obj => obj !== null); // Filter out objects that didn't have a matchingObj2
            //   let record = await database.updateOne("finsensor_company_data",
            //             { "Entity": entity, "Gl Code": glCode },
            //             {
            //                 $set: {
            //                     "Period": newData.Period,
            //                     "Entity": newData.Entity,
            //                     "Gl Code": newData["Gl Code"],
            //                     "Gl Description": newData["Gl Description"],
            //                     "Amount": newData.Amount,
            //                 }
            //             }
            //         );
            let completePush = false
            for(let eachlog in newArray){
            let updateParams = {
                query: { 'excelData': { $elemMatch: { "Entity": params.data[eachlog].unit_name?params.data[eachlog].unit_name:params.data[eachlog]["Entity"],"Gl Code":params.data[eachlog].GL_Code?params.data[eachlog].GL_Code:params.data[eachlog]["Gl Code"] } }, _id: mongojs.ObjectId(params.uuid) },
                update: {
                    $set: { "excelData.$[elem].coc_code": newArray[eachlog].coc_code,"excelData.$[elem].coc_name": newArray[eachlog].coc_name },//add createdat
                },
                arrayFilters: [{ "elem.Entity": newArray[eachlog].unit_name?newArray[eachlog].unit_name:newArray[eachlog]["Entity"], "elem.Gl Code": newArray[eachlog].GL_Code?newArray[eachlog].GL_Code:newArray[eachlog]["Gl Code"], "elem.Gl Description": newArray[eachlog].GL_Description?newArray[eachlog].GL_Description:newArray[eachlog]["Gl Description"] }]

                // new: true
            }
            
            // database.finsensor_company_data.findAndModify(updateParams, function (err, documentInfo) {
            //     if (err){

            //         console.log("🚀 ~ file: esign2.service.js:3283 ~ err:", err)
            //         deferred.reject(err)
            //     } 
            //     else{
            
            // console.log("🚀 ~ file: esign2.service.js:3284 ~ documentInfo:", documentInfo)
            //     deferred.resolve(documentInfo)
            //     }
            // })
            let up_api_log = await this.companyDataLogs.updateById(updateParams)
            
            if(up_api_log){
                completePush = true
            }else {
                completePush = false
                break;
            }
         }if(completePush) resolve({status:"success"})
         else resolve({status:"failed"})
        } catch (error) {
            console.log(error);
            reject({status:"failed"})
        }
    })
    }

    async getFile(ctx){
        return new Promise(async(resolve, reject) => {
            try {
                const fs = require('fs').promises;
                const base64 = require('base64-js');
                const xlsx = require('xlsx');
                if(ctx.request.query.fileName){
                    const filePath = 'app/assets/Output_Format.xlsx';
                    await this.fillAndDownloadFile(ctx.request.query.uuid,ctx.request.query.date)
                    await this.fillAndDownloadOiFile(ctx.request.query.uuid,ctx.request.query.date)
                    await this.fillAndDownloadAdjFile(ctx.request.query.uuid)
                    await this.fillAndSaveExistingFile()
                    const fileContent = await fs.readFile(filePath);
                    const base64Data = base64.fromByteArray(fileContent);
                    resolve({base64Data:base64Data})
                }else if(ctx.request.query.CocFile){
                    await this.fillAndDownloadcocFile(ctx.request.query.uuid)
                    const fileContent = await fs.readFile("uploads/cocFile.xlsx");
                    const base64Data = base64.fromByteArray(fileContent);
                    resolve({base64Data:base64Data})
                }else{
                    let nature_of_information = [
                        "Freehold Land",
                        "Buildings",
                        "Plant and Machinery",
                        "Furniture and fixtures",
                        "Vehicles",
                        "Office Equipments",
                        "Computer and Peripherals",
                        "Softwares",
                        "Leasehold land",
                        "Leasehold building",
                        "Leasehold plant and machinery",
                        "Details of open purchase orders on account of PPE for contractual commitment",
                        "Amount capitalized from CWIP during the period",
                        "Running Project - CWIP outstanding - for less than 1 year",
                        "Running Project - CWIP outstanding - for 1 year to 2 years",
                        "CWIP outstanding - for more than 2 years to 3 years",
                        "Running Project - CWIP outstanding - for more than 3 years",
                        "Suspended Project - CWIP outstanding - for less than 1 year",
                        "Suspended Project - CWIP outstanding - for 1 year to 2 years",
                        "Suspended Project - CWIP outstanding - for more than 2 years to 3 years",
                        "Suspended Project - CWIP outstanding - for more than 3 years",
                        "Total amount of trade receivable parties having individual outstanding balance of 10% or more of the total trade receivables at reporting date",
                        "In case of foreign currency trade receivables, provide the converted amount into functional currency - USD (Add a separate line for each type of currency)",
                        "In case of foreign currency trade receivables, provide total unrealized (gain)/loss amount on restatement of foreign currency trade receivables at reporting date",
                        "Undisputed Unbilled Accounts Receivables (considered good) (AR not billed but classified here, and collection is not conditional except passage of time)",
                        "Undisputed Accounts Receivable (considered good) - Not Due",
                        "Undisputed Accounts Receivable (considered good) outstanding from the due date of payment - for less than 6 months",
                        "Undisputed Accounts Receivable (considered good) outstanding from the due date of payment - for 6 months to 1 year",
                        "Undisputed Accounts Receivable (considered good) outstanding from the due date of payment - for more than 1 year to 2 years",
                        "Undisputed Accounts Receivable (considered good) outstanding from the due date of payment - for more than 2 years to 3 years",
                        "Undisputed Accounts Receivable (considered good) outstanding from the due date of payment - for more than 3 years",
                        "Disputed Accounts Receivables (considered good) - Not due",
                        "Disputed Accounts Receivable (considered good) outstanding from the due date of payment - for less than 6 months",
                        "Disputed Accounts Receivable (considered good) outstanding from the due date of payment - for 6 months to 1 year",
                        "Disputed Accounts Receivable (considered good) outstanding from the due date of payment - for more than 1 year to 2 years",
                        "Disputed Accounts Receivable (considered good) outstanding from the due date of payment - for more than 2 years to 3 years",
                        "Disputed Accounts Receivable (considered good) outstanding from the due date of payment - for more than 3 years",
                        "Undisputed Accounts Receivable (considered doubtful) - Not Due",
                        "Undisputed Accounts Receivable (considered doubtful) outstanding from the due date of payment - for less than 6 months",
                        "Undisputed Accounts Receivable (considered doubtful) outstanding from the due date of payment - for 6 months to 1 year",
                        "Undisputed Accounts Receivable (considered doubtful) outstanding from the due date of payment - for more than 1 year to 2 years",
                        "Undisputed Accounts Receivable (considered doubtful) outstanding from the due date of payment - for more than 2 years to 3 years",
                        "Undisputed Accounts Receivable (considered doubtful) outstanding from the due date of payment - for more than 3 years",
                        "Disputed Accounts Receivables (considered doubtful) - Not due",
                        "Disputed Accounts Receivable (considered doubtful) outstanding from the due date of payment - for less than 6 months",
                        "Disputed Accounts Receivable (considered doubtful) outstanding from the due date of payment - for 6 months to 1 year",
                        "Disputed Accounts Receivable (considered doubtful) outstanding from the due date of payment - for more than 1 year to 2 years",
                        "Disputed Accounts Receivable (considered doubtful) outstanding from the due date of payment - for more than 2 years to 3 years",
                        "Disputed Accounts Receivable (considered doubtful) outstanding from the due date of payment - for more than 3 years",
                        "Goods in transit - Raw Material",
                        "Goods in transit - Packing Material",
                        "Goods in transit - Finished goods",
                        "Goods in transit - Traded goods",
                        "Goods in transit - Stores and Spares",
                        "Provision for slow-moving/non-moving inventory - Raw Material",
                        "Provision for slow-moving/non-moving inventory - Packing Material",
                        "Provision for slow-moving/non-moving inventory - Work in Progress",
                        "Provision for slow-moving/non-moving inventory - Finished Goods",
                        "Provision for slow-moving/non-moving inventory - Traded Goods",
                        "Provision for slow-moving/non-moving inventory - Stores and Spares",
                        "Amount of Fixed Deposits having original maturity of up to 3 months",
                        "Amount of Fixed Deposits having original maturity of more than 3 months but remaining maturity up to 12 months",
                        "Amount of Fixed Deposits having original and remaining maturity of more than 12 months",
                        "In case of foreign currency cash and bank balances, provide the converted amount into functional currency - EURO",
                        "In case of foreign currency cash and bank balances, provide unrealized (gain)/loss amount on restatement of foreign currency cash and bank balances at year-end",
                        "Amount of dividend given on equity shares",
                        "Tax on equity dividend given (if applicable)",
                        "Amount of Net dividend in INR for the foreign exchange remitted during the period",
                        "In case of foreign currency trade payables, provide the converted amount into functional currency - EURO (add separate lines for each currency)",
                        "In case of foreign currency trade payables, provide unrealized (gain)/loss) amount on restatement of foreign creditors at year-end"
                      ]
                      
                    let data2 = [
                        ['period','unit name','area','nature of information','source of information','measurement','value']
                    ]
                      const measures = ['Details','Yes/No','Listing','Number','Foreign Currency','Report','Rs.','Period','Nature','Schedule','Tax Computation','Tax Rate','%','Years','Text','Name','Name and Amount']
                      let areaList = ctx.request.query.areaList.split(', ')
                      let measureList = ctx.request.query.measureList.split(', ')
                      let unitDetails = []
                      let companyData = await this.companyDataLogs.getInfo({ _id: ctx.request.query.uuid })
                if(companyData?.subsidiary_details.length>0){
                    let subsidiaryDetails = companyData.subsidiary_details
                    unitDetails = subsidiaryDetails.map(subsidiary => {
                        return subsidiary.nestedNestedForms.map(unit => ({
                            unitName: unit.unitName,
                            unitCode: unit.unitCode
                        }));
                    }).flat();
                }
                    //   for(let Period of uniquePeriod){
                      for(let unit of unitDetails){
                      for(let array of areaList){
                        for(let ni of nature_of_information){
                        for(let measure of measureList){
                        let newArray = [ctx.request.query.date,unit.unitName,array,ni,"",measure,""]
                            data2.push(newArray)
                        }}
                      }}
                    // }
                    //   console.log(uniquePeriod);
                      // Create a workbook and add a worksheet
                      const workbook1 = xlsx.utils.book_new();
                      const worksheet1 = xlsx.utils.aoa_to_sheet(data2);
                      
                      // Add the worksheet to the workbook
                      xlsx.utils.book_append_sheet(workbook1, worksheet1, 'Sheet 1');
                      
                      // Write the workbook to an XLSX file
                      const filePath = 'uploads/example.xlsx';
                      xlsx.writeFile(workbook1, filePath);
                      
                      console.log(`XLSX file "${filePath}" created successfully.`);
                // const filePath = 'uploads/example.xlsx';
    // const fileContent = await fs.readFile(filePath, 'utf-8');
    const fileContent = await fs.readFile(filePath);

    // Create a Blob from the file content
    // const blob = new Blob([fileContent], { type: 'application/octet-stream' });
    const base64Data = base64.fromByteArray(fileContent);
    // const decodedBuffer = Buffer.from(base64Data, 'base64');
    // await fs.writeFile('app/assets/new.xlsx', decodedBuffer);
    // console.log("🚀 ~ file: api.service.js:135 ~ apiService ~ returnnewPromise ~ decodedBuffer:", decodedBuffer)
    // Generate a downloadable URL
    // const downloadUrl = URL.createObjectURL(blob);

    // Set response headers
    // ctx.set('Content-Type', 'text/plain');
    // ctx.set('Content-Disposition', 'attachment; filename=downloadedFile.txt');

    // Write the URL to the response
    // ctx.body = downloadUrl;
    resolve({base64Data:base64Data})
}

    // Clean up the URL when the response is finished
    // ctx.res.on('finish', () => {
    //   URL.revokeObjectURL(downloadUrl);
    // });
            } catch (error) {
                console.log(error);
            }
        })
        }

    async replaceKey(obj, oldKey, newKey) {
        const updatedObj = { ...obj }; // Shallow copy
      
        if (updatedObj.hasOwnProperty(oldKey)) {
          updatedObj[newKey] = updatedObj[oldKey];
          delete updatedObj[oldKey];
        }
      
        return updatedObj;
      }
      
      

    async stringCompare(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                let uniqueGlcode = ""
                let uniqueGldescription
                let up_api_log = ""
                let arrayOfArrays
                let params = ctx.request.body
                // let txn_id = params.data.txn_id
                // resolve({url:"https://stg-id.uaepass.ae/idshub/authorize?response_type=code&client_id=sandbox_stage&scope=urn:uae:digitalid:profile:general&state=HnlHOJTkTb66Y5H&redirect_uri=http://localhost:4200/user&acr_values=urn:safelayer:tws:policies:authentication:level:low"})
                var customer_id;
                var signer_process_id = ''
                // let params = ctx.request.body;
                let file_path
                if(ctx.request && ctx.request.files){

                    file_path = ctx.request.files.file.path
                }
                else{
                    file_path = 'app/assets/sample.pdf'
                }
                // const reader = 
                const fs = require('fs');
                const csv = require('csv-parser');
                const xlsx = require('xlsx');
                const workbook = xlsx.readFile(file_path);

                // Get the first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                            
                // Convert the worksheet to JSON
                const jsonData = xlsx.utils.sheet_to_json(worksheet);
                let unitDetails = []
                let alert = false
                if(ctx.request.body.generateFile){

                const workbook2 = xlsx.readFile('app/assets/OI_Master.xlsx');

                // Get the first sheet
                const firstSheetName2 = workbook2.SheetNames[0];
                const worksheet2 = workbook2.Sheets[firstSheetName2];
                            
                // Convert the worksheet to JSON
                const jsonData2 = xlsx.utils.sheet_to_json(worksheet2);
                const arrayOfoimastersheet = jsonData2.map(obj => Object.values(obj));
                // let companyData = await this.companyDataLogs.getInfo({ "company_details.companyName": "softsensor" },{_id:-1})
                let companyData = await this.companyDataLogs.getInfo({ _id: params.uuid })
                if(companyData?.subsidiary_details.length>0){
                    let subsidiaryDetails = companyData.subsidiary_details
                    unitDetails = subsidiaryDetails.map(subsidiary => {
                        return subsidiary.nestedNestedForms.map(unit => ({
                            unitName: unit.unitName,
                            unitCode: unit.unitCode
                        }));
                    }).flat();
                }
                // if(up_api_log){
        //             for(let i=0; i<jsonData.length; i++){

        // const updatedObject = replaceKey(jsonData[i], 'Coc Name', 'coc_name');
        // console.log(updatedObject);
        const arrayOfObjects = [
            { id: 1, name: 'John' },
            { id: 2, name: 'Jane' },
            { id: 1, name: 'John' }, // Duplicate
            { id: 3, name: 'Doe' }
          ];
          
          // Function to find unique elements based on a specific property (e.g., 'id')
          function findUniqueByProperty(array, property) {
            return array.filter((obj, index, self) =>
              index === self.findIndex((o) => o[property] === obj[property])
            );
          }
          
          const uniquePeriod = findUniqueByProperty(jsonData, 'Period');
          const uniqueUnit = findUniqueByProperty(jsonData, 'Entity');
          let equation = []
        //   if (uniqueUnit.length > unitDetails.length) {
            // for(let unit in unitDetails){
                // if(uniqueUnit.Entity == unit.unitName){
                    const sortedArray1 = uniqueUnit.slice().sort((a, b) => a.Entity.localeCompare(b.Entity));
                    const sortedArray2 = unitDetails.   slice().sort((a, b) => a.unitName.localeCompare(b.unitName));    
                    for (let i = 0; i < sortedArray2.length; i++) {
                        for(let j = 0;j< sortedArray1.length; j++){

                        const obj1 = sortedArray1[j];
                        const obj2 = sortedArray2[i];
                    
                        // Compare objects based on the 'name' property
                        if (obj1.Entity == obj2.unitName) {
                          equation.push(obj2)
                        }                
                        }
                    }
            uniqueGlcode = findUniqueByProperty(jsonData,'Gl Code')
            uniqueGldescription = findUniqueByProperty(jsonData,'Gl Description')
        //   let uniqueArray = []
        //   let uniqueArray = uniquePeriod.concat(uniquePeriod,uniqueUnit,uniqueGlcode,uniqueGldescription)
          const seenObjects = new Set();
          let uniqueObjects = jsonData.filter(obj => {
          const objString = JSON.stringify(obj);  
          if (!seenObjects.has(objString)) {
              seenObjects.add(objString);
              return true;
          }  
          return false;
          });
          const unitNames = equation.map(unit => unit.unitName);
          const arrayOfObjects1 = Object.entries(uniqueObjects).map(([key, value]) => ({ key, ...value }));
          const filteredData = arrayOfObjects1.filter(item => unitNames.includes(item.Entity));

          const objectOfObjects = arrayOfObjects1.reduce((accumulator, currentObject) => {
            const { key, ...rest } = currentObject; // Extracting 'key' from the current object
            accumulator[currentObject.key] = rest;
            return accumulator;
          }, {});
          if(params.update_data){
          let sendData ={
            request:{
                body:{data:filteredData,uuid:params.uuid}
            }
          }
          let formresponse = await this.submitFormdata(sendData)
          resolve({formResponse:formresponse})
        }else{

        
          up_api_log = await this.companyDataLogs.updateById({_id:params.uuid,dataToSet:{excelData:filteredData}})
          console.log("🚀 ~ file: api.service.js:299 ~ apiService ~ returnnewPromise ~ up_api_log:", up_api_log)

if(equation.length != uniqueUnit.length){
    alert = true
    // function removeObjectsByEntity(array, entityToRemove) {
        // return array.filter(obj => obj.Entity == entityToRemove);
    //   }
    //   let newArray
// for(let eq of equation){

    
//       const entityToRemove = eq.unitName
    
//     // Remove objects with the specified entity
//     newArray = removeObjectsByEntity(uniqueObjects, entityToRemove);
//     console.log("🚀 ~ file: api.service.js:289 ~ apiService ~ returnnewPromise ~ newArray:", newArray)
// }
// uniqueObjects = newArray
}
unitDetails = equation

        //   let bigData = uniqueUnit.length > uniquePeriod.length? uniqueUnit:uniquePeriod
        //   let smallData = 
        //   for()
        let data2 = [
            ['period','unit name','area','nature of information','source of information','measurement','value']
        ]
          const measures = ['Details','Yes/No','Listing','Number','Foreign Currency','Report','Rs.','Period','Nature','Schedule','Tax Computation','Tax Rate','%','Years','Text','Name','Name and Amount']
          for(let Period of uniquePeriod){
          for(let unit of unitDetails){
          for(let array of arrayOfoimastersheet){
            for(let measure of measures){
            let newArray = [Period.Period,unit.unitName,array[0],array[1],"",measure,""]
                data2.push(newArray)
            }
          }}}
          console.log("🚀 ~ file: api.service.js:185 ~ apiService ~ returnnewPromise ~ uniqueUnit:", uniqueUnit)
          console.log(uniquePeriod);
          const data = [
            ['Name', 'Age', 'Country'],
            ['John Doe', 30, 'USA'],
            ['Jane Doe', 25, 'Canada'],
            ['Bob Smith', 35, 'UK']
          ];
          const data1 = [{
            Period: 2022,
            Entity: "Bangalore",
            "Coc Name": "Security deposits given - Non Current",
            "Gl Code": 111000000000,
            "Gl Description": "S D WITH STAR DEN MEDIA",
            Amount: 2500,
          }]
          
          // Create a workbook and add a worksheet
          const workbook1 = xlsx.utils.book_new();
          const worksheet1 = xlsx.utils.aoa_to_sheet(data2);
          
          // Add the worksheet to the workbook
          xlsx.utils.book_append_sheet(workbook1, worksheet1, 'Sheet 1');
          
          // Write the workbook to an XLSX file
          const filePath = 'uploads/example.xlsx';
          xlsx.writeFile(workbook1, filePath);
          
          console.log(`XLSX file "${filePath}" created successfully.`);
        // }
        // const arrayOfArrays = jsonData.map(obj => Object.values(obj));
        if(companyData?.subsidiary_details.length>0)
        //  arrayOfArrays = uniqueObjects.map(obj => Object.values(obj));
         arrayOfArrays = filteredData.map(obj => Object.values(obj)); //uniqueObjects.map(obj => Object.values(obj));
        else {
            alert = true
            resolve({status:"failed",alert:alert,message:"unit code empty"})
        }}
        } else arrayOfArrays = arrayOfArrays = jsonData.map(obj => {
            const keys = ['period','unit name', 'area', 'nature of information', 'source of information', 'measurement', 'value'];
          
            return keys.map(key => obj[key] !== undefined ? obj[key] : '');
          });
        console.log("🚀 ~ file: api.service.js:171 ~ apiService ~ returnnewPromise ~ arrayOfArrays:", arrayOfArrays)

                    resolve({status:"success",csvdata:arrayOfArrays,unit_details:unitDetails,alert:alert,uniqueId:up_api_log.insertedId,uniqueGlcode:uniqueGlcode})
                // }
                console.log(jsonData);
                const results =[]
                // fs.createReadStream(file_path)
                //     .pipe(csv())
                //     .on('data', (data) => {
                //       // Process each row of data
                //       results.push(data);
                //     })
                //     .on('end', () => {
                //       // All rows have been read
                //       console.log(results);
                //     })
                //     .on('error', (error) => {
                //       console.error('Error reading CSV:', error.message);
                //     });
                // if (ctx.originalUrl) {
                //     const { URL } = require('url');
                //     const urlString = "http://localhost:6019" + ctx.originalUrl;
                //     const parsedUrl = new URL(urlString);
                //     var queryParams = parsedUrl.searchParams;
                //     var status = queryParams.get('status'); // 'John'
                //     signer_process_id = queryParams.get('signer_process_id');
                //     if (signer_process_id && status == 'finished') {
                //         // await this.ltv()
                //         resolve(status + " to sign document")
                //     }
                // }
                // if (!signer_process_id) {
                //     let initial_auth = await this.authorizeGet(params)
                //     if (initial_auth && initial_auth.access_token) {
                //         access_token1 = initial_auth.access_token
                //         let access_token = await this.accessToken({ access_token: initial_auth.access_token, path:file_path })
                //         document_id = access_token.documents[0].id
                //         if (access_token) {
                //             resolve({url:access_token.tasks.pending[0].url,url2:access_token.documents[0].url,access_token:access_token1,document_id:document_id})
                //         }
                //     }
                // }
            }
            catch (err) {
                resolve({
                    status: "failed",
                    error: "Unknown error",
                    error_code: "dv-005",
                    response_time_stamp: moment().format()
                })
            }
        })
    }
    async authorizeGet(params) {
        return new Promise(async (resolve, reject) => {
            var request = require('request');
            const https = require('https');
            const crypto = require('crypto')
            const axios = require('axios');
            const agent = new https.Agent({
                secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
            });
            const options = {
                'method': 'POST',
                'url': 'https://stg-id.uaepass.ae/trustedx-authserver/oauth/main-as/token?grant_type=client_credentials&scope=urn:safelayer:eidas:sign:process:document',
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': "Basic c2FuZGJveF9zdGFnZTpzYW5kYm94X3N0YWdl"
                },
                agent: agent,
                json: true
            };
            request(options, function (error, response) {
                if (error) reject(error);
                resolve(response.body);
            });
        })
    }

    // async accessToken(params) {
    //     return new Promise(async (resolve, reject) => {
    //         if (!params.access_token && !params.path) {
    //             reject(" no credentials")
    //         }
    //         var request = require('request');
    //         const https = require('https');
    //         const crypto = require('crypto')
    //         const axios = require('axios');
    //         const agent = new https.Agent({
    //             secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
    //         });
    //         var fs = require('fs');
    //         var options = {
    //             'method': 'POST',
    //             'url': 'https://stg-id.uaepass.ae/trustedx-resources/esignsp/v2/signer_processes',
    //             'headers': {
    //                 'Authorization': 'Bearer' + ' ' + params.access_token
    //             },
    //             formData: {
    //                 'process': '{\n  "process_type": "urn:safelayer:eidas:processes:document:sign:esigp",\n  "labels": [\n    [\n      "digitalid",\n      "server",\n      "qualified"\n    ]\n  ],\n  "signer": {\n    "signature_policy_id": "urn:safelayer:eidas:policies:sign:document:pdf",\n    "parameters": {\n      "type": "pades-baseline",\n      "signature_field": {\n        "name": "Sign1",\n        "location": {\n          "page": {\n            "number": "last"\n          },\n          "rectangle": {\n            "x": 100,\n            "y": 110,\n            "height": 150,\n            "width": 400\n          }\n        },\n        "appearance": {\n          "signature_details": {\n            "details": [\n              {\n                "type": "subject",\n                "title": "Signer Name: "\n              },\n              {\n                "type": "date",\n                "title": "Signature Date: "\n              }\n            ]\n          }\n        }\n      }\n    }\n  },\n  "ui_locales": [\n    "en_US"\n  ],\n  "finish_callback_url": "http://localhost:4200/user",\n  "views": {\n    "document_agreement": {\n      "skip_server_id": "true"\n    }\n  },\n  "timestamp": {\n    "provider_id": "urn:uae:tws:generation:policy:digitalid"\n  }\n}',
    //                 'document': {
    //                     'value': fs.createReadStream(params.path),
    //                     'options': {
    //                         'filename': 'sample.pdf',
    //                         'contentType': null
    //                     }
    //                 }
    //             },
    //             agent: agent,
    //             json: true
    //         };
    //         request(options, function (error, response) {
    //             if (error) reject(error);
    //             resolve(response.body);
    //         });
    //     })
    // }
    async ltv(params) {
        return new Promise(async (resolve, reject) => {
            var FileReader = require('filereader');
            var request = require('request');
            const https = require('https');
            const crypto = require('crypto')
            const agent = new https.Agent({
                secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
            });
            const xml2js = require('xml2js');
            const fs = require('fs');

            const pdfFilePath = params.signed_pdf

            function pdfToBase64(filePath) {
                try {
                    const pdfData = fs.readFileSync(filePath);
                    const base64Data = pdfData.toString('base64');
                    return base64Data;
                } catch (err) {
                    console.error('Error reading or converting PDF to Base64:', err);
                    return null;
                }
            }
            const toBase64 = file => new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                });
                // let pdf = await toBase64(pdfFilePath)
            const base64String = pdfToBase64(pdfFilePath);
            // var base64Str = Buffer.from(data).toString('base64');
            var base = "JVBERi0xLjMNCiXi48/TDQoNCjEgMCBvYmoNCjw8DQovVHlwZSAvQ2F0YWxvZw0KL091dGxpbmVzIDIgMCBSDQovUGFnZXMgMyAwIFINCj4+DQplbmRvYmoNCg0KMiAwIG9iag0KPDwNCi9UeXBlIC9PdXRsaW5lcw0KL0NvdW50IDANCj4+DQplbmRvYmoNCg0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDINCi9LaWRzIFsgNCAwIFIgNiAwIFIgXSANCj4+DQplbmRvYmoNCg0KNCAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDMgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDkgMCBSIA0KPj4NCi9Qcm9jU2V0IDggMCBSDQo+Pg0KL01lZGlhQm94IFswIDAgNjEyLjAwMDAgNzkyLjAwMDBdDQovQ29udGVudHMgNSAwIFINCj4+DQplbmRvYmoNCg0KNSAwIG9iag0KPDwgL0xlbmd0aCAxMDc0ID4+DQpzdHJlYW0NCjIgSg0KQlQNCjAgMCAwIHJnDQovRjEgMDAyNyBUZg0KNTcuMzc1MCA3MjIuMjgwMCBUZA0KKCBBIFNpbXBsZSBQREYgRmlsZSApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY4OC42MDgwIFRkDQooIFRoaXMgaXMgYSBzbWFsbCBkZW1vbnN0cmF0aW9uIC5wZGYgZmlsZSAtICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjY0LjcwNDAgVGQNCigganVzdCBmb3IgdXNlIGluIHRoZSBWaXJ0dWFsIE1lY2hhbmljcyB0dXRvcmlhbHMuIE1vcmUgdGV4dC4gQW5kIG1vcmUgKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NTIuNzUyMCBUZA0KKCB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDYyOC44NDgwIFRkDQooIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjE2Ljg5NjAgVGQNCiggdGV4dC4gQW5kIG1vcmUgdGV4dC4gQm9yaW5nLCB6enp6ei4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjA0Ljk0NDAgVGQNCiggbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDU5Mi45OTIwIFRkDQooIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNTY5LjA4ODAgVGQNCiggQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA1NTcuMTM2MCBUZA0KKCB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBFdmVuIG1vcmUuIENvbnRpbnVlZCBvbiBwYWdlIDIgLi4uKSBUag0KRVQNCmVuZHN0cmVhbQ0KZW5kb2JqDQoNCjYgMCBvYmoNCjw8DQovVHlwZSAvUGFnZQ0KL1BhcmVudCAzIDAgUg0KL1Jlc291cmNlcyA8PA0KL0ZvbnQgPDwNCi9GMSA5IDAgUiANCj4+DQovUHJvY1NldCA4IDAgUg0KPj4NCi9NZWRpYUJveCBbMCAwIDYxMi4wMDAwIDc5Mi4wMDAwXQ0KL0NvbnRlbnRzIDcgMCBSDQo+Pg0KZW5kb2JqDQoNCjcgMCBvYmoNCjw8IC9MZW5ndGggNjc2ID4+DQpzdHJlYW0NCjIgSg0KQlQNCjAgMCAwIHJnDQovRjEgMDAyNyBUZg0KNTcuMzc1MCA3MjIuMjgwMCBUZA0KKCBTaW1wbGUgUERGIEZpbGUgMiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY4OC42MDgwIFRkDQooIC4uLmNvbnRpbnVlZCBmcm9tIHBhZ2UgMS4gWWV0IG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NzYuNjU2MCBUZA0KKCBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY2NC43MDQwIFRkDQooIHRleHQuIE9oLCBob3cgYm9yaW5nIHR5cGluZyB0aGlzIHN0dWZmLiBCdXQgbm90IGFzIGJvcmluZyBhcyB3YXRjaGluZyApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY1Mi43NTIwIFRkDQooIHBhaW50IGRyeS4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NDAuODAwMCBUZA0KKCBCb3JpbmcuICBNb3JlLCBhIGxpdHRsZSBtb3JlIHRleHQuIFRoZSBlbmQsIGFuZCBqdXN0IGFzIHdlbGwuICkgVGoNCkVUDQplbmRzdHJlYW0NCmVuZG9iag0KDQo4IDAgb2JqDQpbL1BERiAvVGV4dF0NCmVuZG9iag0KDQo5IDAgb2JqDQo8PA0KL1R5cGUgL0ZvbnQNCi9TdWJ0eXBlIC9UeXBlMQ0KL05hbWUgL0YxDQovQmFzZUZvbnQgL0hlbHZldGljYQ0KL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcNCj4+DQplbmRvYmoNCg0KMTAgMCBvYmoNCjw8DQovQ3JlYXRvciAoUmF2ZSBcKGh0dHA6Ly93d3cubmV2cm9uYS5jb20vcmF2ZVwpKQ0KL1Byb2R1Y2VyIChOZXZyb25hIERlc2lnbnMpDQovQ3JlYXRpb25EYXRlIChEOjIwMDYwMzAxMDcyODI2KQ0KPj4NCmVuZG9iag0KDQp4cmVmDQowIDExDQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMTkgMDAwMDAgbg0KMDAwMDAwMDA5MyAwMDAwMCBuDQowMDAwMDAwMTQ3IDAwMDAwIG4NCjAwMDAwMDAyMjIgMDAwMDAgbg0KMDAwMDAwMDM5MCAwMDAwMCBuDQowMDAwMDAxNTIyIDAwMDAwIG4NCjAwMDAwMDE2OTAgMDAwMDAgbg0KMDAwMDAwMjQyMyAwMDAwMCBuDQowMDAwMDAyNDU2IDAwMDAwIG4NCjAwMDAwMDI1NzQgMDAwMDAgbg0KDQp0cmFpbGVyDQo8PA0KL1NpemUgMTENCi9Sb290IDEgMCBSDQovSW5mbyAxMCAwIFINCj4+DQoNCnN0YXJ0eHJlZg0KMjcxNA0KJSVFT0YNCgoxNyAwIG9iago8PC9GVC9TaWcvVChTaWduMSkvViAxMSAwIFIvRiAxMzIvVHlwZS9Bbm5vdC9TdWJ0eXBlL1dpZGdldC9SZWN0WzEwMCAxMTAgNTAwIDI2MF0vQVA8PC9OIDE2IDAgUj4+L1AgNiAwIFIvRFI8PC9YT2JqZWN0PDwvRlJNIDE1IDAgUj4+Pj4+PgplbmRvYmoKMTEgMCBvYmoKPDwvVHlwZS9TaWcvRmlsdGVyL0Fkb2JlLlBQS0xpdGUvU3ViRmlsdGVyL0VUU0kuQ0FkRVMuZGV0YWNoZWQvTShEOjIwMjMwODE1MTA1NjQ3KzA0JzAwJykvQnl0ZVJhbmdlIFswIDMzODIgMjc5NjAgMjI3NyBdICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgL0NvbnRlbnRzIDwzMDgwMDYwOTJhODY0ODg2ZjcwZDAxMDcwMmEwODAzMDgwMDIwMTAxMzEwZjMwMGQwNjA5NjA4NjQ4MDE2NTAzMDQwMjAxMDUwMDMwODAwNjA5MmE4NjQ4ODZmNzBkMDEwNzAxMDAwMGEwODAzMDgyMDYwZTMwODIwM2Y2YTAwMzAyMDEwMjAyMTQxN2ExOTVhMTljYzAzODc0MjM2NDRhNDExMWE3YjNiODYwMTUxNjU0MzAwZDA2MDkyYTg2NDg4NmY3MGQwMTAxMGMwNTAwMzA0YTMxMGIzMDA5MDYwMzU1MDQwNjEzMDI0MTQ1MzExNzMwMTUwNjAzNTUwNDBhMTMwZTU1NDE0NTIwNDc2Zjc2NjU3MjZlNmQ2NTZlNzQzMTIyMzAyMDA2MDM1NTA0MDMxMzE5NTM1NDQ3MjA0OTQzNDEyMDUxNzU2MTZjNjk2NjY5NjU2NDIwNDM0MTIwNTIzNDUzMzMzMDFlMTcwZDMyMzMzMDM4MzEzMTMxMzEzMjMwMzIzNjVhMTcwZDMyMzYzMDM4MzEzMTMxMzEzMjMwMzIzNjVhMzA3YjMxMGIzMDA5MDYwMzU1MDQwNjEzMDI0MTQ1MzExNzMwMTUwNjAzNTUwNDBhMTMwZTU1NDE0NTIwNDc2Zjc2NjU3MjZlNmQ2NTZlNzQzMTExMzAwZjA2MDM1NTA0MGIxMzA4NTU0MTQ1MjA1MDQxNTM1MzMxMjYzMDI0MDYwMzU1MDQwMzEzMWQ1MDUyNDE0MzQ4NDkyMDRkNDk1MzQ4NTI0MTIwNTI1NTQ0NTI0MTIwNGI0MTIwNGQ0OTUzNDg1MjQxMzExODMwMTYwNjAzNTUwNDA1MTMwZjM3MzgzNDMxMzkzNzM5MzQzODM4MzczMjM1MzkzOTMwODIwMTIyMzAwZDA2MDkyYTg2NDg4NmY3MGQwMTAxMDEwNTAwMDM4MjAxMGYwMDMwODIwMTBhMDI4MjAxMDEwMGFjZjc0Y2M1OWNiZTg5NzFlNTkwNGUwODQ5ZmQyYWQ5OTBmZjE0YWMyYWY0ZjBkNDZkNWZiNDQ1NGUyYTA3MDIzNGRjYmQ3ZmM5ZTNhYzU0OGNkOTg2YzAxZDc5NzdlYWExMDMzNWNlNDczYWViOTdlZjE1Y2Y5OTdkOWZmYmJmZWEzMWMwODVmNWQ4NDhjZGVkODlkYTkyOGE4MDIxODMyYmUzYjA5MjEzYTFjMWQ2OWRhYTUyYjU2YWVkNGU4OTQ4MDcyNDBiZDA1NDFmZDk2YzlhYjA4OWM5NDRlM2JjOGQ5NzZmNGFkOTc3NTNiNzExODRjNDdiNjJkMGQyYWFiYzM0ZWMyZDhjMDI3MzcwNTQ0MjA3YzgyMTIxYjZmNTZjOTdhNWU3NzUxOTA4MGI0NGU1MTA2NjgxNzJkOGYxMzExMjAyMmIwZTNiNjAwNzAwZjI1YmZlMzYwYzNjMzQ0YmEzN2RlMTc4MDdkYjY0NDc2MDA4MGIwOWEyM2U0Yjk4MjM1MWQ3MjY0NjkzMzc5YWY3MmE3YmY0MGMzMDgyYzdmZTU5ZjVlZDJlODc3NGUyZjQ0YjAxNGJhNTVkMjRkZGUxZmEwOGI4MzQwOTExMTNhZDI2MDViYTVhYjA0NzRjNDNmZWMwYTgxYzViYjhmZTE2YmViZmEzMzFjOGIzMDIwMzAxMDAwMWEzODIwMWI5MzA4MjAxYjUzMDBlMDYwMzU1MWQwZjAxMDFmZjA0MDQwMzAyMDY0MDMwMGMwNjAzNTUxZDEzMDEwMWZmMDQwMjMwMDAzMDgxOGIwNjA4MmIwNjAxMDUwNTA3MDEwMTA0N2YzMDdkMzAzMTA2MDgyYjA2MDEwNTA1MDczMDAxODYyNTY4NzQ3NDcwM2EyZjJmNjM2MTJkNzM2NTcyNzY2OTYzNjUyZDczNzQ2NzJlNmY2MzczNzAyZTY5NjM2MTJlNjc2Zjc2MmU2MTY1MzA0ODA2MDgyYjA2MDEwNTA1MDczMDAyODYzYzY4NzQ3NDcwM2EyZjJmNzI2NTcwNmY3MzY5NzQ2ZjcyNzkyZDczNzQ2NzJlNjk2MzYxMmU2NzZmNzYyZTYxNjUyZjYzNjU3Mjc0MmY0OTQzNDE1MTc1NjE2YzY5NjY2OTY1NjQ0MzQxNTIzNDUzMzMyZTYzNzI3NDMwMWYwNjAzNTUxZDIzMDQxODMwMTY4MDE0ZDAxMDJlOTEyZjVjMGQ0MmFjNmZkOWJkY2YzNjg2MWZiZGNhMGJjMzMwNTgwNjAzNTUxZDIwMDQ1MTMwNGYzMDNlMDYwYjYwODYxMDAxMDEwNzAxMDIwMDAyMDEzMDJmMzAyZDA2MDgyYjA2MDEwNTA1MDcwMjAxMTYyMTY4NzQ3NDcwNzMzYTJmMmY3MjY1NzA2ZjczNjk3NDZmNzI3OTJlNjk2MzYxMmU2NzZmNzYyZTYxNjUyZjQzNTA1MzMwMGQwNjBiNjA4NjEwMDEwMTA3MDEwMjAyMDEwMzMwNGMwNjAzNTUxZDFmMDQ0NTMwNDMzMDQxYTAzZmEwM2Q4NjNiNjg3NDc0NzAzYTJmMmY3MjY1NzA2ZjczNjk3NDZmNzI3OTJkNzM3NDY3MmU2OTYzNjEyZTY3NmY3NjJlNjE2NTJmNjM3MjZjMmY0OTQzNDE1MTc1NjE2YzY5NjY2OTY1NjQ0MzQxNTIzNDUzMzMyZTYzNzI2YzMwMWQwNjAzNTUxZDBlMDQxNjA0MTQ2ZjUyYTkzNjg4YzIyMTdlYWM0MGI5YWU4YjYwYTYzMjRkZmJiOWRlMzAxZjA2MDM1NTFkMjUwNDE4MzAxNjA2MDgyYjA2MDEwNTA1MDcwMzA0MDYwYTJiMDYwMTA0MDE4MjM3MGEwMzBjMzAwZDA2MDkyYTg2NDg4NmY3MGQwMTAxMGMwNTAwMDM4MjAyMDEwMDZiZjc3OTMyMjFiMDRlMzhlMmM2ZDg2NWJmOGEwYzFmM2NjM2Y2NGE2MTFiMTkzNDk2ZjkwM2NiNmIyZWU2MzE3NDk3NWM0Y2ZiZTIwZDg3ZGEwNzAzZGYwNTQ2YjdjOGFkNmYwNTUwZGMwZTFiNGI5NTAzOGQzNzlkMTEyMTg1NzI2M2VjOTdhMWY5NTAyNDZiOGU5NDQ3NTAxNWJmNzI2ZGYyNTg5Nzg2Y2UxMDIyYzM3MTQzOTg4NTVmNTRhZmNjY2JiNDkwNjE2YjE2ZjNkNWZiMzcyZTE0MzliOTcyNmFmYzc1YWE1YmZiM2M5ODIyMjQyMTJlMTk3OTJjOGQ3NzQ2NGIwMmE5YWNkMTUyN2U1NmUwMWNlYjFlNGQ2ZjdkODQ5YjgzNmY3NmUwZjk4OWJlNDk3NjU3YWMzZGIyMWI0NTQ1YTllZTRjZTk5MGZhYjgwZmE4MmE5NjQzMzIzZmMzYmFmYWExODk0Mjc4OTUzMjg5YWFlNjk5YjFjOGIxOGRkZDIzN2RhZGM4Y2YwMjVlY2JmZjBmYjMwM2RhMWZiZTc0NGRlMDY4ZmNiODM4MmEyNzMyYTQ4OTNlYTk5ZmIxM2I5MWMxYTI5YTAwZmY1NThiYjQzNDk3MGE5NDI0N2IzODQ2MmRiM2MwYzg3NzhiNmJiMDFlYzU4MDU4ODAwNGI4NGQ3NjMzMzI3NTJmMWJiODM5NzFhMDAzMzkzNTZiNTYyYzczNmY1YWY2YzM0NWQxODU2NGJjMTVhMjhhZDg5OTRlMTYwNjc1ODllZTFmZGYyYjA1NzdjZWM2MmNlZTE5MDNiMWRhNThhOTZkNmIyZGMzOTQ3NDdmMjA3YWMwMWYzYjhjMTgwNGNkNWFiZGQ5Njg1MjEzMWZiZDFkYWQ3MDg2ZmEzMzZiZTI1YzQ1MWNjMDU3NTExZDBmZTdlOGU4YjQ2ZjhiYmJmMzk1OTI1M2M3Mjg4ZDI1M2EwNjcyZmQ1OTBiNWJkNDQyODY4OTI5NTRiMjRkN2FiMjc3NGNhZjgwMTMxMmUyOGFjMzdkMTc0ZWE5YTE5ZmU3MDg4NzQwYzJmY2I0NjQ3NDIxZTRkZGU2Mzk5NDZiNzIwODFjZmQ3ODM4NjlkNGJjOGUyZjE4NGVmZGY3YzlmN2Q3ZWQ0MjQyMDdjMjE0N2E2Mzc5NDMzMjY1MDJiZDJlNDMxYzA0NDYwMzJmNjgwMzU2YjNlODFkNzdkMzQ2ZDZlY2JmOTFjZjNlODZhYTczOGE2ZGM0Y2IwMzdjZGY3NTM4ZmNjYjhlMzg4MWFjMDYyNTlkNjhlNmQ0OTc1ZmNjNWZlYjU4ODZiMWRlYWY4NjNhY2NhZTViOWExZTM0MTYwMDAwMzE4MjFiMDgzMDgyMWIwNDAyMDEwMTMwNjIzMDRhMzEwYjMwMDkwNjAzNTUwNDA2MTMwMjQxNDUzMTE3MzAxNTA2MDM1NTA0MGExMzBlNTU0MTQ1MjA0NzZmNzY2NTcyNmU2ZDY1NmU3NDMxMjIzMDIwMDYwMzU1MDQwMzEzMTk1MzU0NDcyMDQ5NDM0MTIwNTE3NTYxNmM2OTY2Njk2NTY0MjA0MzQxMjA1MjM0NTMzMzAyMTQxN2ExOTVhMTljYzAzODc0MjM2NDRhNDExMWE3YjNiODYwMTUxNjU0MzAwZDA2MDk2MDg2NDgwMTY1MDMwNDAyMDEwNTAwYTA4MjAxMjAzMDE4MDYwOTJhODY0ODg2ZjcwZDAxMDkwMzMxMGIwNjA5MmE4NjQ4ODZmNzBkMDEwNzAxMzAyZDA2MDkyYTg2NDg4NmY3MGQwMTA5MzQzMTIwMzAxZTMwMGQwNjA5NjA4NjQ4MDE2NTAzMDQwMjAxMDUwMGExMGQwNjA5MmE4NjQ4ODZmNzBkMDEwMTBiMDUwMDMwMmYwNjA5MmE4NjQ4ODZmNzBkMDEwOTA0MzEyMjA0MjA1OTgyMTc5MmE2MTdlYTZlMDgxZGMyOTEwMWIxMTdiMzMzZmI0YmQwZWQzYTZkMTk1YzBiM2Y2ZDVmMzhlMDQ4MzA4MWEzMDYwYjJhODY0ODg2ZjcwZDAxMDkxMDAyMmYzMTgxOTMzMDgxOTAzMDgxOGQzMDgxOGEwNDIwYWE2OTZkN2QzNGMwMzM0MmZhOTY4YjNmNTI3NDZmNmFmZmVkODI4YjhmZTM3YjdhYjcxNjA1MTY5YTk0M2NlMDMwNjYzMDRlYTQ0YzMwNGEzMTBiMzAwOTA2MDM1NTA0MDYxMzAyNDE0NTMxMTczMDE1MDYwMzU1MDQwYTEzMGU1NTQxNDUyMDQ3NmY3NjY1NzI2ZTZkNjU2ZTc0MzEyMjMwMjAwNjAzNTUwNDAzMTMxOTUzNTQ0NzIwNDk0MzQxMjA1MTc1NjE2YzY5NjY2OTY1NjQyMDQzNDEyMDUyMzQ1MzMzMDIxNDE3YTE5NWExOWNjMDM4NzQyMzY0NGE0MTExYTdiM2I4NjAxNTE2NTQzMDBkMDYwOTJhODY0ODg2ZjcwZDAxMDEwYjA1MDAwNDgyMDEwMDNjNzQ1ODg2ODNkMWM0ZDQwN2RlNzkwMjVhM2I5YzBiZjRiZjBiY2Y5MGFjODQ2MjllYWNlNTlkMDczYjJkODhkOGIwMGVkMmQ2YTIwY2FmMDczYThjOTVkMGJiMmM1Zjc3NjAyYTZmZTE5Zjk5MmEzNjM1ZWFjYzQwYjE3OGUyZjU3ZWU5ZmYzYmE2OGM4NjI0ZDVkZDQxMDIyNDNmNjRiZDliZThhZmY2OGZmZjc2YTMwMzUzNGJkYjVhZWUyNjRhYmNhOWU5NzQ3ZjY1YjhkZGQ5M2UwNTI0M2RjNTUxYzNiYzI3Mzg2YjNkYjJhMDhkMzYzYTM1NTNjMWQ5ZTU1N2VjZDQ4OThmZTkzMGVlOGEzYmQxMzg5NjhhNTE3ZjRlMTI2OGNkMGMzMWVjNzFhMWE2MDlkZTAwZmM5ZThiNGFmODAyZDU2YzMzYjdhMDJiNmExYjkyNWVkMDA2ZmZjYmMxNzU3ODFhZjhjYzYwOGJjOGM3OWUwN2I5YTU0ZGYyYWIwOTZhOGIyYTY3OTA4YjFlZTg2ZTI2NjJiZjI3ZThjYThjZDc3NmZhNjdlYjdjNDI1YjA5NTlmZWNjMzc0MjRiNThjZTc0MjM3NTgzNTE5NGZmZmExMjI4MzVjNWJmZDUwM2YyZGJhZDljZWExN2I5YjJmMjRjMjAzYjIyYTE4MjE4NTMzMDgyMTg0ZjA2MGIyYTg2NDg4NmY3MGQwMTA5MTAwMjBlMzE4MjE4M2UzMDgyMTgzYTA2MDkyYTg2NDg4NmY3MGQwMTA3MDJhMDgyMTgyYjMwODIxODI3MDIwMTAzMzEwZjMwMGQwNjA5NjA4NjQ4MDE2NTAzMDQwMjAxMDUwMDMwODFlMTA2MGIyYTg2NDg4NmY3MGQwMTA5MTAwMTA0YTA4MWQxMDQ4MWNlMzA4MWNiMDIwMTAxMDYwYjYwODYxMDAxMDIwMjY0MDEwMzAxMDEzMDJmMzAwYjA2MDk2MDg2NDgwMTY1MDMwNDAyMDEwNDIwZTM1N2E2NjgyYjg0ZDRjYTYzMDcxODU2YjJiZTgyNDA1ZmE3Yzg1YWUzOTczZGUxYzgxOTcxN2ZhOGFhYTYzZTAyMDcwNjAyZjBhZmY4Zjk5ZjE4MGYzMjMwMzIzMzMwMzgzMTM1MzAzNjM1MzczMDM4NWEzMDAzMDIwMTAxMDIxMDA3NGEyNWQzZTBmYjIzNmE2NGRiMjFjM2ZlYmJmNjA0YTA1N2E0NTUzMDUzMzEwYjMwMDkwNjAzNTUwNDA2MTMwMjQxNDUzMTBlMzAwYzA2MDM1NTA0MDcxMzA1NDQ3NTYyNjE2OTMxMGQzMDBiMDYwMzU1MDQwYTEzMDQ0NDQ1NTM0MzMxMjUzMDIzMDYwMzU1MDQwMzEzMWM0NDc1NjI2MTY5MjA1NDY5NmQ2NTczNzQ2MTZkNzA2OTZlNjcyMDQxNzU3NDY4NmY3MjY5NzQ3OWEwODIxMzg1MzA4MjA1NjYzMDgyMDM0ZWEwMDMwMjAxMDIwMjEwN2EwZjkzY2EzNzVkMGY5MjAwMDAwMDAwNWEzMTdjMzEzMDBkMDYwOTJhODY0ODg2ZjcwZDAxMDEwYjA1MDAzMDRkMzEwYjMwMDkwNjAzNTUwNDA2MTMwMjQxNDUzMTE3MzAxNTA2MDM1NTA0MGEwYzBlNTU0MTQ1MjA0NzZmNzY2NTcyNmU2ZDY1NmU3NDMxMjUzMDIzMDYwMzU1MDQwMzBjMWM1MzU0NDcyMDU1NDE0NTIwNDc2YzZmNjI2MTZjMjA1MjZmNmY3NDIwNDM0MTIwNDczNDIwNDUzMjMwMWUxNzBkMzEzNzMxMzIzMTMzMzEzODM0MzYzMTMwNWExNzBkMzQzMjMxMzIzMTMzMzEzOTMxMzYzMTMwNWEzMDRkMzEwYjMwMDkwNjAzNTUwNDA2MTMwMjQxNDUzMTE3MzAxNTA2MDM1NTA0MGEwYzBlNTU0MTQ1MjA0NzZmNzY2NTcyNmU2ZDY1NmU3NDMxMjUzMDIzMDYwMzU1MDQwMzBjMWM1MzU0NDcyMDU1NDE0NTIwNDc2YzZmNjI2MTZjMjA1MjZmNmY3NDIwNDM0MTIwNDczNDIwNDUzMjMwODIwMjIyMzAwZDA2MDkyYTg2NDg4NmY3MGQwMTAxMDEwNTAwMDM4MjAyMGYwMDMwODIwMjBhMDI4MjAyMDEwMGRkNjdlMTM5NWNiYzQ0MGZiYzUwMDk5MGVmMjJiNjQ5YWUxYTA0NjRjMGVmODczNmU3YTJmYzA4YmFkNzhhZmIwMTNhOWFmZTNlY2E1MTU0NTRjZjk4ZGVkNTg4MTFiNGQxNmY2OTE1MTRhNDgwY2VmZmVhYzFkNTI3YzIxZDcyNzg3ZmZlMDIyZjQ3YWI5Yjg4Nzk1MWZkZTNmNzU2NDcyYzk3ZWMzNDdkOTQ5Y2U1NDk3NzRlMjk2NzI1ZjgxNTM0MWQyMzI3ZjhlZDA1MTdhZjk5MDcwZWY5MmI2NjkzODk5MTlkMGJmNGNjYmJlM2Y4NzEyYzQ3ZjVlYjY3ZjM2MzIzOGUwYTFmODlmNzAyNTY2NmIwMjc3ZTIxY2QwYjBlMzA0YmI1NzYyN2RhOGQ2YjE0NGNlZGMwZDE4OWYwZDgzNmNjNDgyMjhjNmNlMjg1YmU0MTJiYzQ1NmMxM2M1MTI4ZmQzZjY4MTNjNDZhYzRiYzVlMmQzOWU1MGQ4YmY5NDY5Zjk3ZGZjMjcyY2U5Nzg4MzBhZDIzOTFjOGJjOWYzNGMyY2Y2MThhMWJhMmJhZWY2ZGU2NjBkODIzMzQyZTRlYmFkZmQ3ZTA1MGM5N2M5ODdmMDU0NjczYmIyNzRhZjQ0NTBiYzgzNTkwOWE4YzQ2OTIzMzUwOWYyYmIwMTA3NWQxNDZiODJhY2NkZDc4YTUxNGI3M2RlNTQ1YzE3NWI0NWE3MDFlMDc5OTU3ZjQ3MmY1YThiM2ZhZjBhZGU5YzE2Y2E0MjAyNDA4NmY3Y2FlYjRhNTYzYmViYjc3YWYyMWFjMDMzNjAzYzllNmYwOGUzODc1MDFmMzAxYzcwZDM4MmQzNWM5OWYwODBmMTg0MWI3ZTI3NzMxZDhmOWM5ZWUzMTA0OTBmNWE1YzlmOTgxM2M3Nzk0OGNlOWEzYTgyOGNkM2E5NTg3ZjNiYzM4MzFiZTAzMWY0MzIxNjcyZDNkYWVjODc1OTk1ODgwMDFiMGI4OWZiYTU1YzNmMzZkZjc0ZjA3ZmE3N2UxNzdmMWI0YWMwODlkMDkzOWE4MjY3YTIzNTNjMTc4NDMxOTRlMmFhYTUwNGJjYjFmNjhkODg2N2U0ZmMyMzRmY2E5YTQ2NTg0YThlN2ZkOWUzODFhMjRmNGU0Y2UzNWFhZWQwYjNhMDJjMGI3YmZkMGQ1MWM3Y2JlZjc5OGIxNmFmYTZhYzVlMjhiZDUyZjk3MTYwN2NjNmMyMjIyMWM3OWFmNmMyYzFlNWI5ZjljNTZmYjMyZDhkMDIyM2UzNmIzNzljYjA2YzNiMjAzZDExZjA2MzNkZGFjN2FiNDM0MjlmNDc4ODUxYjQ0NDhmZTg5YjcwMjAzMDEwMDAxYTM0MjMwNDAzMDBmMDYwMzU1MWQxMzAxMDFmZjA0MDUzMDAzMDEwMWZmMzAwZTA2MDM1NTFkMGYwMTAxZmYwNDA0MDMwMjAxMDYzMDFkMDYwMzU1MWQwZTA0MTYwNDE0ZmI4NDEwNTM5ZGI3YWMwYmU2ZTJiZTliMWJkZjViMDhlYmNhOGMxNzMwMGQwNjA5MmE4NjQ4ODZmNzBkMDEwMTBiMDUwMDAzODIwMjAxMDA5NzczMDc0ZTg1NTA2Njc2OTQ0YzQ1MzI0MTYyYmU3YzQ0NGU3ODc2YTE5Mjk2YzJlOTk2OTI3OWI1MTBmOTRlMGU3NzIzMWI3MDM2MzVlODMwMjY5ZThmZWMwYjgwMTJhNTUyZDI3OTViYjM0MDA4NGQwOTcyOTBkOTY5NmMzNmE1ZTljMDY5ZmYzZTQ4MjM2OWNmNzQwNjMzYTU2MzMzNzE3NzI1ZGViZjJhOGU3MDliYWIxMjczNGJjYjFhYTU0ZDY3Njk3ZmNiMjdhODI2MzEzNTBmMjdkZjg4NTRjNjBlM2UyYmYwYmY3NDgzZWRmNmY1NGU4ZWEyNWZmMzMyNjA2OWUzM2NjMTZhNDJhYjM3NTAzY2YzN2EzY2Q0NzQyMThkYmFlMTQ2NzA0NmMyZjU3ZDZlY2E5ZDhlZTU1ZTUyYzYxZWM3ZjMwN2I3Y2I0NTRlMGE4MjgzYTRjNTliNmYyZTI0YTllNWVhMTFmNzk5MjRiMTQ2NjljNmM4ZjEzZDc3ZmIxYTBlYzJjMDZjNDljZmEzZjE0MTU0ODJiODkwMzUwYjRmMTAwNzI3Mzc3Y2IwOWE1YjQwZjUyNWRkY2M1YmM4NWM5YzA2ZWZiZjRhYzk3ZmVhMThjOTVjOWM3MzQ0ZmJiY2I5OWE3MmMyYzQwM2EzMWJiYmUwNDY1NzBjMDJmMmQ5NzFiYzVkMjk2Zjk3ZGE0NWYzNzBkYjI2NjJjNjZmNTBkZWY3NDUzMzNlZmIxNDFkZDZhYTZhMjVkNjY1MjczZjc0MWZiMDU3NGZjN2M3NmM2YzMzNDVkZmFiNWYxM2RmMjcyNzU1ZThiYjNhNTM5NmUxYjM2OWI1ZjFmOGIwMGE4Y2ZmZDFiNjIwODExMzU5NTU3Y2FkMTgyZDhiYjY1MzBiZGViYjRjYzM5OGI0NTE5OGQ0OTcwZjcyOTg5YmJhNzlhOWQ2ZjIwNzU3ODFjMDM5MWQ4YjVhOWU3YTRlYzllMzZhZmVmYWI3YjNlOTU4ZmRhZmY3MDVhYmI2OGZlYTk2YjgyYzYyMzQyMThkMzRkMGM1OGI0OGRhZjkyZTIwZTllYzFkZjBhMTBkZGY4YjJjOWU5ZDc2MDM2NWM2MTExYzE1ZGM3YTdjYzM4NmIyM2U4ODkxZmVlOTczOTJjYTkzZDFjNzk2MWE3NjdjZjMxYzJiMjc0YWY1YzA3NDIzYjEwNzM3ODMzZmJkOTRhZGIwYmNkMWQwZDg2YmFiZTIwMTYxNGM5M2FlNzQ3ZDA5ZjIyMTY1ZWRkZmVhODlhMDUwYmVhZDZhMGJhM2RlMzllODNlMGQ2YjFiOTY4M2QwNzZjZDk0Y2IyMzM2Y2YyMzUwMGZiNDQ5MzA4MjA2ZmYzMDgyMDRlN2EwMDMwMjAxMDIwMjE0NWRlZDA1N2Y4M2QyZDUwY2ZiOTg4YzJkNmE4ODMzZjJlZWVmNjQyMTMwMGQwNjA5MmE4NjQ4ODZmNzBkMDEwMTBiMDUwMDMwNTkzMTBiMzAwOTA2MDM1NTA0MDYxMzAyNDE0NTMxMTczMDE1MDYwMzU1MDQwYTEzMGU1NTQxNDUyMDQ3NmY3NjY1NzI2ZTZkNjU2ZTc0MzEzMTMwMmYwNjAzNTUwNDAzMTMyODUzNTQ0NzIwNTQ2OTZkNjU3Mzc0NjE2ZDcwNjk2ZTY3MjA0MzY1NzI3NDY5NjY2OTYzNjE3NDY5NmY2ZTIwNDE3NTc0Njg2ZjcyNjk3NDc5MzAxZTE3MGQzMjMyMzEzMjMwMzkzMDM2MzAzMzMwMzA1YTE3MGQzMjM3MzEzMjMwMzkzMDM2MzAzMzMwMzA1YTMwNTMzMTBiMzAwOTA2MDM1NTA0MDYxMzAyNDE0NTMxMGUzMDBjMDYwMzU1MDQwNzEzMDU0NDc1NjI2MTY5MzEwZDMwMGIwNjAzNTUwNDBhMTMwNDQ0NDU1MzQzMzEyNTMwMjMwNjAzNTUwNDAzMTMxYzQ0NzU2MjYxNjkyMDU0Njk2ZDY1NzM3NDYxNmQ3MDY5NmU2NzIwNDE3NTc0Njg2ZjcyNjk3NDc5MzA4MjAyMjIzMDBkMDYwOTJhODY0ODg2ZjcwZDAxMDEwMTA1MDAwMzgyMDIwZjAwMzA4MjAyMGEwMjgyMDIwMTAwYzE4YTQxNzUxYTEwMzU5YWQzM2Q5YTQwMDE4OTYzNmNmOGY4NWQxZGRlODAyMDI5YjRiYmUzZTA2Mjg4ZTk3NzMyNWY5OTc0ODZiOWZhYjY0ZjVlNzg5MTUyMWM0M2JkZmMwODM5MDM0YWU0NDQ3MmM4OTQ0ZGZkODMzYTU2OTQ2Mjk4Y2I1YTc5YmM0OGYxZGZhN2UyMjcyZjQzMTY5Yzk1NDkxMDM0MTk3NWRiZDcwYmU3ZDU5MWY4OGE1ZmZiM2RmZjhkMzBmYjY1ZTBjNDhhZGYxNThmYjM4NDI1OTkzNTI3NTFlNTlkZTkyZmVhNDc3ZWRmOWVlMDM4MGM0Y2I1MGI4ZmMyNDM4ZmU3ZGE1NTNlZjczYmU0YTU4YmI3OTAxNWU4OWU1MDgyMTExNmQ4YjYzZjNlZjUxMzQ3MTg5ZWNkN2UxYjU5NzdlMDU1NjAwODcyY2QxOGNlNTI5YTAyNzM0NjNhZjgwYTlhN2NiZDBhYzM0NjRlYTBhOTA5ZGQ1Zjc0ZDE5MGUyMDljOTE0N2YyMDE4N2NlMjcyNTM2OTA0ZjRmODMzMGYxZDc5ODMxZWIzMjgyZTY1Yjk0MzZkNGJhNTA1MmJhZmVhOTgxZThiMzNjOTE0YzRkNTBkZjRiYWRhNmUyOTU4N2RjNDUyM2VjMjYzOGVjNTRjMTFjYjQzNjY5ODRmY2Y3ZTc0YWQzNDY4NGE5YTkxMjM0ZDEzMDIzYTU1YmVhYTYxZDkxOGFjMTU3NGMzMWVjYmFkMTA3NDYxMmYzMmYxZDkxMmY5MzAwNjM4ZmNiNDc4MTNmNGQxYzBlOWRiYjc4OWQ3NzE3NzJiYTA3ZjUwYmQ5M2RjOTJmMTQxMDVhOWE2OTc1ZWNhMDZkODZiZjUyNzM5NjMzNjA1NDMzNmU3OWM5YWI4MjVlNDlkZGFmYWU4ZmFmZGI5ZDMyMzVhYzU1N2JiMGZiZjcxNTg3NTQ0ZTNhYWE4ZjkzOTMwNzA1NDgyMDNmOTg1ZWQ4YTQ5ODNiYTFiNGRjMjUyNDdiODJlMTMyYjI2NzJhNGE1NDFlZjc5MzFiODAyYjlhNGQwOGViNDIxZTZjM2E3NjdmMDUwMzI5NWY2MTM4ZTMzMzRiODNhNDg2ZmIwMDEyODVkZGQ3MmRiMzY5YTViZWZjZmI0MmMwN2Y4MzIxOWE4NjY3YzJlOTM1NWI1YWMzMTc5NmFhYTY4MzFjYWI4MTE3ZTg0ZGExNjk3ZDQ1MWNjOGI2ZTE0OTg5MDMyOTg3YmRkMzI0NGZlZDM0ZTJiYmRlMDQwODA2MjljZTk3OTMxZTJjYWIzYTIwMTIzOTUxOThiY2Y3MTMyZDUwNzM2NTZiMTQyZDhhZDAyMDMwMTAwMDFhMzgyMDFjMzMwODIwMWJmMzAxNjA2MDM1NTFkMjUwMTAxZmYwNDBjMzAwYTA2MDgyYjA2MDEwNTA1MDcwMzA4MzAwZTA2MDM1NTFkMGYwMTAxZmYwNDA0MDMwMjA3ODAzMDgxOTYwNjA4MmIwNjAxMDUwNTA3MDEwMTA0ODE4OTMwODE4NjMwMzMwNjA4MmIwNjAxMDUwNTA3MzAwMTg2Mjc2ODc0NzQ3MDNhMmYyZjYxNzA3MDJlNzM3NDY3MmQ2MzYxMmU2NDY1NzM2MzJlNjc2Zjc2MmU2MTY1MmY2MTY0NzM3MzJmNmY2MzczNzAzMDRmMDYwODJiMDYwMTA1MDUwNzMwMDI4NjQzNjg3NDc0NzAzYTJmMmY3MjY1NzA2ZjczNjk3NDZmNzI3OTJlNzM3NDY3MmQ2MzYxMmU2NDY1NzM2MzJlNjc2Zjc2MmU2MTY1MmY2MzY1NzI3NDY5NjY2OTYzNjE3NDY1MmY1NDY5NmQ2NTczNzQ2MTZkNzA2OTZlNjc0MzQxMmU2MzcyNzQzMDFmMDYwMzU1MWQyMzA0MTgzMDE2ODAxNGRhMWM4OWE3MDQyNmQ1N2Q0YTY4MDI1MzJkYWQzYWQyNTY0NmNlNDQzMDYxMDYwMzU1MWQyMDA0NWEzMDU4MzAzZDA2MGI2MDg2MTAwMTAyMDI2NDAxMDIwMTAzMzAyZTMwMmMwNjA4MmIwNjAxMDUwNTA3MDIwMTE2MjA2ODc0NzQ3MDNhMmYyZjYzNjEyZDcyNjU3MDZmNzM2OTc0NmY3Mjc5MmU2NDY1NzM2MzJlNjc2Zjc2MmU2MTY1MzAwZDA2MGI2MDg2MTAwMTAyMDI2NDAxMDMwMTAxMzAwODA2MDY2NzgxMGMwMTA0MDIzMDU5MDYwMzU1MWQxZjA0NTIzMDUwMzA0ZWEwNGNhMDRhODY0ODY4NzQ3NDcwM2EyZjJmNzI2NTcwNmY3MzY5NzQ2ZjcyNzkyZTczNzQ2NzJkNjM2MTJlNjQ2NTczNjMyZTY3NmY3NjJlNjE2NTJmNDM1MjRjMmY1NDY5NmQ2NTczNzQ2MTZkNzA2OTZlNjcyZjU0Njk2ZDY1NzM3NDYxNmQ3MDY5NmU2NzQzNDEyZTYzNzI2YzMwMWQwNjAzNTUxZDBlMDQxNjA0MTQ2YjQ5NjgyNTA3MWQzMWVkNTM3OTllOWQxZjM0YTYyNWI0MTQzMzI4MzAwZDA2MDkyYTg2NDg4NmY3MGQwMTAxMGIwNTAwMDM4MjAyMDEwMDRhZTA0ZGYzODNhNDMyOTZkZjE2ODQ2ZGI0Y2IzMjU3MGE0OTg3OWNiZDQ4ODdjODZkMzZiNWE1YmZlMTE0Mjk2NWM5NTEzMTc3M2FkMjU0ZWYxY2E5YzIwZGFiMzkzMmIyMWVkNjJkMzRjNGNlNWU5NGM3MGVjMDRlNGNjODM1NjcxZjFiMzRhZTk4N2YwYjRkYjQ4MDRiYWJhNjFjNzcwOGYyMWQzOWQ0ZjI1NzgyYzc1YzRkYWYwZGQxY2EwYTMzNTE4MDY4ZGFmYzgzNGE5ZTMxYjUxMjYwNzJmYzkxYmVkMTJhMGZjODBmMjM5NDM3NTU5NTFlODYzNWQzNmY0MTA2NDc4MmUwN2Y4MTdlNGM4OGI0Mjc4ZjYwM2U1NzFkMjhhMTBmN2Y4OTJlYWFjY2VlYzk0YmQ0YTFkZTkzZTcwNDJiOGYzOTU2ODg3ZjcyY2U1NTgwMmE5OTI5YjdmYTMyODBiMjllZjRlZDU4ZWZlMmMyNDMxMzMwZWZiODM0NzM5YzFmMGVkOWYwZDAwZjk0YTc1NzJmNGE4ZGNkOGU1NDJmN2EwNjk5ZDA2MzJiYTlmMmExZmZjZDMzMzUwMmMxNmFkMWYwNzc0MjhkNDRiNWE2ZTNjNmU1OWEwZWFkYjI5ODA0NTFlMTNjNTBhNjk4NDc1OTNkOTM3MTI0N2QzZGNmMjBiMDUxYWQ1ZTZkZWZmMzRmYTJhNTc3OWUwNmVjOGVlMjFiYmJhYmM0YjBlYTEzYjllOWZhZTFjYjVjNWZlYWYwNzA4YzdjMTdiYTE2YTYwYzAzNTQ5NzNjMDIxODlmMWM4MjY0YzZiNDY4NjIzNjIyZDlhNjJhNjZhZDIyZDQyNjY5ZDBmYWJhNzNjZDliMzdiMWQ4N2Y2MzkzNWVkZTllMjBlMjI3ZmE1YzNkYzIzZmQyY2UxNGVmNWE4MTBlZjRiZGNjZGExYTBkZTZjMTkxYjFhMDQ1N2RiMDcwM2NjMWIxNTRmOTI5ZTRkZGVhMDMwZGEyYmQwMzJlYTBlZjM4OTQ3ZjIwMTgxNzRmZGE0ZDQ0NjMyNGVlMTViZDNlYmJlYmY5NDU3MWIyODYxMGE5MzI3ZTkyMzE2Mzc3ZjdjMTVkNWIwMjM3MWJmNzVlNTAxNTc5MGQzNmJiYzM5YWJiNWE2M2VlOTlmMDAzYTEzYjUyMjc3NzRkYTA1NmFmMTA4MjUxMzk4OTExN2U0ZmY3MTMxOTFkNjRlMGY4ZDMzZGE2M2M5Y2Y5YzM1YThjNjZlZjQ1ZWZlZmVlZjA4OGM0MDRjMzlkY2UwNDBhNjU5MWNhOWYxOTZkNGE4Yjg2ZWM3ODc3MmY3NzYwMTBlOTQ1ZTI4NThjMTMzMDgyMDcxNDMwODIwNGZjYTAwMzAyMDEwMjAyMTEwMGRiNmYyNDg2MjFlNGM2OTIwMDAwMDAwMDViMWQyZGRhMzAwZDA2MDkyYTg2NDg4NmY3MGQwMTAxMGIwNTAwMzA0ZDMxMGIzMDA5MDYwMzU1MDQwNjEzMDI0MTQ1MzExNzMwMTUwNjAzNTUwNDBhMGMwZTU1NDE0NTIwNDc2Zjc2NjU3MjZlNmQ2NTZlNzQzMTI1MzAyMzA2MDM1NTA0MDMwYzFjNTM1NDQ3MjA1NTQxNDUyMDQ3NmM2ZjYyNjE2YzIwNTI2ZjZmNzQyMDQzNDEyMDQ3MzQyMDQ1MzIzMDFlMTcwZDMyMzIzMDMzMzIzMjMwMzgzMjMwMzIzNjVhMTcwZDMzMzAzMDMzMzIzMjMwMzgzNTMwMzIzNjVhMzA1OTMxMGIzMDA5MDYwMzU1MDQwNjEzMDI0MTQ1MzExNzMwMTUwNjAzNTUwNDBhMTMwZTU1NDE0NTIwNDc2Zjc2NjU3MjZlNmQ2NTZlNzQzMTMxMzAyZjA2MDM1NTA0MDMxMzI4NTM1NDQ3MjA1NDY5NmQ2NTczNzQ2MTZkNzA2OTZlNjcyMDQzNjU3Mjc0Njk2NjY5NjM2MTc0Njk2ZjZlMjA0MTc1NzQ2ODZmNzI2OTc0NzkzMDgyMDIyMjMwMGQwNjA5MmE4NjQ4ODZmNzBkMDEwMTAxMDUwMDAzODIwMjBmMDAzMDgyMDIwYTAyODIwMjAxMDBkNDdlOGQzYzZjNDZiOWE1OWE2Y2IxZDUyMmY2OTI0ZDMwY2NhNjg2NjJjNTRjNjUxNWMyMzhmZDUzM2M1ZGY2NGNmMmQyZjA2NjI1MzRiN2RjZGQ0NGNkNzVlNmZlZTE5NWMzNzQ1ZDIzZGE5ZTgxYjk2ZTVhMTZmZWVlZDRlMzQ3ZTE4N2JlMmY5ZDAwNzlmNDlmODdhYjhhOWQ0Zjk2MGY0NGQzNzUwY2Q3ZjA4N2NlZmQ0ZWIwZjJhYzc0YzlkMzE4Nzc1OGE5YTlmMDFlM2QwN2E0YjkxYzgzNDU1ZWRkOTlkM2Y5M2MyM2JkNTZmMTlhNjdkM2M4ZGIyYmYyYmZmZTk4ZjZjNzgxY2JiMWYzNmJkYjdmMTdhNzRkNjNmMWY0NTg0MzgzYWQwNjE5NWQ1MzU4NWMxNjA2ZDc5Yjg4ODY1NjhjMjI5NTBkMzMwNmU0ZmViYjgyMTI1ZmNiMmZhZjU0NDQ4YWYzYWIzMDA1YjM4YzNkZTdiM2RhZTdlMzc2MjhmZjAxYzZmOWY3OTg1MGNmYzBhNmJkYzY0YTA3ZDZmN2FiNmNmMjBiNzc2Mjk3YTY0NWIzMTAyMGE3NTZkYTMyZmUxZDMzZmU0MmUzNjBlNjc0MDYzNjg3M2EzYTExYjY3ODZjYWMzZDNhOWMzZmZmZDA2YWIxZTM5ZDcyMmEwYjA0OGMyNDk3MDY2MmU5MzM4OGE4OTY1ZDNiOTg0ZGRlMzFlOWEyN2VmMWM5MTAxMDc4OWU1OGVkZGM4N2U4ZWEzMThiNDllYWNiOTQ4OTkzYmQzOTcwYjViODY5ZGMxMmQzYmFmMjE4N2UxNmZkMjRhYjU2MGFlZjcxOWYwMTdkY2UwMDQ2OTdjOGZlZTdmMjNjMTBmNjQzNzcwZDE0YjJmNTk3ZTUxMjBlMjU1NGVjMmVkZjAzNGRhM2JkZWIyNGY0ZjYwZWUzMWE0MTM4NDk1YzdiMzU3Y2UwNzg0MjY1NWE0MzNmYmY4ZTY2MTg0ODEwN2EyM2I1YzFiYTZlYzcxNDYyYWRmYzI2Yjc4MTE1YjBhNTA2NjM1ZDljNGUyMDQwODcyZjM4NTZkMTRhMDIzODA0ZjEyNTZjNzNhNDUzYzhhNmQyMTAwM2MwNzFiMDhmMDVmOTVhMjFkYzU2ZDhhY2M2NzUyN2ZhNjM0ZGEwMTUxNDNjOWI1M2I1NzQ3MDk4YjQ4NjNlZTI4NWU1NWVkNWQzNWZjYTM5Y2FlMTE3ODhiYjMxYmYyNDI0OGM2MDBlZTQxMzk3ZTIzNzM4NzBlYTAwMmM0YmQ2YmFjOTM1OGI1YWRhMGYzYjM0NTZkMjE4NmQxM2NkNzhiMjE5NzY1ZjgzNzc0ODlmMDIwMzAxMDAwMWEzODIwMWUxMzA4MjAxZGQzMDBlMDYwMzU1MWQwZjAxMDFmZjA0MDQwMzAyMDEwNjMwMTMwNjAzNTUxZDI1MDQwYzMwMGEwNjA4MmIwNjAxMDUwNTA3MDMwODMwMTIwNjAzNTUxZDEzMDEwMWZmMDQwODMwMDYwMTAxZmYwMjAxMDAzMDU4MDYwMzU1MWQyMDA0NTEzMDRmMzA0MzA2MGI2MDg2MTAwMTAyMDI2NDAxMDEwMTAxMzAzNDMwMzIwNjA4MmIwNjAxMDUwNTA3MDIwMTE2MjY2ODc0NzQ3MDczM2EyZjJmNzI2NTcwNmY3MzY5NzQ2ZjcyNzkyZTczNzQ2NzJkNjM2MTJlNjQ2NTczNjMyZTY3NmY3NjJlNjE2NTJmMzAwODA2MDY2NzgxMGMwMTA0MDIzMDgxOGEwNjA4MmIwNjAxMDUwNTA3MDEwMTA0N2UzMDdjMzAzMzA2MDgyYjA2MDEwNTA1MDczMDAxODYyNzY4NzQ3NDcwM2EyZjJmNjE3MDcwMmU3Mzc0NjcyZDYzNjEyZTY0NjU3MzYzMmU2NzZmNzYyZTYxNjUyZjYxNjQ3MzczMmY2ZjYzNzM3MDMwNDUwNjA4MmIwNjAxMDUwNTA3MzAwMjg2Mzk2ODc0NzQ3MDNhMmYyZjcyNjU3MDZmNzM2OTc0NmY3Mjc5MmU3Mzc0NjcyZDYzNjEyZTY0NjU3MzYzMmU2NzZmNzYyZTYxNjUyZjYzNjU3Mjc0Njk2NjY5NjM2MTc0NjUyZjcyNmY2Zjc0MmU2MzcyNzQzMDdiMDYwMzU1MWQxZjA0NzQzMDcyMzA3MGEwNmVhMDZjODY2YTY4NzQ3NDcwM2EyZjJmNzI2NTcwNmY3MzY5NzQ2ZjcyNzkyZTczNzQ2NzJkNjM2MTJlNjQ2NTczNjMyZTY3NmY3NjJlNjE2NTJmNDM1MjRjMmY1MjZmNmY3NDJmNzM3NDY3NWY3NTYxNjU1ZjY3NmM2ZjYyNjE2YzVmNzI2ZjZmNzQ1ZjYzNjE1ZjY3MzQ1ZjY1MzI1Zjc1NjE2NTVmNjc2Zjc2NjU3MjZlNmQ2NTZlNzQ1ZjYxNjU1ZjYzNzI2YzY2Njk2YzY1NjEzMTJlNjM3MjZjMzAxZjA2MDM1NTFkMjMwNDE4MzAxNjgwMTRmYjg0MTA1MzlkYjdhYzBiZTZlMmJlOWIxYmRmNWIwOGViY2E4YzE3MzAxZDA2MDM1NTFkMGUwNDE2MDQxNGRhMWM4OWE3MDQyNmQ1N2Q0YTY4MDI1MzJkYWQzYWQyNTY0NmNlNDQzMDBkMDYwOTJhODY0ODg2ZjcwZDAxMDEwYjA1MDAwMzgyMDIwMTAwNTZhM2RiZGNlNjZkNGE2MGQ4OGYwMGY0MzJlOGE2MTA2NDE3N2E5N2IzNTlmZWI0ZDM3ZTgxYmYxOTg3Zjk1MzRjY2ZiZmY0Y2U5ZTExNDJmYzQ0YmZjYmFhNTM3M2Y1MjBmYTQ5ZTkyNDNjZTY1ZDhjMjQwMmU4ODE2MzgwMzJiZWRlOTdiZmFlZjFiOTRlOTgzZWVkZTE3MzUyNzBkNDExNmU0MDc2OGMyNjlkOGNmZWJmZWIyMTM0ODdiZGEyMGU1ZWI4YzQ4YjMyMWE5MWE3NjFjMGRmZTMwMDIxNmZiMzNlNTI4MWYzYzZiYmQ3MDA3ZmMxNmFhZDRiNDZkNmNkNjRhNmEzMDhiNDU0MjljMTlmMWI3NDdhNDFjNjUwZTg0YmQzNWMxZGVhYjQ3NzY1N2Y3ZGFjYjRiODlmYTc3MjI4YzFhZjdiZjFmYTQ2YmYzMWNkYWQwZTJkMTg4YjQxNzY5N2Q3MjIzZjAxN2YzZDQ5NTA0MDU0OGEzZTgxZWYyYzAyOTdhYzVhODJjMWFiMzUxMTMwZTA5NmNhY2I4ZjUxYTFhMWUwNDc0OTRkMDJiNWU2NGQwNDc5ODA4ODRkZjdiZDhmZDdhNzVlNTZlNmE0MzUwYTNiOTdmZmFiMjhkNWViMjBjMjcxNTkxMjI0YzljOWMyN2VkODJkMGU3NzlmZGIwMDcyODg2MTIyYjE5MTE1NTY1OGFjZDc4YjE2Y2ZjODYyMmVlZjgxOWI1ZDBhNDliMzYxNjllYzVjMTg3ZWI0YzM0ZjU5N2IzMWY2MjFkMzdhYzU3MzExOWIwYTk4NzA5ZDBmMDgzZDA5NjQxNzI2MTZjNGMwODdjZGM5NTVhNTc1Zjk5MzBmMmUwMzM0MTNlZmM1MDE3M2E5MmZhYmMzM2Q5YzZjZTIxYmI4NTU1OWNhMzdkYTQ0YzAzMzEwYTNkNmM4NDU3MDE3MjBiNWUxODNiNjhkM2M5NzNmOGRlZjg1MzZmZmFjOTc5OTMzNGY5MmQwZjhhZjVkOGMxZTE4YTNlYzk1ZjkxOTMyMDFhYTFjYWRlMzI5NWY4NzQzNWE5MTZlNjUwYmQzYjQ1ODM0YWM2MjZiN2E2ZjZmMjQ3YTkxM2I3N2E3N2M1ZWI3MzlkYTI3NmU0ODVmNmY2YzM0MTYzN2RiODI3N2IwZjdhMDBmMDA3ZjQ5ZWU1NGM2NGY2NjY3NTNhNTQ3YmJhZDc0NTNhNTg5OWQ3NmIzMjkzNmQzN2VhZjI1MDc1Yjk5YzVkY2U0YWRlNjIxMGJhYzFlYTE1ZGE0Y2JhYjZiZGIzOWZmOTM1NTVmMjYwNDM0NGVjYWVkMTRlZDY4NTU3NGFiZTQ2Mjg1NTM5MzMxODIwM2EyMzA4MjAzOWUwMjAxMDEzMDcxMzA1OTMxMGIzMDA5MDYwMzU1MDQwNjEzMDI0MTQ1MzExNzMwMTUwNjAzNTUwNDBhMTMwZTU1NDE0NTIwNDc2Zjc2NjU3MjZlNmQ2NTZlNzQzMTMxMzAyZjA2MDM1NTA0MDMxMzI4NTM1NDQ3MjA1NDY5NmQ2NTczNzQ2MTZkNzA2OTZlNjcyMDQzNjU3Mjc0Njk2NjY5NjM2MTc0Njk2ZjZlMjA0MTc1NzQ2ODZmNzI2OTc0NzkwMjE0NWRlZDA1N2Y4M2QyZDUwY2ZiOTg4YzJkNmE4ODMzZjJlZWVmNjQyMTMwMGQwNjA5NjA4NjQ4MDE2NTAzMDQwMjAxMDUwMGEwODIwMTAyMzAxYTA2MDkyYTg2NDg4NmY3MGQwMTA5MDMzMTBkMDYwYjJhODY0ODg2ZjcwZDAxMDkxMDAxMDQzMDJmMDYwOTJhODY0ODg2ZjcwZDAxMDkwNDMxMjIwNDIwNDZjMGVhZTFlODBkMDczOTM0MDdiNDM3YzIyNjQ0M2I5MWY3NTBjMWFkZGRiNTViMjNhZGI2OWRkN2VjNDU1MzMwODFiMjA2MGIyYTg2NDg4NmY3MGQwMTA5MTAwMjJmMzE4MWEyMzA4MTlmMzA4MTljMzA4MTk5MDQyMGUxMWZmZGU0ZDQ5ZjM4NWMzMTFjZmQ1MTg1MzE3N2JhN2JhMDg4YjEzOTVjMDhmZDNmMWZlZjI5ZTgzMTUyM2IzMDc1MzA1ZGE0NWIzMDU5MzEwYjMwMDkwNjAzNTUwNDA2MTMwMjQxNDUzMTE3MzAxNTA2MDM1NTA0MGExMzBlNTU0MTQ1MjA0NzZmNzY2NTcyNmU2ZDY1NmU3NDMxMzEzMDJmMDYwMzU1MDQwMzEzMjg1MzU0NDcyMDU0Njk2ZDY1NzM3NDYxNmQ3MDY5NmU2NzIwNDM2NTcyNzQ2OTY2Njk2MzYxNzQ2OTZmNmUyMDQxNzU3NDY4NmY3MjY5NzQ3OTAyMTQ1ZGVkMDU3ZjgzZDJkNTBjZmI5ODhjMmQ2YTg4MzNmMmVlZWY2NDIxMzAwZDA2MDkyYTg2NDg4NmY3MGQwMTAxMDEwNTAwMDQ4MjAyMDAyZWE3ZGZmMjY4NGZkM2I3Mzk3MGIzMTkxMzY1M2U5ZjUyYTAxY2Q3ZjBjYmY2OTAwYWQ0ZjljZTFjZDJhMGI5YjlhODIzZmFmMDJjZWUwYWQ1M2UyYTFjNWEwZjlhNDRjYmZlYTU4NWVkZmNjMTRhMGM0NzFhMTcyZjZiZWM2ZWVkMjAwMzY2ZGIzOGU3N2YyOWI4ZGQyOTgxMzk1MzVmMTJlNTg5NDg1NjQ1MDQ4YWZkOWEyYzc1MzU4YzhhMTRiZjhiNGNkMmI3MmY3MjEyOWY5YWM4ZTFmY2U4NWE5NTdhYjVmNTMwNmRhM2IzNzRlMjdlNTJhZjZmYzEyMDU2ZjhmZWFiMjQzYmY1M2Q4NDE1OWI2NDU4MjJjY2RmZmMxNzI1NTA2MTk4Y2MwYjZjYzkxMTVhMGEwNDBkZTczZTgwMWUxNTZkOGY0YzQ4NmI5ODVmMjFmYTkxM2Y0MTA4MTVlM2YzYTdhODE0NGFkNTEyZGZiOWMwMjU2NzkyNDExNjg1ZmZlNTRhMDE2OTU5MGZlOTU3YzJjZWE4YmM4NTUzMTlhYWRiM2M5Y2IyMWVlM2IxNTIyNTY4NWJlOTg4MzIyYTI5MDg2NjZkZDllMzAxNTI2NWE0ZjZhMzI4YmU4MTUwZjRkYzk0Y2NjNjZlMTkyZTUzZmM3ZDNhZGUxNmQ0ODhiNjk3NzhhOTdjYjU0ZjVhODY4ZjEzNzU0N2QxOTg2NDRjOTY2M2EwMDBmMTBmNzVlNjU0MWZiMWRjNDM0NjBkNjNiZjcyMjYyYjhiNWNkYjE5MTM1YWI1NDQ3MTRmM2Q1N2QxNGUyOWJlYWI1ZDkxZDE5Y2MyYzdlNzk3YzQ2NTUxNjIwMzU2MDE4MDdhY2U1YTcwYjQwNDc2ODEzOGQ1MDUyMjk0MTBmMGY1NzVlZjNhYmVjZmZjZDNmYzFiNDE3ZDM2Njc2NWYzNTZlNGI4YmM2NzVkYjM0YjNhMWMwNTUzM2NjZmJmNzIyMjU4YjRiOTU4MWZhOWNhMTg2ZDY1MTNlMjcyZjViYzgxMWIwZTEzZGRhNmMwNjgzODUxZTVkN2FlMGEzZjRlMDJjZTQ1MDQzOWE5MGU1ZGQwMDM5ZGI0NDhiYmExMjFiN2RiMmI4MmY5YzhhNzJkYmI3ZGQwYzYxMDUxZmJiZjk3ZDY0NThhNTdhZTViODdjNWVkMzEyZTBjNzhiMzJlY2ZmMjgzYjRkMTczMzI4NDA1NTk2NWYxZjhkOTdhNDQ0YmJiOTBkOTY1ZDI5ZmFhNzEwY2RhNzZkM2E2ZTAxMjdkMDA3MjZjOGJkNzAwNDczZmU5YjMxNGUwYjEwNzI3MGNkN2Y5ZDQ4NDkyNmE1ZTk3MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA+Pj4KZW5kb2JqCjE4IDAgb2JqCjw8L1R5cGUvRm9udC9CYXNlRm9udC9IZWx2ZXRpY2EvRW5jb2RpbmcvV2luQW5zaUVuY29kaW5nL05hbWUvSGVsdi9TdWJ0eXBlL1R5cGUxPj4KZW5kb2JqCjE5IDAgb2JqCjw8L1R5cGUvRm9udC9CYXNlRm9udC9aYXBmRGluZ2JhdHMvTmFtZS9aYURiL1N1YnR5cGUvVHlwZTE+PgplbmRvYmoKMTQgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhL0VuY29kaW5nL1dpbkFuc2lFbmNvZGluZz4+CmVuZG9iagoxMyAwIG9iago8PC9UeXBlL1hPYmplY3QvU3VidHlwZS9Gb3JtL1Jlc291cmNlczw8L0ZvbnQ8PC9GMSAxNCAwIFI+Pj4+L0JCb3hbMCAwIDQwMCAxNTBdL0Zvcm1UeXBlIDEvTWF0cml4IFsxIDAgMCAxIDAgMF0vTGVuZ3RoIDIwMC9GaWx0ZXIvRmxhdGVEZWNvZGU+PnN0cmVhbQp4nGXPUQuCMBAH8Pd9inssktqWa07wYeoqqSy2+QF8WFKggVifv1VERRwc9+eOH1xqEQHsiwAFQcC2aLYkQCjYI8LPTd+gkTk1neuhrFsXg1G6kNuy2qVKJzwKieAijCJOmRABZGVy0DJbF2N79kLz5XPx8D/qrjBrLUFXue8bCa8cwL5KKqngII3x4TmvLjfXd63rhuDfXfBfN0uk+r9i7Pfq8VM9XHsHeT34tyim8ymOpoQBwTFbxCGHCQ5jjN+WsugOfw9HBwplbmRzdHJlYW0KZW5kb2JqCjE1IDAgb2JqCjw8L1R5cGUvWE9iamVjdC9TdWJ0eXBlL0Zvcm0vUmVzb3VyY2VzPDwvWE9iamVjdDw8L24wIDEyIDAgUi9uMiAxMyAwIFI+Pj4+L0JCb3hbMCAwIDQwMCAxNTBdL0Zvcm1UeXBlIDEvTWF0cml4IFsxIDAgMCAxIDAgMF0vTGVuZ3RoIDM0L0ZpbHRlci9GbGF0ZURlY29kZT4+c3RyZWFtCnicK1QwVDAAQgiZnKugn2eg4JKvEMhViCljBJEBAB4RCv8KZW5kc3RyZWFtCmVuZG9iagoxNiAwIG9iago8PC9UeXBlL1hPYmplY3QvU3VidHlwZS9Gb3JtL1Jlc291cmNlczw8L1hPYmplY3Q8PC9GUk0gMTUgMCBSPj4+Pi9CQm94WzAgMCA0MDAgMTUwXS9Gb3JtVHlwZSAxL01hdHJpeCBbMSAwIDAgMSAwIDBdL0xlbmd0aCAyOS9GaWx0ZXIvRmxhdGVEZWNvZGU+PnN0cmVhbQp4nCtUMFQwAEIImZyroO8W5Kvgkq8QyAUATYgFxgplbmRzdHJlYW0KZW5kb2JqCjEyIDAgb2JqCjw8L1R5cGUvWE9iamVjdC9TdWJ0eXBlL0Zvcm0vUmVzb3VyY2VzPDw+Pi9CQm94WzAgMCAxMDAgMTAwXS9Gb3JtVHlwZSAxL01hdHJpeCBbMSAwIDAgMSAwIDBdL0xlbmd0aCAxOC9GaWx0ZXIvRmxhdGVEZWNvZGU+PnN0cmVhbQp4nFNVcAl2yknMy+YCAA5XAs8KZW5kc3RyZWFtCmVuZG9iagoxMCAwIG9iago8PC9DcmVhdG9yKFJhdmUgXChodHRwOi8vd3d3Lm5ldnJvbmEuY29tL3JhdmVcKSkvUHJvZHVjZXIoTmV2cm9uYSBEZXNpZ25zOyBtb2RpZmllZCB1c2luZyBpVGV4dK4gNS41LjEyIKkyMDAwLTIwMTcgaVRleHQgR3JvdXAgTlYgXChBR1BMLXZlcnNpb25cKSkvQ3JlYXRpb25EYXRlKEQ6MjAwNjAzMDEwNzI4MjYpL01vZERhdGUoRDoyMDIzMDgxNTEwNTY0NyswNCcwMCcpPj4KZW5kb2JqCjYgMCBvYmoKPDwvVHlwZS9QYWdlL1BhcmVudCAzIDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgOSAwIFI+Pi9Qcm9jU2V0IDggMCBSPj4vTWVkaWFCb3hbMCAwIDYxMi4wMDAwIDc5Mi4wMDAwXS9Db250ZW50cyA3IDAgUi9Bbm5vdHNbMTcgMCBSXT4+CmVuZG9iagoxIDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9PdXRsaW5lcyAyIDAgUi9QYWdlcyAzIDAgUi9BY3JvRm9ybTw8L0ZpZWxkc1sxNyAwIFJdL0RBKC9IZWx2IDAgVGYgMCBnICkvRFI8PC9YT2JqZWN0PDwvRlJNIDE1IDAgUj4+L0ZvbnQ8PC9IZWx2IDE4IDAgUi9aYURiIDE5IDAgUj4+Pj4vU2lnRmxhZ3MgMz4+L1ZlcnNpb24vMS4zPj4KZW5kb2JqCnhyZWYKMCAyCjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAyOTYwMCAwMDAwMCBuIAo2IDEKMDAwMDAyOTQ0OSAwMDAwMCBuIAoxMCAxMAowMDAwMDI5MjE5IDAwMDAwIG4gCjAwMDAwMDMxODMgMDAwMDAgbiAKMDAwMDAyOTA0NCAwMDAwMCBuIAowMDAwMDI4MjM1IDAwMDAwIG4gCjAwMDAwMjgxNDYgMDAwMDAgbiAKMDAwMDAyODYxMiAwMDAwMCBuIAowMDAwMDI4ODM1IDAwMDAwIG4gCjAwMDAwMDMwMjkgMDAwMDAgbiAKMDAwMDAyNzk3MCAwMDAwMCBuIAowMDAwMDI4MDY5IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSAyMC9Sb290IDEgMCBSL0luZm8gMTAgMCBSL0lEIFs8OTg3MGI0MmE0ZDQ4NzYxMmMyMTQ1OGI1ODQ2YTVhYjA+PGY5MWQ0Zjc4ODQ0MGVhMWIyYzMyYmZjYzg1NmU2OGFlPl0vUHJldiAyNzE0Pj4KJWlUZXh0LTUuNS4xMgpzdGFydHhyZWYKMjk3OTQKJSVFT0YK"

            const newBase64Data = base64String;

            const soapRequest = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\r\n   <soapenv:Header>\r\n    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" soapenv:actor="http://schemas.xmlsoap.org/soap/actor/next" soapenv:mustUnderstand="1">\r\n      <wsse:UsernameToken>\r\n        <wsse:Username>test_ds_stage</wsse:Username>\r\n        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">Passw0rd@123</wsse:Password><!-- 9QWtRunFT3-->\r\n      </wsse:UsernameToken>\r\n    </wsse:Security>\r\n  </soapenv:Header>\r\n   <soapenv:Body>\r\n      <VerifyRequest Profile="urn:safelayer:tws:dss:1.0:profiles:nonrep:1.0" RequestID="b22c97c6117fc3386f81" xmlns="http://www.docs.oasis-open.org/dss/2004/06/oasis-dss-1.0-core-schema-wd-27.xsd">\r\n         <OptionalInputs>\r\n            <ReturnUpdatedSignature Type="urn:oasis:names:tc:dss:1.0:profiles:XAdES:forms:ES-A"/>\r\n            <css:PdfFieldLabel>SFLY Signature 0</css:PdfFieldLabel>\r\n         </OptionalInputs>\r\n         <InputDocuments>\r\n            <Document>\r\n               <Base64Data MimeType="application/pdf">JVBERi0xLjMNCiXi48/TDQoNCjEgMCBvYmoNCjw8DQovVHlwZSAvQ2F0YWxvZw0KL091dGxpbmVzIDIgMCBSDQovUGFnZXMgMyAwIFINCj4+DQplbmRvYmoNCg0KMiAwIG9iag0KPDwNCi9UeXBlIC9PdXRsaW5lcw0KL0NvdW50IDANCj4+DQplbmRvYmoNCg0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDINCi9LaWRzIFsgNCAwIFIgNiAwIFIgXSANCj4+DQplbmRvYmoNCg0KNCAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDMgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDkgMCBSIA0KPj4NCi9Qcm9jU2V0IDggMCBSDQo+Pg0KL01lZGlhQm94IFswIDAgNjEyLjAwMDAgNzkyLjAwMDBdDQovQ29udGVudHMgNSAwIFINCj4+DQplbmRvYmoNCg0KNSAwIG9iag0KPDwgL0xlbmd0aCAxMDc0ID4+DQpzdHJlYW0NCjIgSg0KQlQNCjAgMCAwIHJnDQovRjEgMDAyNyBUZg0KNTcuMzc1MCA3MjIuMjgwMCBUZA0KKCBBIFNpbXBsZSBQREYgRmlsZSApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY4OC42MDgwIFRkDQooIFRoaXMgaXMgYSBzbWFsbCBkZW1vbnN0cmF0aW9uIC5wZGYgZmlsZSAtICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjY0LjcwNDAgVGQNCigganVzdCBmb3IgdXNlIGluIHRoZSBWaXJ0dWFsIE1lY2hhbmljcyB0dXRvcmlhbHMuIE1vcmUgdGV4dC4gQW5kIG1vcmUgKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NTIuNzUyMCBUZA0KKCB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDYyOC44NDgwIFRkDQooIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjE2Ljg5NjAgVGQNCiggdGV4dC4gQW5kIG1vcmUgdGV4dC4gQm9yaW5nLCB6enp6ei4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjA0Ljk0NDAgVGQNCiggbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDU5Mi45OTIwIFRkDQooIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNTY5LjA4ODAgVGQNCiggQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA1NTcuMTM2MCBUZA0KKCB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBFdmVuIG1vcmUuIENvbnRpbnVlZCBvbiBwYWdlIDIgLi4uKSBUag0KRVQNCmVuZHN0cmVhbQ0KZW5kb2JqDQoNCjYgMCBvYmoNCjw8DQovVHlwZSAvUGFnZQ0KL1BhcmVudCAzIDAgUg0KL1Jlc291cmNlcyA8PA0KL0ZvbnQgPDwNCi9GMSA5IDAgUiANCj4+DQovUHJvY1NldCA4IDAgUg0KPj4NCi9NZWRpYUJveCBbMCAwIDYxMi4wMDAwIDc5Mi4wMDAwXQ0KL0NvbnRlbnRzIDcgMCBSDQo+Pg0KZW5kb2JqDQoNCjcgMCBvYmoNCjw8IC9MZW5ndGggNjc2ID4+DQpzdHJlYW0NCjIgSg0KQlQNCjAgMCAwIHJnDQovRjEgMDAyNyBUZg0KNTcuMzc1MCA3MjIuMjgwMCBUZA0KKCBTaW1wbGUgUERGIEZpbGUgMiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY4OC42MDgwIFRkDQooIC4uLmNvbnRpbnVlZCBmcm9tIHBhZ2UgMS4gWWV0IG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NzYuNjU2MCBUZA0KKCBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY2NC43MDQwIFRkDQooIHRleHQuIE9oLCBob3cgYm9yaW5nIHR5cGluZyB0aGlzIHN0dWZmLiBCdXQgbm90IGFzIGJvcmluZyBhcyB3YXRjaGluZyApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY1Mi43NTIwIFRkDQooIHBhaW50IGRyeS4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NDAuODAwMCBUZA0KKCBCb3JpbmcuICBNb3JlLCBhIGxpdHRsZSBtb3JlIHRleHQuIFRoZSBlbmQsIGFuZCBqdXN0IGFzIHdlbGwuICkgVGoNCkVUDQplbmRzdHJlYW0NCmVuZG9iag0KDQo4IDAgb2JqDQpbL1BERiAvVGV4dF0NCmVuZG9iag0KDQo5IDAgb2JqDQo8PA0KL1R5cGUgL0ZvbnQNCi9TdWJ0eXBlIC9UeXBlMQ0KL05hbWUgL0YxDQovQmFzZUZvbnQgL0hlbHZldGljYQ0KL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcNCj4+DQplbmRvYmoNCg0KMTAgMCBvYmoNCjw8DQovQ3JlYXRvciAoUmF2ZSBcKGh0dHA6Ly93d3cubmV2cm9uYS5jb20vcmF2ZVwpKQ0KL1Byb2R1Y2VyIChOZXZyb25hIERlc2lnbnMpDQovQ3JlYXRpb25EYXRlIChEOjIwMDYwMzAxMDcyODI2KQ0KPj4NCmVuZG9iag0KDQp4cmVmDQowIDExDQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMTkgMDAwMDAgbg0KMDAwMDAwMDA5MyAwMDAwMCBuDQowMDAwMDAwMTQ3IDAwMDAwIG4NCjAwMDAwMDAyMjIgMDAwMDAgbg0KMDAwMDAwMDM5MCAwMDAwMCBuDQowMDAwMDAxNTIyIDAwMDAwIG4NCjAwMDAwMDE2OTAgMDAwMDAgbg0KMDAwMDAwMjQyMyAwMDAwMCBuDQowMDAwMDAyNDU2IDAwMDAwIG4NCjAwMDAwMDI1NzQgMDAwMDAgbg0KDQp0cmFpbGVyDQo8PA0KL1NpemUgMTENCi9Sb290IDEgMCBSDQovSW5mbyAxMCAwIFINCj4+DQoNCnN0YXJ0eHJlZg0KMjcxNA0KJSVFT0YNCg==</Base64Data>\r\n            </Document>\r\n         </InputDocuments>\r\n      </VerifyRequest>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>'

            var modifiedSoapRequest
            xml2js.parseString(soapRequest, { explicitArray: false }, (err, result) => {
                if (err) {
                    console.error('Error parsing SOAP request:', err);
                    return;
                }

                result['soapenv:Envelope']['soapenv:Body']['VerifyRequest']['InputDocuments']['Document']['Base64Data']._ = newBase64Data;

                const xmlBuilder = new xml2js.Builder();
                modifiedSoapRequest = xmlBuilder.buildObject(result);

            });

            var options = {
                'method': 'POST',
                'url': 'https://stg-id.uaepass.ae/trustedx-gw/SoapGateway',
                'headers': {
                    'TwsAuthN': 'urn:safelayer:tws:policies:authentication:oauth:clients',
                    'SOAPAction': 'Update',
                    'Content-Type': 'text/xml',
                    agent: agent
                },
                body: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\r\n   <soapenv:Header>\r\n    <wsse:Security xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd" soapenv:actor="http://schemas.xmlsoap.org/soap/actor/next" soapenv:mustUnderstand="1">\r\n      <wsse:UsernameToken>\r\n        <wsse:Username>test_ds_stage</wsse:Username>\r\n        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">Passw0rd@123</wsse:Password><!-- 9QWtRunFT3-->\r\n      </wsse:UsernameToken>\r\n    </wsse:Security>\r\n  </soapenv:Header>\r\n   <soapenv:Body>\r\n      <VerifyRequest Profile="urn:safelayer:tws:dss:1.0:profiles:nonrep:1.0" RequestID="b22c97c6117fc3386f81" xmlns="http://www.docs.oasis-open.org/dss/2004/06/oasis-dss-1.0-core-schema-wd-27.xsd">\r\n         <OptionalInputs>\r\n            <ReturnUpdatedSignature Type="urn:oasis:names:tc:dss:1.0:profiles:XAdES:forms:ES-A"/>\r\n            <css:PdfFieldLabel>SFLY Signature 0</css:PdfFieldLabel>\r\n         </OptionalInputs>\r\n         <InputDocuments>\r\n            <Document>\r\n               <Base64Data MimeType="application/pdf">JVBERi0xLjMNCiXi48/TDQoNCjEgMCBvYmoNCjw8DQovVHlwZSAvQ2F0YWxvZw0KL091dGxpbmVzIDIgMCBSDQovUGFnZXMgMyAwIFINCj4+DQplbmRvYmoNCg0KMiAwIG9iag0KPDwNCi9UeXBlIC9PdXRsaW5lcw0KL0NvdW50IDANCj4+DQplbmRvYmoNCg0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDINCi9LaWRzIFsgNCAwIFIgNiAwIFIgXSANCj4+DQplbmRvYmoNCg0KNCAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDMgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDkgMCBSIA0KPj4NCi9Qcm9jU2V0IDggMCBSDQo+Pg0KL01lZGlhQm94IFswIDAgNjEyLjAwMDAgNzkyLjAwMDBdDQovQ29udGVudHMgNSAwIFINCj4+DQplbmRvYmoNCg0KNSAwIG9iag0KPDwgL0xlbmd0aCAxMDc0ID4+DQpzdHJlYW0NCjIgSg0KQlQNCjAgMCAwIHJnDQovRjEgMDAyNyBUZg0KNTcuMzc1MCA3MjIuMjgwMCBUZA0KKCBBIFNpbXBsZSBQREYgRmlsZSApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY4OC42MDgwIFRkDQooIFRoaXMgaXMgYSBzbWFsbCBkZW1vbnN0cmF0aW9uIC5wZGYgZmlsZSAtICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjY0LjcwNDAgVGQNCigganVzdCBmb3IgdXNlIGluIHRoZSBWaXJ0dWFsIE1lY2hhbmljcyB0dXRvcmlhbHMuIE1vcmUgdGV4dC4gQW5kIG1vcmUgKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NTIuNzUyMCBUZA0KKCB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDYyOC44NDgwIFRkDQooIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjE2Ljg5NjAgVGQNCiggdGV4dC4gQW5kIG1vcmUgdGV4dC4gQm9yaW5nLCB6enp6ei4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNjA0Ljk0NDAgVGQNCiggbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDU5Mi45OTIwIFRkDQooIEFuZCBtb3JlIHRleHQuIEFuZCBtb3JlIHRleHQuICkgVGoNCkVUDQpCVA0KL0YxIDAwMTAgVGYNCjY5LjI1MDAgNTY5LjA4ODAgVGQNCiggQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA1NTcuMTM2MCBUZA0KKCB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBFdmVuIG1vcmUuIENvbnRpbnVlZCBvbiBwYWdlIDIgLi4uKSBUag0KRVQNCmVuZHN0cmVhbQ0KZW5kb2JqDQoNCjYgMCBvYmoNCjw8DQovVHlwZSAvUGFnZQ0KL1BhcmVudCAzIDAgUg0KL1Jlc291cmNlcyA8PA0KL0ZvbnQgPDwNCi9GMSA5IDAgUiANCj4+DQovUHJvY1NldCA4IDAgUg0KPj4NCi9NZWRpYUJveCBbMCAwIDYxMi4wMDAwIDc5Mi4wMDAwXQ0KL0NvbnRlbnRzIDcgMCBSDQo+Pg0KZW5kb2JqDQoNCjcgMCBvYmoNCjw8IC9MZW5ndGggNjc2ID4+DQpzdHJlYW0NCjIgSg0KQlQNCjAgMCAwIHJnDQovRjEgMDAyNyBUZg0KNTcuMzc1MCA3MjIuMjgwMCBUZA0KKCBTaW1wbGUgUERGIEZpbGUgMiApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY4OC42MDgwIFRkDQooIC4uLmNvbnRpbnVlZCBmcm9tIHBhZ2UgMS4gWWV0IG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NzYuNjU2MCBUZA0KKCBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSB0ZXh0LiBBbmQgbW9yZSApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY2NC43MDQwIFRkDQooIHRleHQuIE9oLCBob3cgYm9yaW5nIHR5cGluZyB0aGlzIHN0dWZmLiBCdXQgbm90IGFzIGJvcmluZyBhcyB3YXRjaGluZyApIFRqDQpFVA0KQlQNCi9GMSAwMDEwIFRmDQo2OS4yNTAwIDY1Mi43NTIwIFRkDQooIHBhaW50IGRyeS4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gQW5kIG1vcmUgdGV4dC4gKSBUag0KRVQNCkJUDQovRjEgMDAxMCBUZg0KNjkuMjUwMCA2NDAuODAwMCBUZA0KKCBCb3JpbmcuICBNb3JlLCBhIGxpdHRsZSBtb3JlIHRleHQuIFRoZSBlbmQsIGFuZCBqdXN0IGFzIHdlbGwuICkgVGoNCkVUDQplbmRzdHJlYW0NCmVuZG9iag0KDQo4IDAgb2JqDQpbL1BERiAvVGV4dF0NCmVuZG9iag0KDQo5IDAgb2JqDQo8PA0KL1R5cGUgL0ZvbnQNCi9TdWJ0eXBlIC9UeXBlMQ0KL05hbWUgL0YxDQovQmFzZUZvbnQgL0hlbHZldGljYQ0KL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcNCj4+DQplbmRvYmoNCg0KMTAgMCBvYmoNCjw8DQovQ3JlYXRvciAoUmF2ZSBcKGh0dHA6Ly93d3cubmV2cm9uYS5jb20vcmF2ZVwpKQ0KL1Byb2R1Y2VyIChOZXZyb25hIERlc2lnbnMpDQovQ3JlYXRpb25EYXRlIChEOjIwMDYwMzAxMDcyODI2KQ0KPj4NCmVuZG9iag0KDQp4cmVmDQowIDExDQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMTkgMDAwMDAgbg0KMDAwMDAwMDA5MyAwMDAwMCBuDQowMDAwMDAwMTQ3IDAwMDAwIG4NCjAwMDAwMDAyMjIgMDAwMDAgbg0KMDAwMDAwMDM5MCAwMDAwMCBuDQowMDAwMDAxNTIyIDAwMDAwIG4NCjAwMDAwMDE2OTAgMDAwMDAgbg0KMDAwMDAwMjQyMyAwMDAwMCBuDQowMDAwMDAyNDU2IDAwMDAwIG4NCjAwMDAwMDI1NzQgMDAwMDAgbg0KDQp0cmFpbGVyDQo8PA0KL1NpemUgMTENCi9Sb290IDEgMCBSDQovSW5mbyAxMCAwIFINCj4+DQoNCnN0YXJ0eHJlZg0KMjcxNA0KJSVFT0YNCg==</Base64Data>\r\n            </Document>\r\n         </InputDocuments>\r\n      </VerifyRequest>\r\n   </soapenv:Body>\r\n</soapenv:Envelope>'

            };
            options.body = modifiedSoapRequest
            request(options, async function (error, response) {
                if (error) {
                    resolve(error);
                }
                else {
                    const xml2js = require('xml2js');

                    const xmlData = response.body
                    let base64data = ''
                    const ResultMessage = ''
                    // Parse the XML
                    xml2js.parseString(xmlData, (err, result) => {
                        if (err) {
                            console.error('Error parsing XML:', err);
                            return;
                        }
                        const ResultMajor = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['dss:VerifyResponse'][0]['dss:Result'][0]['dss:ResultMajor'][0];
                        const ResultMinor = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['dss:VerifyResponse'][0]['dss:Result'][0]['dss:ResultMinor'][0];
                        if(ResultMajor == "urn:oasis:names:tc:dss:1.0:resultmajor:Success" && ResultMinor == "urn:oasis:names:tc:dss:1.0:resultminor:ValidSignature_OnAllDocuments"){
                            base64data = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['dss:VerifyResponse'][0]['dss:OptionalOutputs'][0]['dss:DocumentWithSignature'][0]['dss:XMLData'][0]['dss:Base64Data'][0]._
                            resolve({base64data:base64data});
                        }else{
                            ResultMessage = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['dss:VerifyResponse'][0]['dss:Result'][0]['dss:ResultMessage'][0];
                            resolve({ResultMessage:ResultMessage});
                        }
                    });
                    
                }
            });


        })
    }
    async download_doc(params){
        return new Promise(async (resolve, reject) => {
            try {
                var FileReader = require('filereader');
                const base64 = require('base-64');
                const fs = require('fs');
                const agent = new https.Agent({
                    secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
                });
                if(!params.document_id){
                    resolve({status:"document id not found"})
                }else{
                    const delayMillis = 2000;
                    const axios = require('axios');
                    const fs = require('fs');
                    
                    // Replace with the URL of the file you want to download
                    const fileURL = "https://stg-id.uaepass.ae/trustedx-resources/esignsp/v2/documents/"+params.document_id+"/content";
                    // const fileName = 'downloaded17-file'; // Replace with the desired local file name
                                    
                    axios({
                      method: 'get',
                      url: fileURL,
                      headers: {
                        'Authorization': 'Bearer' + ' ' + params.access_token,
                    },
                      responseType: 'stream', // Indicate that the response is a stream
                    })
                      .then(response => {
                        let randomNum = Math.floor(1000000000000000+Math.random()*9000000000)
                        const fileName = 'uploads/' + randomNum + '.' + "pdf"
                            // let file = "uploads/" + randomNum +".pdf"
                        // Create a writable stream to save the data to a file
                        // var file = fs.createWriteStream('uploads/' + fileName + '.' + "pdf")
                        const writableStream = fs.createWriteStream(fileName);
                        // response.data.on('end', async() => {
                            // resolve({ status: 'success' })
                            // console.log("success")
                            // resolve({path:"dest"})
                            // resolve({destinationPath:"destpath"})
                            // pdf = true
                            // resolve({destinationPath:"1"})
                            // let finish = await thid.download_doc()
                            // setTimeout(() => {
                            //     console.log("File download successful");
                            //     resolve({ status: 'success' });
                            //   }, delayMillis);
                        //   },
                        //   )
                        //   .on('error', (err) => {
                        //     console.log(err);
                        //     console.log("failed");
                        //     // resolve({ status: "failed", message: 'Unable to fetch document' })
                        //   })
                        //     .pipe(file)
                        //     if(pdf == true){
                        //         resolve({destinationPath:"destpath1"})
                        //     }
                        // }
                    
                        // Pipe the data from the response's readable stream to the file's writable stream
                        response.data.pipe(writableStream);
                    
                        // Listen for the 'finish' event to know when the data transfer is complete
                        writableStream.on('finish', () => {
                          console.log(`File "${fileName}" has been downloaded and saved.`);
                          resolve({destinationPath:fileName})
                        });}
                      )
                      .catch(error => {
                        console.error('Error downloading file:', error);
                      });
                      
                    // var headers = {
                    //     Authorization: "Bearer " + accessToken,
                    //     Accept: 'application/pdf'
                    // }
                    //  fetch(
                    //     "https://stg-id.uaepass.ae/trustedx-resources/esignsp/v2/documents/"+params.document_id+"/content",
                    //     {
                    //         method: 'GET',
                    //         headers: {
                    //             'Authorization': 'Bearer' + ' ' + params.access_token
                    //         },
                    //     },
                    // )
                    // .then((response) => {
                    //     const writableFileStream = fs.createWriteStream('output.txt');
  
                    //         // Pipe the data from the API's readable stream to the file's writable stream
                    //         response.data.pipe(writableFileStream);

                    //         // Listen for the 'finish' event to know when the data transfer is complete
                    //         writableFileStream.on('finish', () => {
                    //           console.log('Data has been saved to output.txt');
                    //     });
                    //         let randomNum = Math.floor(1000000000000000+Math.random()*9000000000)
                    //         let destinationPath = "uploads/" + randomNum +".pdf"
                    //         var base64Str = Buffer.from(data).toString('base64');
                    //         base64.decode(base64Str, destinationPath);
                    //         console.log("destinationPath",destinationPath)
                    //     })
                    //     .catch(
                    //         (err) => {
                    //             console.log(err.message);
                    //         })
                      if(pdf == true){
                        resolve({destinationPath:"destpath"})
                      }
                    // var options = {
                    //     'method': 'GET',
                    //     'url': "https://stg-id.uaepass.ae/trustedx-resources/esignsp/v2/documents/"+params.document_id+"/content",
                    //     'headers': {
                    //         'Authorization': 'Bearer' + ' ' + params.access_token,
                    //     },
                    //     agent: agent,
                    //     responseType: 'stream'
                    //     // json :true
                    // };
                    // request(options, async function (error, response, body) {
                        // if (error) reject(error);
                        // else if(body){
                            // let randomNum = Math.floor(1000000000000000+Math.random()*9000000000)
                            // let destinationPath = "uploads/" + randomNum +".pdf"
                            // let data = body
                            // let data = response.arrayBuffer()
                            // const binaryBuffer = Buffer.from(body, 'base64');
                            // const decodedText = binaryBuffer.toString('utf-8');
                            // var base64Str = Buffer.from(body).toString('base64');
                            // base64.base64Decode(base64Str, destinationPath);
                                        // const toBase64 = file => new Promise((resolve, reject) => {
                                        //     const reader = new FileReader();
                                        //     reader.readAsDataURL(file);
                                        //     reader.onload = () => resolve(reader.result);
                                        //     reader.onerror = error => reject(error);
                                        // });
                                        // const writableFileStream = fs.createWriteStream(destinationPath);
                                        // writableFileStream.write(data)
                                        // writableFileStream.on('finish', () => {
                                        // writableFileStream.close(() => {
                                        //     console.log('Data has been saved to output.txt');
                                        //     });
                                            
                                        // });
                            // let pdf = await toBase64(body)
                            // var base64Str = Buffer.from(data).toString('base64');
                            // let b64 = await to
                            // fs.writeFileSync(destinationPath, body);
                            // resolve({destinationPath:destinationPath});
                    //     }else{
                    //         resolve({status:'failed',message:"failed to download document"})
                    //     }
                    // });
                }
            } catch (error) {
                console.log("error",error)
            }
        })
    }
    // async data(){
    async authorize(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                let params = ctx.request.body
                let txn_id = params.data.txn_id
                resolve({url:"https://stg-id.uaepass.ae/idshub/authorize?response_type=code&client_id=sandbox_stage&scope=urn:uae:digitalid:profile:general&state=HnlHOJTkTb66Y5H&redirect_uri=http://localhost:6019/api/signinng&acr_values=urn:safelayer:tws:policies:authentication:level:low"})
                if (params.url) {
                    const { URL } = require('url');
                    const urlString = params.url;
                    const parsedUrl = new URL(urlString);
                    var queryParams = parsedUrl.searchParams;
                    var code = queryParams.get('code'); // 'John'
                    var state = queryParams.get('state');
                    const parsedUrl1 = new URL(urlString);
                    var queryParams = parsedUrl.searchParams;
                    var status = queryParams.get('status'); // 'John'
                    var signer_process_id = queryParams.get('signer_process_id');
                    var check = queryParams.get('check')
                    var document_id = queryParams.get('document_id')
                    let access_token = queryParams.get('access_token')
                    if (check == 'success') {
                        let document = await this.download_doc({document_id:document_id,access_token:access_token})
                        let ltv
                        if(document.destinationPath){
                            // const fileContent = fs.readFileSync(document.destinationPath);
                            // const base64Content = fileContent.toString('base64');
                            ltv= await this.ltv({signed_pdf:document.destinationPath})
                            if(ltv && ltv.base64data){
                                resolve({status:'success',message:'successfully signed document',document:ltv.base64data})
                            }else{
                                resolve({status:"failed"})
                            }
                        }
                        // await this.ltv()
                    }else if(signer_process_id && status == 'failed'){
                        resolve({status:'failed',message:'failed to sign document'})
                    }else{
                        let authorize = await this.generateToken({ code: code })
                    // ctx.redirect("http://localhost:5200/home");
                    if(authorize){
                        let userInfo = await this.userInfo({token:authorize.access_token})
                        if(userInfo){
                            let arr = Object.entries(userInfo)
                    resolve({api_Data:arr})

                        }else{
                            resolve('authorisation-failed')
                        }
                    }
                    }
                    
                }

            } catch (error) {
                resolve(error)
            }
        })
    }
    // }
    
    async generateToken(params) {
        return new Promise(async (resolve, reject) => {
            try {
                if (params.code) {
                    var request = require('request');
                    const agent = new https.Agent({
                        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
                    });
                    var options = {
                        'method': 'POST',
                        'url': 'https://stg-id.uaepass.ae/idshub/token?grant_type=authorization_code&redirect_uri=http://localhost:4200/user&code='+params.code,
                        'headers': {
                            'Content-Type': 'multipart/form-data; charset=UTF-8',
                            'Authorization': 'Basic c2FuZGJveF9zdGFnZTpzYW5kYm94X3N0YWdl'
                        },
                        agent: agent,
                        json :true
                    };
                    request(options, function (error, response) {
                        if (error) reject(error);
                        resolve(response.body);
                    });

                }
                else {
                    reject("error occred in generateToken")
                }

            } catch (error) {
                reject(error)
            }
        })
    }


    async userInfo(params) {
        return new Promise(async (resolve, reject) => {
            try {
                if (params.token) {
                    const agent = new https.Agent({
                        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
                    });
                    var request = require('request');
                    var options = {
                        'method': 'GET',
                        'url': 'https://stg-id.uaepass.ae/idshub/userinfo',
                        'headers': {
                            'Authorization': 'Bearer '+params.token
                        },
                        agent:agent,
                        json:true
                    };
                    request(options, function (error, response) {
                        if (error) reject(error);
                        else
                        resolve(response.body);
                    });
                }
                else {
                    reject("error occred in userInfo")
                }
            } catch (error) {
                console.log(error)
            }
        })
    }

    async getData(){
        return new Promise(async (resolve, reject) => {
            try {
               let data = await this.authorize()
               resolve(data)
            } catch (error) {
                
            }
        })
    }

    async string_compare(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                // var configuration = require("../../config/config")
                let params = ctx.request.body;
                var similarity = parseInt(Number(stringSimilarity.compareTwoStrings((params.string_1.replace(/\s/g, '')).toUpperCase(), (params.string_2.replace(/\s/g, '')).toUpperCase()) * 100).toFixed());
                resolve({ status: "success", Match_Percentage: similarity })
            }
            catch (err) {
                resolve({
                    status: 'failed',
                    err: err
                })
            }
        })
    }
    async validation(ctx) {
        return new Promise(async (resolve, reject) => {
            try {
                let api_id = ctx.request.headers['x-parse-application-id'] ? ctx.request.headers['x-parse-application-id'] : ctx.request.headers['x-parse-rest-api-id']
                let api_key = ctx.request.headers['x-parse-rest-api-key']
                let organisation_id = ctx.request.headers['organisation-id'] ? ctx.request.headers['organisation-id'] : ''
                let body = ctx.request.body
                var isReferenceId = false
                var isDocuments = false
                if (api_id && api_key) {
                    var query = { "api_id": api_id, "api_key": api_key }
                    let apiData = await this.apiCredentials.findSortLimit(query, { _id: -1 }, 1)
                    if (apiData.length != 0) {
                        let id = apiData[0]._id;
                        let org_details = await this.organisationInfo.getInfoById({ id: apiData[0].organisation_id.toHexString() })
                        if (!org_details) {
                            resolve({
                                status: 'failed',
                                error: "The required x-parse-application-id and x-parse-rest-api-key not found",
                                error_code: "dv-010",
                                response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss"),
                            })
                        } else {
                            var fields = org_details.document_verification_settings && org_details.document_verification_settings.field_settings ? org_details.document_verification_settings.field_settings : ""

                            if (fields && fields != "") {
                                _.each(fields, function (field) {
                                    if (field && field.field_value && field.isMandatory) {
                                        if (field.field_value == "reference_id") {
                                            isReferenceId = true
                                        }
                                        if (field.field_value == "document_verification_new") {
                                            isDocuments = true
                                        }
                                    }
                                })
                            }
                            if (body.reference_id && isReferenceId) {
                                if ((typeof body.reference_id != 'string') || /[~!#$%\^&*+_=\-\[\]\\;.,/{}|\\":<>\?@)(`' ]/g.test(body.reference_id.trim()) || body.reference_id.length > 64) {
                                    resolve({
                                        status: "failed",
                                        error: "The reference_id passed in the request is invalid",
                                        error_code: "dv-014",
                                        response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss"),
                                        user_id: apiData[0].user_id ? apiData[0].user_id : '',
                                    })
                                }
                                else {
                                    var validReferenceId = await this.checkReferenceId(body.reference_id, apiData[0].organisation_id)
                                    if (validReferenceId.status == 'failed') {
                                        resolve({
                                            status: "failed",
                                            error: validReferenceId.error,
                                            error_code: validReferenceId.error_code,
                                            response_time_stamp: validReferenceId.response_time_stamp,
                                            user_id: apiData[0].user_id
                                        })
                                    } else {
                                        if (config.environment == 'uat' || config.environment == 'production') {
                                            var wallet_query = {
                                                organisation_id: mongo.ObjectId(apiData[0].organisation_id),
                                                status: 'active'
                                            }
                                            var wallet_details = await this.subscriptionLogs.findSortLimit(wallet_query, { _id: -1 }, 1)
                                            if (wallet_details && wallet_details[0]?.wallet_info?.document_verification?.string_compare_validation > 0) {
                                                if (org_details && org_details.document_verification_settings) {
                                                    var verification_details = org_details.document_verification_settings
                                                    verification_details.organisation_id = apiData[0].organisation_id
                                                    verification_details.department_id = apiData[0].department_id ? apiData[0].department_id : ""
                                                    verification_details.user_id = apiData[0].user_id ? apiData[0].user_id : ""
                                                    verification_details.status = "success"
                                                    verification_details.isDocuments = isDocuments
                                                    resolve(verification_details)
                                                } else {
                                                    resolve({
                                                        status: "failed",
                                                        error: "document_verification_settings not found",
                                                        error_code: "",
                                                        response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss")
                                                    })
                                                }
                                            } else {
                                                resolve({
                                                    status: "failed",
                                                    error: "API hit limit exhausted for the client. Please recharge.",
                                                    error_code: "dv-060",
                                                    response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss"),
                                                    user_id: apiData[0].user_id ? apiData[0].user_id : ""
                                                })
                                            }
                                        } else if (config.environment == 'qa') {
                                            if (org_details && org_details.document_verification_settings) {
                                                var verification_details = org_details.document_verification_settings
                                                verification_details.organisation_id = apiData[0].organisation_id
                                                verification_details.department_id = apiData[0].department_id ? apiData[0].department_id : ""
                                                verification_details.user_id = apiData[0].user_id ? apiData[0].user_id : ""
                                                verification_details.status = "success"
                                                verification_details.isDocuments = isDocuments
                                                resolve(verification_details)
                                            }
                                            else {
                                                resolve({
                                                    status: "failed",
                                                    error: "The document verification services are not configured for this organization",
                                                    error_code: "dv-007",
                                                    response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss")
                                                })
                                            }
                                        }
                                    }
                                }
                            } else if (isReferenceId) {
                                resolve({
                                    status: "failed",
                                    response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss"),
                                    error: "The required reference_id was not found in the request",
                                    error_code: "dv-015"
                                })
                            } else {
                                resolve({
                                    status: "failed",
                                    error: "The document verification services are not configured for this organization",
                                    error_code: "dv-007",
                                    response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss")
                                })
                            }
                        }
                    }
                    else {
                        resolve({
                            status: "failed",
                            error: "The passed x-parse-application-id and x-parse-rest-api-key do not match",
                            error_code: "dv-013",
                            response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss")
                        })
                    }
                } else if (organisation_id) {
                    if (mongo.ObjectId.isValid(organisation_id)) {
                        let org_details = await this.organisationInfo.getInfoById({ id: organisation_id })
                        if (!org_details) {
                            resolve({
                                status: "failed",
                                error: "organisation_id do not match",
                                error_code: "dv-013",
                                response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss")
                            })
                        } else {
                            var fields = org_details.document_verification_settings && org_details.document_verification_settings.field_settings ? org_details.document_verification_settings.field_settings : ""
                            if (fields && fields != "") {
                                _.each(fields, function (field) {
                                    if (field && field.field_value && field.isMandatory) {
                                        if (field.field_value == "reference_id") {
                                            isReferenceId = true
                                        }
                                        if (field.field_value == "document_verification_new") {
                                            isDocuments = true
                                        }
                                    }
                                })
                            }
                            if (body.reference_id && isReferenceId) {
                                if ((typeof body.reference_id != 'string') || /[~!#$%\^&*+_=\-\[\]\\;.,/{}|\\":<>\?@)(`' ]/g.test(body.reference_id.trim()) || body.reference_id.length > 64) {
                                    resolve({
                                        status: "failed",
                                        error: "The reference_id passed in the request is invalid",
                                        error_code: "dv-014",
                                        response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss"),
                                        user_id: "",

                                    })
                                }
                                else {
                                    var validReferenceId = await this.checkReferenceId(body.reference_id, organisation_id)
                                    if (validReferenceId.status == 'failed') {
                                        resolve({
                                            status: "failed",
                                            error: validReferenceId.error,
                                            error_code: validReferenceId.error_code,
                                            response_time_stamp: validReferenceId.response_time_stamp,
                                            user_id: ""
                                        })
                                    } else {
                                        if (config.environment == 'uat' || config.environment == 'production') {
                                            var wallet_query = {
                                                organisation_id: mongo.ObjectId(organisation_id),
                                                status: 'active'
                                            }
                                            var wallet_details = await this.subscriptionLogs.findSortLimit(wallet_query, { _id: -1 }, 1)
                                            if (wallet_details && wallet_details[0]?.wallet_info?.document_verification?.string_compare_validation > 0) {
                                                if (org_details && org_details.document_verification_settings) {
                                                    var verification_details = org_details.document_verification_settings
                                                    verification_details.organisation_id = mongo.ObjectId(organisation_id)
                                                    verification_details.department_id = ""
                                                    verification_details.user_id = ""
                                                    verification_details.status = "success"
                                                    verification_details.isDocuments = isDocuments
                                                    resolve(verification_details)
                                                }
                                                else {
                                                    resolve({
                                                        status: "failed",
                                                        error: "The document verification services are not configured for this organization",
                                                        error_code: "dv-007",
                                                        response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss")
                                                    })
                                                }
                                            }
                                            else {
                                                resolve({
                                                    status: "failed",
                                                    error: "API hit limit exhausted for the client. Please recharge.",
                                                    error_code: "dv-060",
                                                    response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss"),
                                                    user_id: ""
                                                })
                                            }
                                        }
                                        else if (config.environment == 'qa') {
                                            if (org_details && org_details.document_verification_settings) {
                                                var verification_details = org_details.document_verification_settings
                                                verification_details.organisation_id = mongo.ObjectId(organisation_id)
                                                verification_details.department_id = ""
                                                verification_details.user_id = ""
                                                verification_details.status = "success"
                                                verification_details.isDocuments = isDocuments
                                                resolve(verification_details)
                                            }
                                            else {
                                                resolve({
                                                    status: "failed",
                                                    error: "document_verification_settings not found",
                                                    error_code: "",
                                                    response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss")
                                                })
                                            }
                                        }
                                    }
                                }
                            } else if (isReferenceId) {
                                resolve({
                                    status: "failed",
                                    response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss"),
                                    error: "The required reference_id was not found in the request",
                                    error_code: "dv-015"
                                })
                            } else {
                                resolve({
                                    status: "failed",
                                    error: "The document verification services are not configured for this organization",
                                    error_code: "dv-007",
                                    response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss")
                                })
                            }
                        }
                    } else {
                        resolve({
                            status: "failed",
                            error: "organisation_id do not match",
                            error_code: "dv-013",
                            response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss")
                        })
                    }
                } else if (!api_id && !api_key) {
                    resolve({
                        status: 'failed',
                        error: "The required x-parse-application-id and x-parse-rest-api-key not found",
                        error_code: "dv-010",
                        response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss"),
                    })
                } else if (!api_id) {
                    resolve({
                        status: 'failed',
                        error: "The required x-parse-application-id was not found",
                        error_code: "dv-011",
                        response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss"),
                    })
                } else if (!api_key) {
                    resolve({
                        status: 'failed',
                        error: "The required x-parse-rest-api-key was not found",
                        error_code: "dv-012",
                        response_time_stamp: moment().format("YYYY-MM-DDTHH:mm:ss"),
                    })
                }
            } catch (err) {
                resolve({
                    status: 'failed',
                    error: 'Unknown error',
                    error_code: 'dv-005',
                    response_time_stamp: moment().format()
                })
            }
        })
    }


    async generateTransactionId() {
        var randomcharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var randomchar = 'TXN';
        for (var i = 0; i <= 9; i++)
            randomchar += randomcharacters.charAt(Math.floor(Math.random() * randomcharacters.length));
        return randomchar
    }

    async invalidCases(id, reqId, user_id) {
        return new Promise(async (resolve, reject) => {
            try {
                var dataToSet = {
                    status: "failed",
                    verification_info: {
                        type: "String Compare",
                        status: "failed",
                        verification_data: {},
                    }
                }
                var dataToPush = {
                    history: {
                        status: 'Failed',
                        action_at: moment().format(),
                        action_by: user_id ? mongo.ObjectId(user_id) : ''
                    }
                }
                let failedCaseVerReq = await this.transactionRequest.updateById({ id: id, dataToSet: dataToSet, dataToPush: dataToPush })
                if (failedCaseVerReq.length != 0) {
                    var dataSet = {
                        status: 'failed',
                        response_at: moment().format()
                    }
                    var dataPush = {
                        history: {
                            status: 'Failed',
                            action_at: moment().format(),
                            action_by: user_id ? mongo.ObjectId(user_id) : ''
                        }
                    }
                    let api_log_modified = await this.apiLogs.updateById({ id: reqId, dataToSet: dataSet, dataToPush: dataPush })
                    resolve({ status: "success" })
                } else {
                    resolve({
                        status: "failed",
                        error: "Unknown error",
                        error_code: "dv-005",
                        response_time_stamp: moment().format()
                    })
                }
            } catch (err) {
                resolve({
                    status: "failed",
                    error: "Unknown error3",
                    error_code: "dv-005",
                    response_time_stamp: moment().format()
                })
            }
        })
    }

    async checkReferenceId(ref_id, org_id) {
        return new Promise(async (resolve, reject) => {
            var query = { "reference_id": ref_id, "organisation_id": mongojs.ObjectId(org_id) }
            let referenceCheck = await this.transactionRequest.findSortLimit(query, { _id: -1 }, 1)
            if (referenceCheck.length != 0) {
                resolve({
                    status: "failed",
                    reference_id: ref_id,
                    response_time_stamp: moment().format(),
                    error: "The reference_id used in the request should be unique.",
                    error_code: "dv-009"
                })
            } else {
                resolve({
                    status: "success"
                })
            }
        })
    }

    async processInitiated(id, user_id) {
        return new Promise(async (resolve, reject) => {
            try {

                var dataToset = {
                    verification_info: {
                        type: "String Compare",
                        status: "success",
                        verification_data: {},
                    },
                }
                var dataToPush = {
                    history: {
                        status: 'Process Initiated',
                        action_at: moment().format(),
                        action_by: user_id ? mongo.ObjectId(user_id) : ''
                    }
                }
                let log = await this.transactionRequest.updateById({ id: id, dataToSet: dataToset, dataToPush: dataToPush })
                if (log.length != 0) {
                    resolve({ status: 'success' })
                } else resolve({ status: 'failed' })
            } catch (err) {
                reject(err)
            }
        })
    }
    // billing
    async transaction(param) {
        return new Promise(async (resolve, reject) => {
            try {
                if (config.environment == 'uat' || config.environment == 'production') {
                    var query = { "organisation_id": mongo.ObjectId(param.organisation_id), status: 'active' }
                    let res = await this.subscriptionLogs.increment(query, { "wallet_info.document_verification.string_compare_validation": -1 })
                }
                var temp = {
                    transaction_id: param.transaction_id,
                    organisation_id: mongojs.ObjectId(param.organisation_id),
                    created_at: moment().format(),
                    created_by: param.user_id ? mongo.ObjectId(param.user_id) : '',
                    service_type: "verification",
                    api_name: "stringCompare",
                    type: "validation"  //verification_type
                }
                let tr = await this.transactionLog.insertOne(temp)
                resolve({ status: "success" })

            } catch (e) {
                resolve({ status: "failed", err: e })
            }
        })
    }

    async callbackDetails(callbackreq, id, result) {
        return new Promise(async (resolve, reject) => {
            try {
                var webhooksQuery = { "organisation_id": result.organisation_id ? result.organisation_id : "", "trigger": "StringCompare", is_deleted: false }
                let webHook = await this.webhookLog.findSortLimit(webhooksQuery, { _id: -1 }, 1)
                if (webHook.length != 0) {
                    resolve(callbackreq)
                    let callbackresponse = await this.apiCallback(callbackreq, id, webHook)
                } else {
                    resolve(callbackreq)
                }
            } catch (err) {
                resolve(err)
            }
        })
    }
    isBase64(str) {
        if (!str || typeof (str) != 'string' || !(str || '').trim()) { return false; }
        try {
            if (Buffer.from(str, 'base64').toString('base64') === str) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.log("error in base64 ---->", err);
            return false;
        }
    }

    async apiCallback(params, transrequestid, webHook) {
        return new Promise(async (resolve, reject) => {
            try {
                let orgQuery = { reference_id: params.reference_id }
                let apilogData = await this.apiLogs.findSortLimit(orgQuery, { _id: -1 }, 1)
                const options = {
                    url: webHook[0].callback_info.url,
                    method: webHook[0].callback_info.method,
                    json: true,
                };
                if (webHook[0] && webHook[0].is_encrypted == true && params.status == "success") {
                    if (apilogData && apilogData[0].api_credentials.api_id && apilogData[0].api_credentials.api_key) {
                        var apiData = {
                            api_id: apilogData[0].api_credentials.api_id,
                            api_key: apilogData && apilogData[0].api_credentials.api_key,
                            data_to_encrypt: params
                        }
                        let apiEncrypted = await cryptoServices.asymmetricEncryptAdvanced(apiData)
                        options.body = apiEncrypted
                        request(options, async function (err, response) {
                            this.transactionRequest = new GenericModel("signdesk_verification_requests");
                            if (err) {
                                resolve(err)
                            }
                            else {
                                var data = {
                                    callback_logs: {
                                        request: options,
                                        response: response.body
                                    }
                                }
                                let verificationreqModified = await this.transactionRequest.updateById({ id: transrequestid, dataToSet: data, dataToPush: {} })
                                resolve({ status: "success with encryption", result: response.body })
                            }
                        })
                    } else if (apilogData && apilogData[0].api_credentials.organisation_id) {
                        var orgData = {
                            organisation_id: apilogData[0].api_credentials.organisation_id,
                            data_to_encrypt: params
                        }
                        let orgEncrypted = await cryptoServices.asymmetricEncryptAdvanced(orgData)
                        options.body = orgEncrypted
                        request(options, async function (err, response) {
                            this.transactionRequest = new GenericModel("signdesk_verification_requests");
                            if (err) {
                                resolve(err)
                            }
                            else {
                                var data = {
                                    callback_logs: {
                                        request: options,
                                        response: response.body
                                    }
                                }
                                let verificationreqModified = await this.transactionRequest.updateById({ id: transrequestid, dataToSet: data, dataToPush: {} })
                                resolve({ status: "success with encryption", result: response.body })
                            }
                        })
                    } else {
                        resolve({ status: "failed" })
                    }

                } else if (webHook[0] && webHook[0].callback_info.url) {
                    options.body = params
                    request(options, async function (err, response) {
                        this.transactionRequest = new GenericModel("signdesk_verification_requests");
                        if (err) {
                            resolve(err)
                        }
                        else {
                            var data = {
                                callback_logs: {
                                    request: options,
                                    response: response.body
                                }
                            }
                            let verificationreqModified = await this.transactionRequest.updateById({ id: transrequestid, dataToSet: data, dataToPush: {} })
                            resolve({ status: "success withouth encryption", result: response.body })
                        }
                    })
                } else {
                    resolve({ status: "failed", message: 'url was not found in webhooks record' });
                }
            } catch (err) {
                resolve(err)
            }
        })
    }
    async detectMimeType(b64) {
        b64 = (b64 || '').toUpperCase()
        var signatures = {
            "IVBOR": "png",
            "JVBER": "pdf",
            "/9J/4": "jpg",
            "R0LGODDH": "gif",
            "R0LGODLH": "gif"
        };
        for (var s in signatures) {
            if (b64.indexOf(s) === 0) {
                return signatures[s]
            }
        }
    }
}

module.exports = new apiService()