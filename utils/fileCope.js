const fs = require("fs");

exports.deleteFiles = (...files) => {
  files.forEach((file) => {
    fs.unlink(`./public/${file}`, (err) => {
      if (err) console.log(`Error: ${err}`);
      console.log(`${file} successfully deleted`);
    });
  });
};
