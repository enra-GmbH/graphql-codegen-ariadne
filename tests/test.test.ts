import fs from 'fs';
import path from 'path';
import { convertToPython } from '../src/index';

// test.each([[1, 1]])('test', (input, output) => {
//   expect(input).toBe(output);
// })
const TEST_FILE_DIR = "./tests";

// location of .graphql and .py files

type TestFilePaths = Array<{graphql: string, python: string}>;

function testFiles(): TestFilePaths {
  const graphqlFiles = fs.readdirSync("./tests").filter(filename => filename.endsWith(".graphql"));
  const files: TestFilePaths = [];
  graphqlFiles.forEach(filename => {
    const pythonFileName = `${path.parse(filename).name}.py`;
    const pythonFilePath = `${TEST_FILE_DIR}/${pythonFileName}`;
    if (!fs.existsSync(pythonFilePath)) {
      throw Error(`.py file corresponding to ${filename} doesn't exist. Looked at: ${pythonFilePath}`);
    }
    files.push({
      graphql: `${TEST_FILE_DIR}/${filename}`,
      python: pythonFilePath
    })
  })
  return files;
}

testFiles().forEach(filePair => {
  it(`${path.parse(filePair.graphql).base} -> ${path.parse(filePair.python).base}`, () => {
    const sdl = fs.readFileSync(filePair.graphql, 'utf-8');
    const python = convertToPython(sdl);
    const pythonTarget = fs.readFileSync(filePair.python, 'utf-8');
    fs.writeFileSync(`${TEST_FILE_DIR}/actual/${path.parse(filePair.python).name}.py`, python)
    expect(python).toEqual(pythonTarget);
  })
})