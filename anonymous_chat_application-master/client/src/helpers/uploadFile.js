import axios from 'axios';

const uploadFile = async(file) => {
  try {
      // Get upload signature from your backend
      const { data: { signature, timestamp, cloudName, apiKey } } = 
          await axios.post("http://localhost:3000/api/cloudinary/get-signature");
      
      // Create form data
      const formData = new FormData();
      formData.append("file", file);  // Use the file parameter
      formData.append("timestamp", timestamp);
      formData.append("api_key", apiKey);
      formData.append("signature", signature);
      
      // Upload to Cloudinary
      const uploadResponse = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData
      );

      // Return the response data which should include the image URL
      return {
          url: uploadResponse.data.secure_url,  // Make sure to return an object with url property
          ...uploadResponse.data
      };
  } catch (error) {
      console.error('Upload error:', error);
      throw error;  // Rethrow to handle in the component
  }
}

export default uploadFile;