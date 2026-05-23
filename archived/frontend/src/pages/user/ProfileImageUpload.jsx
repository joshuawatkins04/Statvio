import React, { useState } from "react";
import axios from "axios";
import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";

const ProfileImageUpload = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [cropper, setCropper] = useState(null);
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

  const getCroppedImage = async () => {
    if (cropper) {
      const canvas = cropper.getCroppedCanvas({
        width: 150,
        height: 150,
      });
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject("Canvas is empty");
            return;
          }
          const file = new File([blob], selectedFile.name, {
            type: selectedFile.type,
          });
          resolve(file);
        }, selectedFile.type);
      });
    }
    return null;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("No file selected.");
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem("access_token");

      const croppedFile = await getCroppedImage();
      if (!croppedFile) {
        setError("Please crop image before uploading.");
        return;
      }

      const formData = new FormData();
      formData.append("profileImage", croppedFile);

      const response = await axios.post(__AWS_UPLOAD_URL__, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: token ? `Bearer ${token}` : "",
          withCredentials: true,
        },
      });
      onUploadSuccess(response.data.imageUrl);
      setUploading(false);
      setError("");
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
          <Cropper
            style={{ height: 300, width: "100%" }}
            src={previewUrl}
            aspectRatio={1}
            viewMode={1}
            guides={true}
            cropBoxMovable={true}
            cropBoxResizable={false}
            background={false}
            zoomOnWheel={false}
            zoomable={false}
            dragMode="none"
            preview=".img-preview"
            onInitialized={(instance) => setCropper(instance)}
            initialAspectRatio={1}
            ready={() => {
              if (cropper) {
                cropper.setCropBoxData({
                  width: 150,
                  height: 150,
                  left: (cropper.getCanvasData().width - 150) / 2,
                  top: (cropper.getCanvasData().height - 150) / 2,
                });
              }
            }}
          />
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
