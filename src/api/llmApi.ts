import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

/**
 * Interface for the LLM model input data
 */
interface LLMInputData {
  profile: any;
  university: any;
  program: any;
  recommender?: {
    name: string;
    email: string;
  };
}

/**
 * Class to handle interactions with the Python LLM model
 */
export class LLMApi {
  private pythonPath: string;
  private modelPath: string;

  constructor() {
    // Path to the Python executable (assuming it's in the virtual environment)
    this.pythonPath = path.join(process.cwd(), 'llm-service', 'venv', 'bin', 'python');
    
    // Path to the model.py file
    this.modelPath = path.join(process.cwd(), 'llm-service', 'model.py');
    
    // Check if the paths exist
    if (!fs.existsSync(this.pythonPath)) {
      console.warn(`Python executable not found at ${this.pythonPath}. Using system Python.`);
      this.pythonPath = 'python';
    }
    
    if (!fs.existsSync(this.modelPath)) {
      throw new Error(`Model file not found at ${this.modelPath}`);
    }
  }

  /**
   * Generate a Statement of Purpose using the LLM model
   * 
   * @param data Input data for the LLM model
   * @returns Generated SOP
   */
  async generateSOP(data: LLMInputData): Promise<string> {
    return new Promise((resolve, reject) => {
      // Create a temporary file to store the input data
      const tempInputFile = path.join(process.cwd(), 'temp_input.json');
      fs.writeFileSync(tempInputFile, JSON.stringify(data));
      
      // Create a temporary file to store the output
      const tempOutputFile = path.join(process.cwd(), 'temp_output.txt');
      
      // Spawn a Python process to run the model
      const pythonProcess = spawn(this.pythonPath, [
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
        if (fs.existsSync(tempInputFile)) {
          fs.unlinkSync(tempInputFile);
        }
        
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
          return;
        }
        
        // Read the output file
        if (fs.existsSync(tempOutputFile)) {
          const output = fs.readFileSync(tempOutputFile, 'utf-8');
          fs.unlinkSync(tempOutputFile);
          resolve(output);
        } else {
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
  async generateLOR(data: LLMInputData): Promise<string> {
    if (!data.recommender) {
      throw new Error('Recommender information is required for LOR generation');
    }
    
    return new Promise((resolve, reject) => {
      // Create a temporary file to store the input data
      const tempInputFile = path.join(process.cwd(), 'temp_input.json');
      fs.writeFileSync(tempInputFile, JSON.stringify(data));
      
      // Create a temporary file to store the output
      const tempOutputFile = path.join(process.cwd(), 'temp_output.txt');
      
      // Spawn a Python process to run the model
      const pythonProcess = spawn(this.pythonPath, [
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
        if (fs.existsSync(tempInputFile)) {
          fs.unlinkSync(tempInputFile);
        }
        
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
          return;
        }
        
        // Read the output file
        if (fs.existsSync(tempOutputFile)) {
          const output = fs.readFileSync(tempOutputFile, 'utf-8');
          fs.unlinkSync(tempOutputFile);
          resolve(output);
        } else {
          reject(new Error('Output file not found'));
        }
      });
    });
  }
}

// Create and export a singleton instance
export const llmApi = new LLMApi();
