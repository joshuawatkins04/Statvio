import React from "react";
import DefaultLayout from "../../layouts/DefaultLayout";

const Privacy = () => {
  return (
    <DefaultLayout>
      <div className="bg-surface p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4 text-primary">Privacy Policy</h1>
        <p className="mb-6 text-textSecondary">Last updated: January 14, 2025</p>
        <p className="mb-4">
          This Privacy Policy describes Our policies and procedures on the collection, use, and disclosure of
          Your information when You use the Service and tells You about Your privacy rights and how the law
          protects You.
        </p>
        <p className="mb-6">
          We use Your Personal data to provide and improve the Service. By using the Service, You agree to the
          collection and use of information in accordance with this Privacy Policy. This Privacy Policy has
          been created with the help of the
          <a
            href="https://www.privacypolicies.com/privacy-policy-generator/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primaryHover underline ml-1"
          >
            Privacy Policy Generator
          </a>
          .
        </p>
        <h2 className="text-2xl font-semibold mb-4 text-primary">Interpretation and Definitions</h2>
        <h3 className="text-xl font-medium mb-2">Interpretation</h3>
        <p className="mb-4">
          The words of which the initial letter is capitalized have meanings defined under the following
          conditions. The following definitions shall have the same meaning regardless of whether they appear
          in singular or in plural.
        </p>
        <h3 className="text-xl font-medium mb-2">Definitions</h3>
        <p className="mb-4">For the purposes of this Privacy Policy:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <p>
              <strong className="font-semibold">Account</strong> means a unique account created for You to
              access our Service or parts of our Service.
            </p>
          </li>
          <li>
            <p>
              <strong className="font-semibold">Affiliate</strong> means an entity that controls, is
              controlled by or is under common control with a party, where &quot;control&quot; means ownership
              of 50% or more of the shares, equity interest or other securities entitled to vote for election
              of directors or other managing authority.
            </p>
          </li>
          <li>
            <p>
              <strong className="font-semibold">Company</strong> (referred to as either &quot;the
              Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Agreement) refers to
              Statvio.
            </p>
          </li>
          <li>
            <p>
              <strong className="font-semibold">Cookies</strong> are small files that are placed on Your
              computer, mobile device or any other device by a website, containing the details of Your
              browsing history on that website among its many uses.
            </p>
          </li>
          <li>
            <p>
              <strong className="font-semibold">Country</strong> refers to: New South Wales, Australia.
            </p>
          </li>
          <li>
            <p>
              <strong className="font-semibold">Device</strong> means any device that can access the Service
              such as a computer, a cellphone or a digital tablet.
            </p>
          </li>
          <li>
            <p>
              <strong className="font-semibold">Personal Data</strong> is any information that relates to an
              identified or identifiable individual.
            </p>
          </li>
          <li>
            <p>
              <strong className="font-semibold">Service</strong> refers to the Website.
            </p>
          </li>
          <li>
            <p>
              <strong className="font-semibold">Service Provider</strong> means any natural or legal person
              who processes the data on behalf of the Company. It refers to third-party companies or
              individuals employed by the Company to facilitate the Service, to provide the Service on behalf
              of the Company, to perform services related to the Service or to assist the Company in analyzing
              how the Service is used.
            </p>
          </li>
          <li>
            <p>
              <strong className="font-semibold">Third-party Social Media Service</strong> refers to any
              website or any social network website through which a User can log in or create an account to
              use the Service.
            </p>
          </li>
          <li>
            <p>
              <strong className="font-semibold">Usage Data</strong> refers to data collected automatically,
              either generated by the use of the Service or from the Service infrastructure itself (for
              example, the duration of a page visit).
            </p>
          </li>
          <li>
            <p>
              <strong className="font-semibold">Website</strong> refers to Statvio, accessible from
              <a
                href="https://www.statvio.com"
                rel="external nofollow noopener"
                target="_blank"
                className="text-primary hover:text-primaryHover underline ml-1"
              >
                https://www.statvio.com
              </a>
              .
            </p>
          </li>
          <li>
            <p>
              <strong className="font-semibold">You</strong> means the individual accessing or using the
              Service, or the company, or other legal entity on behalf of which such individual is accessing
              or using the Service, as applicable.
            </p>
          </li>
        </ul>
        <h2 className="text-2xl font-semibold my-6 text-primary">Collecting and Using Your Personal Data</h2>
        <h3 className="text-xl font-medium mb-4">Types of Data Collected</h3>
        <h4 className="text-lg font-medium mb-2">Personal Data</h4>
        <p className="mb-4">
          While using Our Service, We may ask You to provide Us with certain personally identifiable
          information that can be used to contact or identify You. Personally identifiable information may
          include, but is not limited to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Email address</li>
          <li>First name and last name</li>
          <li>Usage Data</li>
        </ul>
        <h4 className="text-lg font-medium mt-6 mb-2">Usage Data</h4>
        <p className="mb-4">
          Usage Data is collected automatically when using the Service and may include details like IP
          address, browser type, time spent on pages, and diagnostic data.
        </p>

        <h3 className="text-xl font-medium my-6">Tracking Technologies and Cookies</h3>
        <p className="mb-4">
          We use cookies and similar tracking technologies to enhance your experience. You can learn more
          about our cookie usage by reviewing our Cookies Policy.
        </p>
        <a href="/cookies-policy" className="text-primary hover:text-primaryHover underline">
          Learn more about cookies
        </a>
        <p className="mt-4">
          For a full breakdown of data usage, third-party services, and your rights, please review the full
          policy on this page.
        </p>
      </div>
    </DefaultLayout>
  );
};

export default Privacy;
