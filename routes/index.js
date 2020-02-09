const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require("fs");
const multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './protein-coding-sequence/')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

var upload = multer({ storage: storage })

/* GET home page. */
router.get('/', (req, res, next)=>{
  res.render('index', { title: 'Express' });
});

//click button event handler triggers this route
router.post('/saveImage', upload.single('protein-sequence'), (req, res, next)=>{
  maxRoom = 3;
  fs.readdir("./protein-coding-sequence", (err, filesArray) => {
    if(err){
      console.log(err)
    }else{
      // console.log("there are " + filesArray.length + " files");
      //TODO: logic to see if files are more than 100
      if(filesArray.length >= maxRoom){
          //remove oldest file
          fs.unlink(`./protein-coding-sequence/${filesArray[0]}`, (err) => {
              if (err) throw err;
              // console.log(`${filesArray[0]} was deleted`);
          });
      }
    }
    fs.readFile(`./protein-coding-sequence/${filesArray[filesArray.length - 1]}`,(error, data)=>{
        let proteinString = data.toString();
        proteinString = proteinString.replace(/(\r\n|\n|\r)/gm, "");
        request.put(`https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Put&QUERY=${proteinString}&PROGRAM=blastp&DATABASE=pdb`, (err, res, body)=>{
          // console.log(body[body.search('<input name="RID" value="')]);
          let code = body.slice(body.search('<input name="RID" value="') + 25, body.search('<input name="RID" value="') + 36)
          setTimeout(()=>{
            let newBody = request(`https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&RID=${code}`);
            console.log(newBody)
            setTimeout(()=>{
              let finalBody = request(`https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&VIEW_RESULTS=FromRes&RID=${code}&FORMAT_TYPE=JSON`);
              console.log(finalBody);
            }, 30000)
          }, 60000);
          
        })
    })
  })

});




// TODO: setup http requests (still incomplete)
function getProteinNamesArray(string){
  

}

module.exports = router;
