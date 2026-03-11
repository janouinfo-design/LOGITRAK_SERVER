
// async function sendTagsToMicroservice(data){
//     try{
//         loggermodule.info('[MICROSERVICE]: Start sending data to microservice')
//         let response = await axios.post(xMicroService.uri , data);
//         loggermodule.info('[MICROSERVICE]: End sending data to microservice:'+(typeof response.data == 'string' ? response.data : JSON.stringify(response.data)))
//         return {success: true , response: response.data , status: response.status}
//     }catch(e){
//         loggermodule.info('[MICROSERVICE]: Error sending data to microservice - '+e.message)
//         return {success: false , response: e.message}
//     }
//   }
  
//   async function saveTagHistoriesToDB(data , infos){
//     if (Array.isArray(data) && data?.length > 0) {
//       let values = [];
//       for (let dt of data) {
//         let val = `('${dt.macAddr}',${dt.lat},${dt.lng},${
//           dt.LocationID || 0
//         },'${dt.address}','${dt.city}','${dt.country}','${dt.postal_code}','${
//           dt.worksite || 0
//         }','${infos.gmac || ""}',@cDate,'${infos.userID}',@dateParam)`;
//         values.push(val);
//       }
  
//         let sql = `
//                   declare @cDate  datetime = GETDATE();
//                   declare @dateParam datetime = convert(datetime,'${date}',126);
//                   insert into BeaconLogs(macaddr,lat,lng,locationID,address,city,country,postal_code,worksite,Gateway,creadate,creauser,logsDate)
//                   values ${values.join(",")}
//               `;
//         ssm.execSql(sql).then((result) => {
//           if (!result.success)
//             loggermodule.error("ERREUR saving tags to log:" + result?.response);
//         });
//       }
//       // sendAllDataToDb(dataSend);
//       return response.data;
//   } 
  
//   async function getEnginsToSave(data){
//     let enginsState = process.enginList;
//     if(!Array.isArray(enginsState) || enginsState?.length == 0)
//       fetchDataFromProcedure('engin_activeList' , {processKey: 'enginList'});
  
//     if(!Array.isArray(process.enginList)) enginsState = [];
//     let mergedData = data
//     .map((item) => {
//       let match = enginsState.find((entry) => entry.tagname === item.macAddr);
  
//       if (match) {
//         return { ...item, ...match };
//       }
  
//       return null;
//     })
//     .filter((item) => item !== null);
  
//     mergedData.forEach((item) => {
//       let status = "";
  
//       if (
//         (item.LocationID != item.activeGeofenceID && item.LocationID != 0) ||
//         item.LocationID == 0
//       ) {
//         status = "exits";
//       }
  
//       if (
//         item.LocationID == item.activeGeofenceID ||
//         (item.etatenginname == "exit" && item.LocationID != 0) ||
//         (item.etatenginname == "nonactive")
//       ) {
//         status = "enter";
//       }
  
//       if (status) {
//         procData.push({
//           idEngin: item.activeID,
//           tagname: item.tagname,
//           LocationID: item.LocationID,
//           lat: item.lat,
//           lng: item.lng,
//           address: item.address,
//           city: item.city,
//           country: item.country,
//           postal_code: item.postal_code,
//           status: status,
//         });
//       }
//     });
//     return data
//   }

// function addObjectsToArray(data, latitude, longitude, array) {
//     for (let i = 0; i < data.obj.length; i++) {
//       let obj = {
//         macAddr: data.obj[i].dmac,
//         lat: latitude,
//         lng: longitude,
//       };
//       array.push(obj);
//     }
  
//     return array;
//   }
  