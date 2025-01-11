import React from "react";

const Sidebar = ({ activeSection, onChange }) => {
  const sections = ["General Settings", "Manage Account", "Manage APIs"];

  return (
    <div className="w-1/4 p-6">
      <div className="space-y-4">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => onChange(section)}
            className={`w-full min-w-0 truncate whitespace-normal text-center py-2 rounded-md ${
              activeSection === section ? "bg-primary text-white" : "hover:bg-surface dark:hover:bg-surface"
            }`}
          >
            {section}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;