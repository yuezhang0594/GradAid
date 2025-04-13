"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.llmApi = exports.LLMApi = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * Class to handle interactions with the Python LLM model
 */
class LLMApi {
    constructor() {
        // Path to the Python executable (assuming it's in the virtual environment)
        this.pythonPath = path_1.default.join(process.cwd(), 'llm-service', 'venv', 'bin', 'python');
        // Path to the model.py file
        this.modelPath = path_1.default.join(process.cwd(), 'llm-service', 'model.py');
        // Check if the paths exist
        if (!fs_1.default.existsSync(this.pythonPath)) {
            console.warn(`Python executable not found at ${this.pythonPath}. Using system Python.`);
            this.pythonPath = 'python';
        }
        if (!fs_1.default.existsSync(this.modelPath)) {
            throw new Error(`Model file not found at ${this.modelPath}`);
        }
    }
    /**
     * Generate a Statement of Purpose using the LLM model
     *
     * @param data Input data for the LLM model
     * @returns Generated SOP
     */
    async generateSOP(data) {
        return new Promise((resolve, reject) => {
            // Create a temporary file to store the input data
            const tempInputFile = path_1.default.join(process.cwd(), 'temp_input.json');
            fs_1.default.writeFileSync(tempInputFile, JSON.stringify(data));
            // Create a temporary file to store the output
            const tempOutputFile = path_1.default.join(process.cwd(), 'temp_output.txt');
            // Spawn a Python process to run the model
            const pythonProcess = (0, child_process_1.spawn)(this.pythonPath, [
                '-c',
                `
import json
import sys
from model import LlamaModel

# Load input data
with open('${tempInputFile}', 'r') as f:
    data = json.load(f)

# Initialize the model
model = LlamaModel()

# Generate SOP
sop = model.generate_sop(data)

# Save the output
with open('${tempOutputFile}', 'w') as f:
    f.write(sop)
        `
            ]);
            let errorOutput = '';
            pythonProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            pythonProcess.on('close', (code) => {
                // Clean up the temporary input file
                if (fs_1.default.existsSync(tempInputFile)) {
                    fs_1.default.unlinkSync(tempInputFile);
                }
                if (code !== 0) {
                    reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
                    return;
                }
                // Read the output file
                if (fs_1.default.existsSync(tempOutputFile)) {
                    const output = fs_1.default.readFileSync(tempOutputFile, 'utf-8');
                    fs_1.default.unlinkSync(tempOutputFile);
                    resolve(output);
                }
                else {
                    reject(new Error('Output file not found'));
                }
            });
        });
    }
    /**
     * Generate a Letter of Recommendation using the LLM model
     *
     * @param data Input data for the LLM model
     * @returns Generated LOR
     */
    async generateLOR(data) {
        if (!data.recommender) {
            throw new Error('Recommender information is required for LOR generation');
        }
        return new Promise((resolve, reject) => {
            // Create a temporary file to store the input data
            const tempInputFile = path_1.default.join(process.cwd(), 'temp_input.json');
            fs_1.default.writeFileSync(tempInputFile, JSON.stringify(data));
            // Create a temporary file to store the output
            const tempOutputFile = path_1.default.join(process.cwd(), 'temp_output.txt');
            // Spawn a Python process to run the model
            const pythonProcess = (0, child_process_1.spawn)(this.pythonPath, [
                '-c',
                `
import json
import sys
from model import LlamaModel

# Load input data
with open('${tempInputFile}', 'r') as f:
    data = json.load(f)

# Initialize the model
model = LlamaModel()

# Extract recommender info
recommender = data.pop('recommender')

# Generate LOR
lor = model.generate_lor(data, recommender)

# Save the output
with open('${tempOutputFile}', 'w') as f:
    f.write(lor)
        `
            ]);
            let errorOutput = '';
            pythonProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            pythonProcess.on('close', (code) => {
                // Clean up the temporary input file
                if (fs_1.default.existsSync(tempInputFile)) {
                    fs_1.default.unlinkSync(tempInputFile);
                }
                if (code !== 0) {
                    reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
                    return;
                }
                // Read the output file
                if (fs_1.default.existsSync(tempOutputFile)) {
                    const output = fs_1.default.readFileSync(tempOutputFile, 'utf-8');
                    fs_1.default.unlinkSync(tempOutputFile);
                    resolve(output);
                }
                else {
                    reject(new Error('Output file not found'));
                }
            });
        });
    }
}
exports.LLMApi = LLMApi;
// Create and export a singleton instance
exports.llmApi = new LLMApi();
