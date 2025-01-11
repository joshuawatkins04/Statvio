import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { validateUsername } from "../../utils/validation";
import { updateUsername } from "./userAuth";

const useUsernameForm = () => {
  const { user } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [criteria, setCriteria] = useState({
    length: false,
    validCharacters: false,
    noSpaces: false,
  });
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [isFocused, setFocus] = useState(false);

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
      setCriteria((prev) => ({ ...prev, original: user.username }));
    }
  }, [user]);

  const handleChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    const validation = validateUsername(newUsername);
    setCriteria((prev) => ({ ...prev, ...validation }));
    setIsButtonEnabled(
      validation.length && validation.validCharacters && validation.noSpaces && newUsername !== user?.username
    );
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isButtonEnabled) return;
    try {
      const response = await updateUsername(username);
      setMessage(response.message || "Username updated successfully!");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update username.");
    }
  };

  const handleCancel = () => {
    resetForm();
    setMessage("");
  };

  const resetForm = () => {
    setUsername("");
    setCriteria((prev) => ({ ...prev, length: true, validCharacters: true, noSpaces: true }));
    setFocus(false);
  };

  return {
    username,
    criteria,
    isButtonEnabled,
    message,
    isFocused,
    handleChange,
    handleSubmit,
    handleCancel,
    setFocus,
  };
};

export default useUsernameForm;
