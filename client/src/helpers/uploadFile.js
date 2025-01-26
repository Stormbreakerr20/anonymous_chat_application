const uploadFile = async (file, { signature, timestamp, cloudName, apiKey }) => {
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("timestamp", timestamp);
    formData.append("api_key", apiKey);
    formData.append("signature", signature);
  
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    const responseData = await response.json();
  
    return responseData;
  };
  
  export default uploadFile;
  