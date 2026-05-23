import React from "react";
import UsernameForm from "../forms/UsernameForm";
import EmailForm from "../forms/EmailForm";
import PasswordForm from "../forms/PasswordForm";

const ManageAccount = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-4">Manage Account</h2>
    <p className="mb-10">Here you can update your account information and preferences.</p>
    <div className="space-y-10">
      <UsernameForm />
      <EmailForm />
      <PasswordForm />
    </div>
  </div>
);

export default ManageAccount;
