/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
 define(['N/log', 'N/record', 'N/search', 'N/email'],
 /**
* @param{log} log
* @param{record} record
* @param{search} search
*/
 (log, record, search, email) => {
     /**
      * Defines the Suitelet script trigger point.
      * @param {Object} scriptContext
      * @param {ServerRequest} scriptContext.request - Incoming request
      * @param {ServerResponse} scriptContext.response - Suitelet response
      * @since 2015.2
      */

     
     const onRequest = (scriptContext) => {
         try{
        if(scriptContext.request.method ==="GET"){
            var reqType=scriptContext.request.headers;
log.debug(reqType.type)
              scriptContext.response.addHeader({
                name:'Access-Control-Allow-Origin',
                 value: '*'
              });
               scriptContext.response.addHeader({
                name:'status',
                 value: '200'
              });
                scriptContext.response.addHeader({
                name:'ok',
                 value: 'true'
              });
log.debug('response headers',scriptContext.response.headers)
addHeaders()
scriptContext.response.write(JSON.stringify({ok: true, status: 200}));
return 
        }
        else if(scriptContext.request.method ==="POST"){

         var body=scriptContext.request.body;
         log.debug('POST body',`Body: ${body}`);
          if(!body){
            addHeaders()
            scriptContext.response.write(JSON.stringify({error:'Missing body data'}));
         return
         }
         body=JSON.parse(body);

         // create Customer
         if(body.method=='createCustomer'){
            var id=createCustomer(body.data);
            log.debug('record ID', id);

            addHeaders();
   scriptContext.response.write(JSON.stringify({ok: true, status: 200, internalID:id}));
return
         }
         //checkCustomer Email / password
         else if(body.method=='checkCustomer'){
            log.debug('hello')
            var email=body.data.email;
            var password=body.data.password
            var id=checkCustomer(email,password);
            log.debug('id returned from CheckCustomer',id);
            var response= id=== false? {ok: true, status: 204} : {ok:true, status:200, internalID:id};
         log.debug('checkCustomer response',response)
         addHeaders()
            scriptContext.response.write(JSON.stringify(response));
            return
         }
         //check Customer ID
         else if(body.method=='checkCustomerById'){
            var id=body.data;
            var response;
            var result=checkCustomerById(id);
            log.debug('result checkCustomerById',result)
            if(result){
               response={ok:true, status:200, info:result}
            }else{
               response={ok: true, status: 204}
            }
            addHeaders()
            scriptContext.response.write(JSON.stringify(response));
            return
         }
         //get Items
         else if(body.method=='getMyItemPrices'){
            var id=body.data;
            var response;

            var resultArr=customerPrices(id);
            log.debug('items Arr',resultArr);

            if(resultArr){
               response={ok:true, status:200, itemsArr:resultArr}
            }else{
               response={ok: true, status: 204}
            }
            addHeaders()
            scriptContext.response.write(JSON.stringify(response));
            return
         }else if(body.method=='getItemPrice'){
            var sku=body.data.sku;
            var company=body.data.company
            var response;
            
            var resultObj=customerPriceOnItem(company,sku);
            log.debug('items Arr',resultArr);

            if(resultObj){
               response={ok:true, status:200, item:resultObj}
            }else{
              
               response={ok: true, status: 204}
            }
            addHeaders()
            scriptContext.response.write(JSON.stringify(response));
            return
         }else if(body.method=='createSO'){
            var company=body.data.company;
            var products=body.data.products.personalCart;
            var response;
            var result=createSO(products,company)
            if(result){
               response={ok:true, status:200}
            }else{
              
               response={ok: true, status: 204}
            }
            addHeaders()
            scriptContext.response.write(JSON.stringify(response));
            return

         }else if(body.method=='getMySo'){
            var company=body.data.company;
            var response;
            var resultArr=getMySo(company);

            if(resultArr.length>0){
               response={ok:true, status:200, records:resultArr}
            }else{
              
               response={ok: true, status: 204}
            }
            addHeaders()
            scriptContext.response.write(JSON.stringify(response));
            return
         }







         // set headers and Response

addHeaders()
              scriptContext.response.write(JSON.stringify({ok: true, status: 204}));
              return 
        }
              
        function addHeaders(){
         scriptContext.response.addHeader({
            name:'status',
             value: '200'
          });
            scriptContext.response.addHeader({
            name:'ok',
             value: 'true'
          });
        
          scriptContext.response.addHeader({
            name: 'Access-Control-Allow-Origin',
             value: 'http://localhost:4200'
          });
          scriptContext.response.addHeader({
           name: 'Access-Control-Allow-Method',
            value: 'POST, GET, OPTIONS'
         });
         scriptContext.response.addHeader({
           name: 'Access-Control-Allow-Headers',
            value: 'Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers, Access-Control-Allow-Method, Access-Control-Allow-Origin'
         });
         scriptContext.response.addHeader({
           name: 'Content-Type',
            value: 'application/json'
         });
         scriptContext.response.addHeader({
           name: 'Response-Code',
            value: '200'
         });
      }
     }catch(err){
         log.debug('error',err)
         var errObj={error:err}
         scriptContext.response.write(JSON.stringify(errObj));      
     }

 }

function getMySo(company){
   var returnArr=[];

   var salesorderSearchObj = search.create({
      type: "salesorder",
      filters:
      [
         ["mainline","is","T"], 
         "AND", 
         ["name","anyof",company], 
         "AND", 
         ["type","anyof","SalesOrd"]
      ],
      columns:
      [
         search.createColumn({name: "trandate", label: "Date"}),
         search.createColumn({name: "amount", label: "Amount"}),
         search.createColumn({name: "tranid", label: "Document Number"}),
         search.createColumn({name: "internalid", label: "Internal ID"})
      ]
   });
   var searchResultCount = salesorderSearchObj.runPaged().count;
   log.debug("salesorderSearchObj result count",searchResultCount);
   if(searchResultCount==0) return false
   var resultSS=salesorderSearchObj.run().getRange({
      start:0,
      end:100
   })
   for(var i=0; i<resultSS.length;i++){
      log.debug('result',resultSS[i])
      var tranObj={
         date: resultSS[i].getValue({
            name: 'trandate'
           }),
           amount:resultSS[i].getValue({
            name: 'amount'
           }),
           tranID:resultSS[i].getValue({
            name: 'tranid'
           }),
           internalID:resultSS[i].getValue({
            name: 'internalid'
           }),

      }
      returnArr.push(tranObj)
   }

 return returnArr  
   
   /*
   salesorderSearchObj.id="customsearch1671747230686";
   salesorderSearchObj.title="AQT SO by Customer (copy)";
   var newSearchId = salesorderSearchObj.save();
   */
}


 function createSO(lineItems,company) {

   var newSO = record.create({
       type: record.Type.SALES_ORDER,
       isDynamic: true,
   });
   setLineOnRecord(newSO, 'customform', '238');
   setLineOnRecord(newSO, 'entity', company);
   setLineOnRecord(newSO, 'department', '2');
   setLineOnRecord(newSO, 'salesrep', '242');
   setLineOnRecord(newSO, 'location', '15');
   setLineOnRecord(newSO, 'class', '1');
   setLineOnRecord(newSO, 'custbody_aqt_created_by', '9708');



   for (let i = 0; i < lineItems.length; i++) {
       var itemSku = lineItems[i].sku;
       var qty = lineItems[i].quantity;

       var searchItemID = search.create({
           type: 'item',
           columns: [{
               name: 'internalid'
           }],
           filters: [{
               name: 'itemid',
               operator: 'is',
               values: [itemSku]
           }]
       });

       var resultID = searchItemID.run().getRange({
           start: '0',
           end: '5'
       });

       var itemID = resultID[0].getValue({
           name: 'internalid'
       });
       //set item
       newSO.setCurrentSublistValue({
           sublistId: 'item',
           fieldId: 'item',
           value: itemID,
           ignoreFieldChange: false
       });
       // set quantity
       newSO.setCurrentSublistValue({
           sublistId: 'item',
           fieldId: 'quantity',
           value: qty,
           ignoreFieldChange: false

       });
       newSO.setCurrentSublistValue({
           sublistId: 'item',
           fieldId: 'location',
           value: '15',
           ignoreFieldChange: false

       });
       newSO.commitLine({
           sublistId: 'item'
       })

   }
   newSO.save();
 return newSO.id
}

function setLineOnRecord(record, field, value) {
   try {
       record.setValue({
           fieldId: field,
           value: value,
           ignoreFieldChange: false
       });
   } catch (e) {
       log.debug({
           title: 'set field Value',
           details: `field: ${field} ; value: ${value}`
       });
   }
}

function createCustomer(values){
   var customerRecord=record.create({
      type: record.Type.CUSTOMER,
      isDynamic: true,
      defaultValues: Object
   });
   customerRecord.setValue({
      fieldId: 'vatregnumber',
      value: values.vatReg,
      ignoreFieldChange: false
   });
   customerRecord.setValue({
      fieldId: 'companyname',
      value: values.company,
      ignoreFieldChange: false
   });
   customerRecord.setValue({
      fieldId: 'email',
      value: values.email,
      ignoreFieldChange: false
   });
   customerRecord.setValue({
      fieldId: 'phone',
      value: values.phone,
      ignoreFieldChange: false
   });
   customerRecord.setValue({
      fieldId: 'custentity_password',
      value: values.password,
      ignoreFieldChange: false
   });


var addressSubrecord = customerRecord.getCurrentSublistSubrecord({
   sublistId: 'addressbook',
   fieldId: 'addressbookaddress',
 });

 
 // Set all required values here.
 addressSubrecord.setValue({
     fieldId: 'addr1',
     value: values.address
 })
 addressSubrecord.setValue({
   fieldId: 'country',
   value: 'BG'
})

customerRecord.commitLine({
   sublistId: 'addressbook',
   ignoreRecalc: true
})

   var internalID=customerRecord.save()
  return internalID
}

function checkCustomer(email,password){
   var returnInfo;
   var customerSearchObj = search.create({
      type: "customer",
      filters:
      [
         ["email","is",email], 
         "AND", 
         ["custentity_password","is",password]
      ],
      columns:
      [
         search.createColumn({name: "internalid", label: "Internal ID"}),
         // search.createColumn({name: "vatregnumber", label: "Tax Number"}),
         // search.createColumn({name: "altname", label: "Name"}),
         // search.createColumn({name: "email", label: "Email"}),
         // search.createColumn({name: "phone", label: "Phone"}),
         // search.createColumn({name: "address", label: "Address"})
      ]
   });
   var searchResultCount = customerSearchObj.runPaged().count;
   log.debug("Find Customer result count",searchResultCount);
   if(searchResultCount===0) return false
   customerSearchObj.run().each(function(result){
      // .run().each has a limit of 4,000 results
      returnInfo= result.getValue({
         name: 'internalid'
        });
   });
   return returnInfo
   /*
   customerSearchObj.id="customsearch1671218851392";
   customerSearchObj.title="DO NOT EDIT Check is Customer / Pass exists (copy)";
   var newSearchId = customerSearchObj.save();
   */
}

function checkCustomerById(id){
   var returnObj={};
   var customerSearchObj = search.create({
      type: "customer",
      filters:
      [
         ["internalid","anyof",id], 

      ],
      columns:
      [
         search.createColumn({name: "internalid", label: "Internal ID"}),
         search.createColumn({name: "vatregnumber", label: "Tax Number"}),
         search.createColumn({name: "altname", label: "Name"}),
         search.createColumn({name: "email", label: "Email"}),
         search.createColumn({name: "phone", label: "Phone"}),
         search.createColumn({name: "address", label: "Address"})
      ]
   });
   var searchResultCount = customerSearchObj.runPaged().count;
   log.debug("Find Customer result count",searchResultCount);
   if(searchResultCount===0) return false
   customerSearchObj.run().each(function(result){
      // .run().each has a limit of 4,000 results
      var id=result.getValue({
         name: 'internalid'
        });

        var vat=result.getValue({
         name: 'vatregnumber'
        });

        var name=result.getValue({
         name: 'altname'
        });

        var email=result.getValue({
         name: 'email'
        });
        
        var phone=result.getValue({
         name: 'phone'
        });   

        var address=result.getValue({
         name: 'address'
        });

     returnObj={
         id,
         vat,
         name,
         email,
         phone,
         address
        }
   });
return returnObj
   /*
   customerSearchObj.id="customsearch1671218851392";
   customerSearchObj.title="DO NOT EDIT Check is Customer / Pass exists (copy)";
   var newSearchId = customerSearchObj.save();
   */
}
 function customerPrices(company){

     if(!company.id){
company={id:"4018"};

     }
log.debug('company ID',company)
var returnArr=[];
     var pricingSearchObj = search.create({
         type: "pricing",
         filters:
         [
            ["customer","anyof",company.id], 
            "AND", 
            ["item.custitem_aqt_item_isscheduled","is","T"], 
            "AND", 
            ["formulatext: {quantityrange}","is","1+"],
            "AND", 
      ["item.custitem_aqt_sub_group_code","anyof","1","2","3"],
      "AND", 
      ["item.imageurl","isnotempty",""]
         ],
         columns:
         [
            search.createColumn({
               name: "item",
               sort: search.Sort.ASC,
               label: "Item"
            }),
            
            search.createColumn({name: "unitprice", label: "Unit Price"}),
            search.createColumn({
               name: "imageurl",
               join: "item",
               label: "Image URL"
            }),
            search.createColumn({
               name: "custitem_aqt_offer_description",
               join: "item",
               label: "???????????????? ???? ????????????"
            }),
            search.createColumn({
               name: "custitem_aqt_item_image1",
               join: "item",
               label: "???????????? 1 (PDF)"
            }),
            search.createColumn({
               name: "custitem_aqt_group_item",
               join: "item",
               label: "??????????"
            }),
            search.createColumn({
               name: "custitem_aqt_sub_group_code",
               join: "item",
               label: "?????? ??????????"
            }),
            search.createColumn({name: "currency", label: "Currency"})
         ]
      });
      var searchResultCount = pricingSearchObj.runPaged().count;
      log.debug("Item Pricing Search result count",searchResultCount);
      if(searchResultCount==0) return false
      var resultSS=pricingSearchObj.run().getRange({
         start:0,
         end:100
      })

      for(var i=0; i<resultSS.length;i++){
         log.debug('result',resultSS[i])
         var itemObj={
            sku: resultSS[i].getText({
               name: 'item'
              }),
              price:resultSS[i].getValue({
               name: 'unitprice'
              }),
              imageUrl:resultSS[i].getValue({
               name: 'imageurl',
               join:'item'
              }),
              description:resultSS[i].getValue({
               name: 'custitem_aqt_offer_description',
               join:'item'
              }),
              group:resultSS[i].getValue({
               name: 'custitem_aqt_sub_group_code',
               join:'item'
              }),
         }
         returnArr.push(itemObj)
      }

    return returnArr  
      /*
      pricingSearchObj.id="customsearch1670836163065";
      pricingSearchObj.title="AQT Pricing by Customer (copy)";
      var newSearchId = pricingSearchObj.save();
      */
 }

function customerPriceOnItem(company,sku){
   if(!company){
      company="4018";
      
           }
      log.debug('company ID ',company)
           var returnObj;
      
           var pricingSearchObj = search.create({
               type: "pricing",
               filters:
               [
                  ["customer","anyof",company], 
                  "AND", 
                  ["item.custitem_aqt_item_isscheduled","is","T"], 
                  "AND", 
                  ["formulatext: {quantityrange}","is","1+"],
                  "AND", 
            ["item.custitem_aqt_sub_group_code","anyof","1","2","3"],
            "AND", 
            ["item.imageurl","isnotempty",""],
            "AND", 
            ["formulatext: {item.itemid}","contains",sku]
               ],
               columns:
               [
                  search.createColumn({
                     name: "item",
                     sort: search.Sort.ASC,
                     label: "Item"
                  }),
                  
                  search.createColumn({name: "unitprice", label: "Unit Price"}),
                  search.createColumn({
                     name: "imageurl",
                     join: "item",
                     label: "Image URL"
                  }),
                  search.createColumn({
                     name: "custitem_aqt_offer_description",
                     join: "item",
                     label: "???????????????? ???? ????????????"
                  }),
                  search.createColumn({
                     name: "custitem_aqt_item_image1",
                     join: "item",
                     label: "???????????? 1 (PDF)"
                  }),
                  search.createColumn({
                     name: "custitem_aqt_group_item",
                     join: "item",
                     label: "??????????"
                  }),
                  search.createColumn({
                     name: "custitem_aqt_sub_group_code",
                     join: "item",
                     label: "?????? ??????????"
                  }),
                  search.createColumn({
                     name: "custitem_aqt_wp_item_description",
                     join: "item",
                     label: "Wordpress Description"
                  }),
                  search.createColumn({
                     name: "custitem_aqt_wordpress_item_title",
                     join: "item",
                     label: "Wordpress Item Title"
                  }),
                  search.createColumn({
                     name: "saleunit",
                     join: "item",
                     label: "Primary Sale Unit"
                  }),
                  search.createColumn({name: "currency", label: "Currency"})
               ]
            });
            var searchResultCount = pricingSearchObj.runPaged().count;
            log.debug("Item Pricing Search result count",searchResultCount);
            var resultSS=pricingSearchObj.run().getRange({
               start:0,
               end:100
            })
      
            for(var i=0; i<resultSS.length;i++){
               log.debug('result',resultSS[i])
               var itemObj={
                  sku: resultSS[i].getText({
                     name: 'item'
                    }),
                    price:resultSS[i].getValue({
                     name: 'unitprice'
                    }),
                    imageUrl:resultSS[i].getValue({
                     name: 'imageurl',
                     join:'item'
                    }),
                    description:resultSS[i].getValue({
                     name: 'custitem_aqt_offer_description',
                     join:'item'
                    }),
                    group:resultSS[i].getValue({
                     name: 'custitem_aqt_sub_group_code',
                     join:'item'
                    }),
                    WPDescription:resultSS[i].getValue({
                     name: 'custitem_aqt_wp_item_description',
                     join:'item'
                    }),
                    WPItemTitle:resultSS[i].getValue({
                     name: 'custitem_aqt_wordpress_item_title',
                     join:'item'
                    }),
                    unit:resultSS[i].getText({
                     name: 'saleunit',
                     join:'item'
                    }),
               }
               returnObj=itemObj
            }
      
          return returnObj
            /*
            pricingSearchObj.id="customsearch1670836163065";
            pricingSearchObj.title="AQT Pricing by Customer (copy)";
            var newSearchId = pricingSearchObj.save();
            */

}

     return {onRequest}

 });
