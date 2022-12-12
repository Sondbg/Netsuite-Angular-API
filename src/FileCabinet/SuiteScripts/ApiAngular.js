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

log.debug('get operation')
scriptContext.response.write('Received');
return 
           }
           else if(scriptContext.request.method ==="POST"){
log.debug('context',scriptContext.request)
            var body=scriptContext.request.body;
            log.debug(`Body: ${body}`);
            
            if(!body){
                scriptContext.response.write('Invalid body');
                return
            }
            
               
                 
                 scriptContext.response.write('Received');
                 return
           }
                 

        }catch(err){
            log.debug('error',err)
            scriptContext.response.write({error:err});      
        }

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
