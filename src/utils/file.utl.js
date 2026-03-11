const  { formatCurrentDate }  = require('../helpers') ;

const fs = require('fs').promises;
const { v4: uuid } = require('uuid')
const path = require('path')
const _ = require('lodash')
const moment = require('moment')

const { directories } = require('../configs');
const loggermodule = require('#modules/loggermodule.js');


const base64Uploder = async (base64, options = { fpath: 'default', type: 'default', extension }) => {
    // if(typeof base64 != "string" || (base64 || '').indexOf('base64') == -1)
    // return { success: false , data: "Not base64"}
    options.path = ['string', 'number'].includes(typeof options.fpath) ? options.fpath : 'default'
    options.type = ['string', 'number'].includes(typeof options.type) ? options.type : 'default'
    options.type = options.type.toString()
    console.log('options:', options)
    try {
        if (!base64) throw "Veuillez specifier une image valide";

        if (options?.isFromDirectory) {
            const convertFile = await fileToBase64(base64)
            base64 = convertFile.error ? '' : convertFile.result
        }

        if (typeof base64 != "string") throw "base64 invalide !!!"

        if (!base64.includes(';base64,')) base64 = 'data:image/png;base64,' + base64

        let imageParts = base64.split(';base64,');

        let image = imageParts.length == 1 ? imageParts[0] : imageParts[1];

        options.extension = options.extension || ( imageParts.length == 1 ? 'png' : imageParts[0].split('/')[1]);

        let buffer = Buffer.from(image, 'base64');
        
        let fDir = directories.storage || 'storage/'
        if(!fDir.endsWith('/')) fDir = fDir+'/'

        if(options.path.startsWith('/')) options.path = options.path.slice(1)
        if(!options.path.endsWith('/')) options.path = options.path+'/'

        let path = fDir + options.path;

        let filename = (options.filename || uuid())  + "." + options.extension;
        let fullname = path + filename

        await fs.mkdir(path, { recursive: true });
        let res = await fs.writeFile(fullname, buffer);

        console.log('file uploded successfully:', fullname, res);
        
        return { success: true, data: fullname, filename: options.path + filename , size: res }
    } catch (e) {
        console.log('err:', e)
        return { success: false, data: e.message }
    }

}


const fileToBase64 = async (file) => {
    try {
        let res = await fs.readFile(file, { encoding: 'base64' })
        return { error: false, result: res }
    } catch (e) {
        return { error: false, result: e.message }
    }
}

const removeDirectory = async (dir, storage = true) => {
    try {
        if (storage) dir = path.resolve(directories.storage, dir)
        let result = await fs.rm(dir, { recursive: true, force: true })


        console.info('[SUCCESS]:', dir + ' removed successfully !!!')
        return { success: true, result }
    } catch (ex) {
        console.error('[ERROR]:', `error while removing ${dir} (${ex.message})`)
        return { success: false, result: ex.message }
    }
}

const removeFile = async (dir, storage = true) => {
    try {

        if (typeof dir == 'string') dir = [dir]

        const isArray = Array.isArray(dir)
        if (!isArray) throw 'Wrong input format- format accepted (Array or string ). Format inputed -' + typeof (dir)

        dir = dir.map(d => !storage ? d : path.resolve(directories.storage, d))
        let result = []

        for (let d of dir) {
            result.push(await fs.unlink(d, { force: true }))
        }

        console.info('[SUCCESS]:', 'file ' + dir + ' removed successfully !!!')
        return { success: true, result }
    } catch (ex) {
        console.error('[ERROR]:', 'error while removing dir (' + ex.message + ')')
        return { success: false, result: ex.message }
    }
}

async function saveJsonToFile(obj , format = 'json') {
   try{
    if(obj === undefined || obj === null  ) throw new Error('Illegal object. Data must be a valid json. Go null')
    console.log('saveing json')

    if(!_.isPlainObject(format)) {
        format = {
            format
        }
    }
    format.directorie = format.directorie || directories.geofencing

    if(format.rootDir && format.directorie) format.directorie += "/"+format.rootDir;
    format.filename = format.filename || formatCurrentDate('DD-MM-YYYY-HH-mm-ss')
    format.format = format.format || 'json'

    if(!/json/i.test(format.format)){
        let error = new Error('Illegal format for json')
        error.name = 'illegaljson-format'
        error.code = 900
        throw error
    }
    
    await createDir(format.directorie)
    let filename = format.filename +'.'+format.format
    const fullPath = path.resolve(format.directorie,filename)
    await fs.writeFile(fullPath, JSON.stringify(obj))
    return { success: true , result: getStoragePathFromPath(fullPath) }
   }catch(err){
    console.log('error:', err)
     return { success: false, result: err.message}
   }
}

async function readGeofenceFile(filename){
    try{
        const fullPath = path.resolve(directories.geofencing,filename);
        let res = await fs.readFile(fullPath , 'utf8');
        return JSON.parse(res)
    }catch(err){
        // console.log('error reding file:', err)
        return err.message
    }
}

async function readJsonFile(directorie,filename){
    try{
        const fullPath = path.resolve(directorie,filename);
        let res = await fs.readFile(fullPath , 'utf8');
        return {success: true , response: JSON.parse(res)}
    }catch(err){
        return {success: false, response: err.message}
    }
}

async function createDir(path){
   return await fs.mkdir(path, { recursive: true });
}

function getStoragePathFromPath(path){
    try{
        let _path = 'storage/'+path.split('storage\\')[1];
        if(!_path) return null
        return _path.replace(process.cwd(),'').replace(/\\/g,'/')
    }catch(e){
        loggermodule.error('Error in getStoragePathFromPath:'+e.message)
        return null
    }
}

async function getFilesnameFromDirectory(dir){
    return fs.readdir( dir).then( async files =>{
        let finalFiles = []
        for( let file of files){
            try{
                let stat = await fs.stat(path.join(dir , file))
                let size = (stat.size/1024).toFixed(2)
                let unit = 'Ko'
                if(size > 1024) {
                    size = (stat.size/(1024*1024)).toFixed(2)
                    unit = 'Mb'
                }

                finalFiles.push({
                    name: file,
                    modifiedAt: moment(stat.mtime).format('DD-MM-YYYY HH:mm') ,
                    createAt: stat.ctime,
                    size,
                    unit,
                    datesecond: stat.mtime.getTime()
                }) 
            }catch(e){
                console.log('error:', e.message)
                finalFiles.push({name: file})
            }
        }

        finalFiles.sort((a , b)=> b.datesecond - a.datesecond)
        return finalFiles
    }).catch(e =>  e.message)
}

module.exports = { fileToBase64, base64Uploder, removeDirectory, removeFile , saveJsonToFile , readGeofenceFile , readJsonFile , getFilesnameFromDirectory }