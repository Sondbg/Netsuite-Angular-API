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
scriptContext.response.write(JSON.stringify({ok: true, status: 200}));
return 
        }
        else if(scriptContext.request.method ==="POST"){

         var body=scriptContext.request.body;
         log.debug('POST body',`Body: ${body}`);
          if(!body){
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
            scriptContext.response.write(JSON.stringify(response));
            return
         }








         // set headers and Response
addHeaders()
              scriptContext.response.write(JSON.stringify({ok: true, status: 200}));
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
            value: 'POST, GET'
         });
         scriptContext.response.addHeader({
           name: 'Access-Control-Allow-Headers',
            value: 'Origin, X-Requested-With, Content-Type, Accept'
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

     if(!company){
company='4018';
     }
     var pricingSearchObj = search.create({
         type: "pricing",
         filters:
         [
            ["customer","anyof",company], 
            "AND", 
            ["item.custitem_aqt_item_isscheduled","is","T"], 
            "AND", 
            ["formulatext: {quantityrange}","is","1+"]
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
               label: "Описание за оферта"
            }),
            search.createColumn({
               name: "custitem_aqt_item_image1",
               join: "item",
               label: "Снимка 1 (PDF)"
            }),
            search.createColumn({
               name: "custitem_aqt_group_item",
               join: "item",
               label: "Група"
            }),
            search.createColumn({
               name: "custitem_aqt_sub_group_code",
               join: "item",
               label: "Под Група"
            }),
            search.createColumn({name: "currency", label: "Currency"})
         ]
      });
      var searchResultCount = pricingSearchObj.runPaged().count;
      log.debug("pricingSearchObj result count",searchResultCount);
      pricingSearchObj.run().each(function(result){
         // .run().each has a limit of 4,000 results
         return true;
      });
      
      /*
      pricingSearchObj.id="customsearch1670836163065";
      pricingSearchObj.title="AQT Pricing by Customer (copy)";
      var newSearchId = pricingSearchObj.save();
      */
 }



     return {onRequest}

 });
