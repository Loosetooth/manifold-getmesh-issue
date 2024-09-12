import Module from 'manifold-3d';
import * as fs from 'fs';

type MeshOptions = {
  faceID?: Uint32Array;
  halfedgeTangent?: Float32Array;
  mergeFromVert?: Uint32Array;
  mergeToVert?: Uint32Array;
  numProp: number;
  runIndex?: Uint32Array;
  runOriginalID?: Uint32Array;
  runTransform?: Float32Array;
  triVerts: Uint32Array;
  vertProperties: Float32Array;
}

// Function to read the cutter.json file and create a manifold mesh
async function createManifoldFromJson(filePath: string) {
    // Read the JSON file
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const parsedJson = JSON.parse(jsonData);
    logJsonTypes(parsedJson);
    const meshOptions = convertToMeshOptions(parsedJson);
    console.log("Mesh options keys: ", Object.keys(meshOptions));

    // Initialize Manifold
    const wasm = await Module();
    wasm.setup();
    const { Manifold, Mesh } = wasm;

    // Create a Manifold object from the mesh options
    const mesh = new Mesh(meshOptions);
    const manifold = new Manifold(mesh);
    console.log("Manifold object created: ", manifold.getProperties())

    // Time the execution of the getMesh function
    const startTime = performance.now();
    const resultMesh = manifold.getMesh(); // Assuming getMesh is a method of Manifold
    const endTime = performance.now();

    console.log('Execution time for getMesh:', endTime - startTime, 'ms');

    return resultMesh;
}

// Call the function with the path to cutter.json
createManifoldFromJson('cutter.json').catch(console.error);

function convertToMeshOptions(data: any): MeshOptions {
  const meshOptions: MeshOptions = {
      numProp: data.numProp || 0, // Set numProp, default to 0 if not provided
      triVerts: new Uint32Array(Object.values(data.triVerts)), // Convert triVerts to Uint32Array
      vertProperties: new Float32Array(Object.values(data.vertProperties)), // Convert vertProperties to Float32Array
  };

  // Optional fields: Check if they exist in the data and convert if they do
  if (data.faceID) {
      meshOptions.faceID = new Uint32Array(Object.values(data.faceID));
  }
  if (data.halfedgeTangent) {
      meshOptions.halfedgeTangent = new Float32Array(Object.values(data.halfedgeTangent));
  }
  if (data.mergeFromVert) {
      meshOptions.mergeFromVert = new Uint32Array(Object.values(data.mergeFromVert));
  }
  if (data.mergeToVert) {
      meshOptions.mergeToVert = new Uint32Array(Object.values(data.mergeToVert));
  }
  if (data.runIndex) {
      meshOptions.runIndex = new Uint32Array(Object.values(data.runIndex));
  }
  if (data.runOriginalID) {
      meshOptions.runOriginalID = new Uint32Array(Object.values(data.runOriginalID));
  }
  if (data.runTransform) {
      meshOptions.runTransform = new Float32Array(Object.values(data.runTransform));
  }

  return meshOptions;
}

function logJsonTypes(data: any) {
  console.log("Types of keys in the parsed JSON:");
  for (const key in data) {
      if (data.hasOwnProperty(key)) {
          console.log(`${key}: ${typeof data[key]}`);
      }
  }
}