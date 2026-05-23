import { Link } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { PageContainer } from "@/components/layout/PageContainer"
import { Footer } from "@/components/layout/Footer"

export function Privacy() {
  return (
    <div className="flex min-h-svh flex-col">
      <PageContainer title="Privacy Policy">
        <Card>
          <CardContent className="pt-6 space-y-6">
            <p className="text-muted-foreground text-sm">Last updated: January 14, 2025</p>

            <p>
              This Privacy Policy describes Our policies and procedures on the collection, use, and
              disclosure of Your information when You use the Service and tells You about Your privacy
              rights and how the law protects You.
            </p>

            <p>
              We use Your Personal data to provide and improve the Service. By using the Service, You
              agree to the collection and use of information in accordance with this Privacy Policy.
              This Privacy Policy has been created with the help of the{" "}
              <a
                href="https://www.privacypolicies.com/privacy-policy-generator/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Privacy Policy Generator
              </a>
              .
            </p>

            <h2 className="text-2xl font-semibold text-primary">Interpretation and Definitions</h2>

            <h3 className="text-xl font-medium">Interpretation</h3>
            <p>
              The words of which the initial letter is capitalized have meanings defined under the
              following conditions. The following definitions shall have the same meaning regardless
              of whether they appear in singular or in plural.
            </p>

            <h3 className="text-xl font-medium">Definitions</h3>
            <p>For the purposes of this Privacy Policy:</p>

            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong className="font-semibold">Account</strong> means a unique account created
                for You to access our Service or parts of our Service.
              </li>
              <li>
                <strong className="font-semibold">Affiliate</strong> means an entity that controls,
                is controlled by or is under common control with a party, where &quot;control&quot;
                means ownership of 50% or more of the shares, equity interest or other securities
                entitled to vote for election of directors or other managing authority.
              </li>
              <li>
                <strong className="font-semibold">Company</strong> (referred to as either &quot;the
                Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot; in this Agreement)
                refers to Statvio.
              </li>
              <li>
                <strong className="font-semibold">Cookies</strong> are small files that are placed
                on Your computer, mobile device or any other device by a website, containing the
                details of Your browsing history on that website among its many uses.
              </li>
              <li>
                <strong className="font-semibold">Country</strong> refers to: New South Wales,
                Australia.
              </li>
              <li>
                <strong className="font-semibold">Device</strong> means any device that can access
                the Service such as a computer, a cellphone or a digital tablet.
              </li>
              <li>
                <strong className="font-semibold">Personal Data</strong> is any information that
                relates to an identified or identifiable individual.
              </li>
              <li>
                <strong className="font-semibold">Service</strong> refers to the Website.
              </li>
              <li>
                <strong className="font-semibold">Service Provider</strong> means any natural or
                legal person who processes the data on behalf of the Company. It refers to
                third-party companies or individuals employed by the Company to facilitate the
                Service, to provide the Service on behalf of the Company, to perform services
                related to the Service or to assist the Company in analyzing how the Service is
                used.
              </li>
              <li>
                <strong className="font-semibold">Third-party Social Media Service</strong> refers
                to any website or any social network website through which a User can log in or
                create an account to use the Service.
              </li>
              <li>
                <strong className="font-semibold">Usage Data</strong> refers to data collected
                automatically, either generated by the use of the Service or from the Service
                infrastructure itself (for example, the duration of a page visit).
              </li>
              <li>
                <strong className="font-semibold">Website</strong> refers to Statvio, accessible
                from{" "}
                <a
                  href="https://www.statvio.com"
                  rel="external nofollow noopener"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  https://www.statvio.com
                </a>
                .
              </li>
              <li>
                <strong className="font-semibold">You</strong> means the individual accessing or
                using the Service, or the company, or other legal entity on behalf of which such
                individual is accessing or using the Service, as applicable.
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-primary">
              Collecting and Using Your Personal Data
            </h2>

            <h3 className="text-xl font-medium">Types of Data Collected</h3>

            <h4 className="text-lg font-medium">Personal Data</h4>
            <p>
              While using Our Service, We may ask You to provide Us with certain personally
              identifiable information that can be used to contact or identify You. Personally
              identifiable information may include, but is not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Usage Data</li>
            </ul>

            <h4 className="text-lg font-medium">Usage Data</h4>
            <p>
              Usage Data is collected automatically when using the Service and may include details
              like IP address, browser type, time spent on pages, and diagnostic data.
            </p>

            <h3 className="text-xl font-medium">Tracking Technologies and Cookies</h3>
            <p>
              We use cookies and similar tracking technologies to enhance your experience. You can
              learn more about our cookie usage by reviewing our Cookies Policy.
            </p>
            <Link to="/cookies-policy" className="text-primary hover:underline">
              Learn more about cookies
            </Link>
            <p>
              For a full breakdown of data usage, third-party services, and your rights, please
              review the full policy on this page.
            </p>
          </CardContent>
        </Card>
      </PageContainer>
      <Footer />
    </div>
  )
}

export default Privacy
