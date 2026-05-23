import { useState } from "react";
import { updatePassword } from "./userAuth";
import { validatePassword } from "../../utils/validation";

const usePasswordForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [criteria, setCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialCharacters: false,
    matchesConfirm: false,
  });
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [isFocused, setFocus] = useState(false);

  const handleNewPasswordChange = (e) => {
    const newPass = e.target.value;
    setNewPassword(newPass);
    validatePasswords(newPass, confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPass = e.target.value;
    setConfirmPassword(confirmPass);
    validatePasswords(newPassword, confirmPass);
  };

  const validatePasswords = (password, confirmPassword) => {
    const validation = validatePassword(password, confirmPassword);
    setCriteria(validation);

    const allValid =
      validation.length &&
      validation.uppercase &&
      validation.lowercase &&
      validation.number &&
      validation.specialCharacters &&
      validation.matchesConfirm;

    setIsButtonEnabled(allValid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isButtonEnabled) return;

    try {
      const response = await updatePassword(newPassword, confirmPassword);
      setMessage(response.message || "Password updated successfully!");
      resetForm();
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update password.");
    }
  };

  const handleCancel = () => {
    resetForm();
    setMessage("");
  };

  const resetForm = () => {
    setNewPassword("");
    setConfirmPassword("");
    setCriteria({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      specialCharacters: false,
      matchesConfirm: false,
    });
    setFocus(false);
  };

  return {
    newPassword,
    confirmPassword,
    criteria,
    isButtonEnabled,
    message,
    isFocused,
    handleNewPasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
    handleCancel,
    setFocus,
  };
};

export default usePasswordForm;
