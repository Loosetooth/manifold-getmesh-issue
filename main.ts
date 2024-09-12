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

// Main function to create a manifold from a JSON file
async function createManifoldFromJson(filePath: string) {
    // Read the JSON file
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const parsedJson = JSON.parse(jsonData);
    const meshOptions = convertToMeshOptions(parsedJson);

    // Initialize Manifold
    const wasm = await Module();
    wasm.setup();
    const { Manifold, Mesh } = wasm;

    // Create a Manifold object from the mesh options
    const mesh = new Mesh(meshOptions);
    const manifold = new Manifold(mesh);
    console.log(`Manifold object created for ${filePath}:`, manifold.getProperties());

    // Time the execution of the getMesh function
    console.log("Timing getMesh function for ", filePath);
    const startTime = performance.now();
    const resultMesh = manifold.getMesh(); // Assuming getMesh is a method of Manifold
    const endTime = performance.now();

    console.log(`Execution time for getMesh on ${filePath}:`, endTime - startTime, 'ms');

    return resultMesh;
}

// Function to convert parsed JSON data to MeshOptions
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

// Call the function for both JSON files
async function runTests() {
    await createManifoldFromJson('workingCutter.json');
    await createManifoldFromJson('brokenCutter.json');
}

// Execute the tests
runTests().catch(console.error);