const fs = require("fs");
const simpleReplacement = require('./logic/simpleReplacement');
const {getFile, getZip, readWord} = require('./readFile/getFiles');
const {processFile} = require('./logic/process')




const docxInputPath = "./edu.docx";
const strOutputPath = "./final.docx";
const data = new Map([
  ['lastName', '            Sagastume'],
  ['firstName', 'Eduardo'],
  ['secondName', ['a', 'b', 'c']],
  ['midName', 'Anibal']
]);







const startTime = performance.now();

async function main() {
  const docxFile = readWord(docxInputPath);
  let zip = await getZip(docxFile);
  let logs = [];
  const mainBody = await getFile(zip, 'document.xml')
  const headers = await getFile(zip, 'header1.xml')
  const footers = await getFile(zip, 'footer1.xml')


  const processedBody = processFile(mainBody, data, logs);
  const processedFooters = processFile(headers, data, logs);
  const processedHeaders = processFile(footers, data, logs);



  await packFinalResult(zip, processedBody, processedHeaders, processedFooters);
  writeLog(logs);

  writeFinalResult(zip);

 

}

(async () => {
  await main();
})();



async function packFinalResult(zip, processedBody, processedHeaders, processedFooters) {
  await zip.file('word/document.xml', processedBody);
  await zip.file('word/header1.xml', processedHeaders);
  await zip.file('word/footer1.xml', processedFooters);
}


async function writeFinalResult(zip) {
  zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(fs.createWriteStream(strOutputPath))
    .on('finish', async () => {
      console.log('Modified docx written to ' + strOutputPath);
      const endTime = performance.now();
      // Calculate and log the execution time
      const executionTime = endTime - startTime;
      console.log(`Script execution time: ${Math.round(executionTime)} milliseconds`);
    });
}


async function writeLog(logs) {
  if (logs.length > 0) {
    logs = logs.join('\n');
    await Bun.write("ERRORS.log", logs);
  }
}