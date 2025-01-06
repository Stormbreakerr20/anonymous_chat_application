import { response } from "express";



export const searchContacts = async (req, res, next) => {
    try{
        const {searchTerm} = req.body;

        if(searchTerm === undefined || searchTerm === null){
            return response.status(400).send("searchTerm is required")
        }
    }catch(error){
        console.log({error});
        return res.status(500).send("Internal server error");
    }
}