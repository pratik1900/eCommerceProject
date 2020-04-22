const fs = require('fs');

module.exports.deleteFile = filepath => {
    fs.unlink(filepath, (err) => {
        if(err) {
            throw (err);
        }
    })
}