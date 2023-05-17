const fs = require('fs');
const ErrorResponse = require('./errorResponse');

class ImageManipulation {
  constructor(file) {
    this.file = file;
  }

  async readAndWrite() {
    if(!fs.existsSync(`./public${this.file.destination}`)) {
      fs.mkdirSync(`./public${this.file.destination}`, { recursive: true})
      console.log('CREATING DIRECTORY')
    }

    fs.writeFile(`./public${this.file.destination}/${this.file.filename}`, this.file.buffer, err => {
      if (err) {
        return Promise.reject(new ErrorResponse(`${err}`, 500));
      }
      console.log(`Image successfully written `)
    })

  }
}

module.exports = ImageManipulation;