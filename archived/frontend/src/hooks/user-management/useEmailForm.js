import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { validateEmail } from "../../utils/validation";
import { updateEmail } from "./userAuth";

const useEmailForm = () => {
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [criteria, setCriteria] = useState({
    original: user?.email || "Email not available",
    length: false,
    hasAtSymbol: false,
    hasDomain: false,
    hasValidTLD: false,
    noSpaces: false,
    validCharacters: false,
  });
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [isFocused, setFocus] = useState(false);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      setCriteria((prev) => ({ ...prev, original: user.email }));
    }
  }, [user]);

  const handleChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    const validation = validateEmail(newEmail);
    setCriteria((prev) => ({ ...prev, ...validation }));
    setIsButtonEnabled(Object.values(validation).every((val) => val) && newEmail !== user?.email);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isButtonEnabled) return;

    try {
      const response = await updateEmail(email);
      setMessage(response.message || "Email updated successfully!");
      setCriteria((prev) => ({ ...prev, original: email }));
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update email.");
    }
  };

  const handleCancel = () => {
    resetForm();
    setMessage("");
  };

  const resetForm = () => {
    setEmail("");
    setCriteria({
      original: user?.email || "Email not available",
      length: false,
      hasAtSymbol: false,
      hasDomain: false,
      hasValidTLD: false,
      noSpaces: false,
      validCharacters: false,
    });
    setFocus(false);
  };

  return {
    email,
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

export default useEmailForm;
