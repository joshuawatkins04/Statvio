# Statvio - ***www.statvio.com***

Statvio is a comprehensive analytics and user management platform that integrates seamlessly with Spotify, AWS, AI technologies, and PayPal, with plans to support additional APIs in the future. It offers powerful features, including user authentication, profile customization, real-time data fetching, and dynamic UI customization with light and dark mode support. Built with security and scalability in mind, Statvio leverages AWS services for efficient backend management and secure data storage.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

### Spotify Integration
- **Linking/Unlinking Accounts:** Easily connect or disconnect your Spotify account.
- **Fetching API Data:** Retrieve user-specific data such as playlists, recently played tracks, and more.
- **Presenting API Data:** Intuitive dashboards to visualize and interact with your Spotify data.

### User Management
- **Authentication:** Secure login and logout functionalities using JWT.
- **Profile Customisation:** Upload and crop profile images with AWS S3 storage integration.
- **Role-Based Access:** Manage user roles with default settings for enhanced security.

### AI Integration
- **Enhanced Analytics:** Utilize AI to provide deeper insights and personalized recommendations.
- **User Experience:** Improve interactions with intelligent features tailored to user behavior.

### AWS Integration
- **S3 Bucket Storage:** Efficiently store and manage profile images using Amazon S3.
- **EC2 Backend Management:** Host and scale the backend server seamlessly with Amazon EC2.

### PayPal Integration
- **Payment Processing:** (Partially Implemented) Begin accepting payments with integrated PayPal support.

### UI Customisation
- **Light and Dark Modes:** Toggle between light and dark themes to suit your preference.
- **Responsive Design:** Ensure a consistent experience across all devices.

### Security Measures
- **Frontend Security:** Implement best practices to protect against common vulnerabilities.
- **Backend Security:** Secure API endpoints and data storage with robust authentication and authorization mechanisms.


## Installation

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MongoDB** instance
- **AWS Account** with S3 and EC2 services configured
- **PayPal Developer Account** (for payment integration)

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/joshuawatkins04/Statvio.git
   cd Statvio/
2. **Install Dependencies**

   In frontend and backend do:
   npm install

3. **Configure Environment Variables**

   In frontend, create a .env file with the information:

   ```
   MODE=development
   VITE_SPOTIFY_DASHBOARD=http://localhost:5173/dashboard/music/spotify
   VITE_AUTH_URL=http://localhost:5000/api/auth
   VITE_SPOTIFY_BASE_URL=http://localhost:5000/api/music/spotify
   VITE_SPOTIFY_AUTH_URL=http://localhost:5000/api/music/spotify/auth/spotify
   VITE_APPLE_MUSIC_AUTH_URL=http://localhost:5000/api/music/apple/auth
   VITE_PAYPAL_BASE_URL=http://localhost:5000/api/paypal
   VITE_PAYPAL_COMPLETE_ORDER_URL=http://localhost:5000/api/paypal/complete-order?token
   VITE_AWS_UPLOAD_URL=http://localhost:5000/api/aws/upload
   ```

   In backend, create a .env file with the information:

   ```
   NODE_ENV=development
   Base urls
   BASE_URL=https://www.statvio.com
   FRONTEND_SPOTIFY_URL=http://localhost:5173/dashboard/music/spotify
   FRONTEND_PAYPAL_CANCEL_URL=https://www.statvio.com/cancel-order
   Database config
   MONGO_URI=
   AWS config
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   AWS_REGION=
   S3_BUCKET_NAME=
   OpenAI config
   OPENAI_API_KEY=
   OPENAI_API_URL=https://api.openai.com/v1/chat/completions
   Spotify config
   SPOTIFY_CLIENT_ID=
   SPOTIFY_CLIENT_SECRET=
   SPOTIFY_REDIRECT_URI=http://localhost:5000/api/music/spotify/callback
   SPOTIFY_AUTH_URL=https://accounts.spotify.com
   SPOTIFY_API_URL=https://api.spotify.com/v1
   Paypal config
   PAYPAL_CLIENT_ID=
   PAYPAL_CLIENT_SECRET=
   PAYPAL_API_URL=https://api-m.sandbox.paypal.com
   Server config
   PORT=5000
   JWT config
   JWT_SECRET=
   ```

4. **Start the Development Server**

   In the directory Statvio/frontend/src do:

   ```
   npm run dev
   ```

5. **Access the Application**

   Open your browser and navigate to http://localhost:5000.

## Usage

1. **Register an Account**

- Sign up with your email and password.
- Verify your email address if email verification is enabled.
   
2. **Login**

- Authenticate using your credentials to access the dashboard.

3. **Connect Spotify**

- Navigate to the Spotify integration section.
- Link your Spotify account to fetch and display your data.

4. **Customize Profile**

- Upload and crop your profile image.
- Toggle between light and dark modes for UI preference.

5. **Explore AI Features**

- Utilize AI-driven analytics for deeper insights into your data.

6. **Payment Integration**

- (Coming Soon) Set up PayPal for processing payments.

## Technologies Used

   **Frontend:**
   - React
   - Vite
   - Tailwind CSS

   **Backend:**
   - Node.js
   - Express.js
   - MongoDB

   **Integrations:**
   - Spotify API
   - PayPal API
   - AWS S3 & EC2
   - AI Services (OpenAI)

   **Others:**
   - Git & GitHub for version control
   - Docker (will be implemented)

## Contributing

Contributions are welcome! Please follow these steps to contribute to Statvio:

1. **Fork the Repository**

2. **Create a New Branch**

   ```
   git checkout -b feature/YourFeatureName
   ```

3. **Commit Your Changes**

   ```
   git commit -m "Add some feature"
   ```

4. **Push to the Branch**

   ```
   git push origin feature/YourFeatureName
   ```

5. **Open a Pull Request**

   Describe your changes and submit the pull request for review.

## License
This project is licensed under the MIT License.

## Contact
   - **Joshua Watkins**
   - **Email:** joshua@watkinsfamily.com.au
   - **[GitHub](https://github.com/joshuawatkins04)**
   - **[LinkedIn](https://www.linkedin.com/in/joshuawatkins04)**


*Thank you for using Statvio! If you have any questions or need support, feel free to reach out.*


