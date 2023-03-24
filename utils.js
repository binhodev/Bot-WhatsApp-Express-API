const fs = require("fs");

const copyQrCodeFile = (filename) => {
  const qrcodefile = `./${filename}.qr.png`;
  setTimeout(() => {
    if (fs.existsSync(qrcodefile)) {
      fs.copyFileSync(qrcodefile, `./views/${filename}.qr.png`);
    } else {
      console.log("File not exists");
    }
  }, 3000);
};

module.exports = {
  copyQrCodeFile,
};
