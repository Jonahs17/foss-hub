import {get, set, del} from 'idb-keyval';

export async function getCached(key){
    try{
        return await get(key);
    }
    catch(e){
        console.error("IndexDB get error:", e);
        return null;
    }
}

export async function setCached(key, value){
    try{
        return await set(key, value);
    }
    catch(e){
        console.error("IndexDB set error:", e);
        return null;
    }
}

export async function removeCached(key){
    try{
        await del(key);
        return true;
    }
    catch(e){
        console.error("IndexDB remove error:", e);
        return false;
    }
}
