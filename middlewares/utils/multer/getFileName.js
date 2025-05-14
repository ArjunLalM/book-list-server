export default function formatFileName(fileName) {
    // Remove special characters and replace consecutive spaces with a single underscore
    const formattedName = fileName.replace(/[^a-zA-Z0-9.]+/g, '_');
  
    // Add timestamp at the beginning
    const timestamp = Date.now();
    
    // Extract file extension
    const extension = formattedName.split('.').pop();
    
    // Create the final formatted string
    const result = `${timestamp}_${formattedName}`;
  
    return result;
  }