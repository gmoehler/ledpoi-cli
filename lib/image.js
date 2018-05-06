const fs = require('fs');
const png = require('pngjs').PNG;
const utils = require('./utils');

async function _uploadImage(client, id, imageFile) {
	
  return new Promise((resolve,reject) => {
    if (!fs.existsSync(imageFile)) {
      return reject(new Error("File does not exist."));
    }
    
    const stream = fs.createReadStream(imageFile);
    stream.on("error", () => {
      return reject(err);
    })
    const pipe = stream.pipe(new png({ filterType: 4 }));
    pipe.on("error", () => {
      return reject(err);
    })

    pipe.on('parsed', function() {
      console.log(`Read image ${imageFile} with ${this.width} frames and ${this.height} px` );

      // start transmission scene 0
      client.sendCmd([192, id, 0, 0, 0, 0]);

      for (let w = 0; w < this.width; w++) {
        // console.log(`frame: ${w}`);

        for (let h = 0; h < this.height; h++) {
          let idx = (this.width * h + w) << 2;

          //console.log(`${h}: ${this.data[idx]} ${this.data[idx+1]} ${this.data[idx+2]}`);
          client.sendCmd(
            [h, w, 0, this.data[idx], this.data[idx+1], this.data[idx+2] ],
			false);
          
          // mirror values on the back
          //console.log(`${2*this.height-h-1}: ${this.data[idx]} ${this.data[idx+1]} ${this.data[idx+2]}`);
          client.sendCmd(
            [2*this.height-h-1, w, 0, this.data[idx], this.data[idx+1], this.data[idx+2] ], 
			false);
        }
      }
      // end transmission scene 0
      client.sendCmd([193, 0, 0, 0, 0, 0]);
      return resolve();
    });
  })
};

module.exports = {
  uploadImage: _uploadImage
}