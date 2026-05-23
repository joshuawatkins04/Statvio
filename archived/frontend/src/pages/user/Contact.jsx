import React, { useState } from "react";

const Contact = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState(""); // Optional Username
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_MESSAGE_LENGTH = 500;

  const handleSend = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    try {
      // ADD SEND LOGIC
      setStatusMessage("Your message has been sent successfully!");
      setName("");
      setUsername("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (error) {
      setStatusMessage("There was an error sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-backdrop min-h-screen flex flex-col justify-center items-center transition-colors duration-300 pt-28 pr-3 pl-3 pb-3">
      {/* Card Container */}
      <div className="bg-surface p-8 shadow-md rounded-xl w-full max-w-4xl transition-colors duration-300">
        <h1 className="text-textPrimary dark:text-white text-2xl font-bold mb-6 text-center">Contact Us</h1>
        {statusMessage && (
          <div
            className={`mb-4 p-3 text-center rounded-xl ${
              statusMessage.includes("successfully")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
            aria-live="polite"
          >
            {statusMessage}
          </div>
        )}
        <form onSubmit={handleSend} className="flex flex-col space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-onSurface mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              className="bg-white dark:bg-surface2 text-onSurface w-full px-4 py-2 border border-outline rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              maxLength={60}
              required
            />
          </div>

          {/* Username Field (Optional) */}
          <div>
            <label htmlFor="username" className="block text-onSurface mb-1">
              Username (Optional)
            </label>
            <input
              type="text"
              id="username"
              className="bg-white dark:bg-surface2 text-onSurface w-full px-4 py-2 border border-outline rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your Username"
              maxLength={20}
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-onSurface mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              className="bg-white dark:bg-surface2 text-textPrimary w-full px-4 py-2 border border-outline rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              maxLength={45}
              required
            />
          </div>

          {/* Phone Number Field */}
          <div>
            <label htmlFor="phone" className="block text-onSurface mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phone"
              className="bg-white dark:bg-surface2 text-onSurface w-full px-4 py-2 border border-outline rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="123-456-7890"
              maxLength={14}
            />
          </div>

          {/* Message Field */}
          <div className="relative">
            <label htmlFor="message" className="block text-onSurface mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              className="bg-white dark:bg-surface2 text-onSurface w-full px-4 py-2 border border-outline rounded-md focus:outline-none focus:ring-2 focus:ring-primary overflow-auto"
              value={message}
              onChange={(e) => {
                if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                  setMessage(e.target.value);
                }
              }}
              placeholder="Your message here..."
              rows="5"
              required
              maxLength={MAX_MESSAGE_LENGTH}
              style={{
                resize: "vertical",
                maxHeight: "300px",
                minHeight: "100px",
              }}
            ></textarea>
            <div className="absolute bottom-2 right-4 text-sm text-onSurface">
              {MAX_MESSAGE_LENGTH - message.length} characters remaining
            </div>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            className={`mt-4 border border-outline text-textSecondary hover:text-white hover:border-surface font-semibold py-2 rounded-md hover:bg-primary transition ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
