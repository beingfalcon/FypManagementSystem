const path = require('path');
module.exports={
    get: (req,res)=>{
        var options = {
            root: path.join('public')
        };
        var fileName = 'ContactUs.html';
        res.sendFile(fileName, options, function (err) {
            if (err) {
                next(err);
            } else {
                console.log('Sent:', fileName);
            }
        });
    }
}