import React, { useState } from "react";
import axios from "axios";

const ProfileImageUpload = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!fileTypes.includes(file.type)) {
        setError("Only JPEG and PNG files are allowed.");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("File size exceeds 5MB.");
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", selectedFile);

    try {
      setUploading(true);
      const token = localStorage.getItem("access_token");
      const response = await axios.post("http://localhost:5000/api/aws/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      onUploadSuccess(response.data.imageUrl);
      setUploading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed.");
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {previewUrl && (
        <div className="mt-4">
          <img src={previewUrl} alt="Preview" className="w-36 h-36 rounded-full" />
        </div>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
};

export default ProfileImageUpload;