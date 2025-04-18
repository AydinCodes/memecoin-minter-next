import * as fs from 'fs';
import * as path from 'path';

// Function to recursively get all TypeScript and TSX files in a directory
function getTsFiles(dir: string): string[] {
  const files: string[] = [];
  
  // Skip node_modules and .next directories
  if (dir.includes('node_modules') || dir.includes('.next')) {
    return files;
  }
  
  try {
    // Read all items in the directory
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      
      // Skip node_modules and .next directories
      if (item === 'node_modules' || item === '.next') {
        continue;
      }
      
      try {
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory()) {
          // If it's a directory, recurse into it
          files.push(...getTsFiles(fullPath));
        } else if (stats.isFile() && 
                  (item.endsWith('.ts') || item.endsWith('.tsx')) && 
                  !item.endsWith('combine.ts')) {
          // If it's a TypeScript or TSX file and not this script itself
          files.push(fullPath);
        }
      } catch (error) {
        console.error(`Error accessing ${fullPath}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error);
  }
  
  return files;
}

// Main function to combine files
async function combineFiles() {
  // Get current directory
  const currentDir = process.cwd();
  
  // Get all TypeScript and TSX files
  const tsFiles = getTsFiles(currentDir);
  
  // Create output content
  let outputContent = '';
  
  // Process each file
  for (const file of tsFiles) {
    // Get relative path for display
    const relativePath = path.relative(currentDir, file);
    
    try {
      // Read file content
      const content = fs.readFileSync(file, 'utf8');
      
      // Add file name header and content to output
      outputContent += `// ===== ${relativePath} =====\n\n`;
      outputContent += content;
      outputContent += '\n\n';
      
      console.log(`Added: ${relativePath}`);
    } catch (error) {
      console.error(`Error reading file ${relativePath}:`, error);
    }
  }
  
  // Write to output file
  const outputFile = 'combined_ts_files.txt';
  fs.writeFileSync(outputFile, outputContent);
  
  console.log(`\nCombined ${tsFiles.length} TypeScript and TSX files into ${outputFile}`);
}

// Run the script
combineFiles().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});