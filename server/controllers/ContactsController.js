const User = require("../models/UserModel.js");

exports.searchContacts = async (req, res, next) => {
    try{
        const {searchTerm} = req.body;
        
        if(!searchTerm){
            return res.status(400).send("searchTerm is required");
        }

        const sanitizedSearchTerm = searchTerm.replace(/[^a-zA-Z0-9\s]/g, '');
        const regex = new RegExp(sanitizedSearchTerm,"i");

        const contacts = await User.find({
            $and:[
                {_id:{$ne: req.userId}},
                {
                    $or: [
                        { email: { $regex: regex } },
                        { firstName: { $regex: regex } },
                        { lastName: { $regex: regex } },
                    ]
                },
            ]
        });

        return res.status(200).json({contacts});
    }catch(error){
        console.log({error});
        return res.status(500).send("Internal server error");
    }
}