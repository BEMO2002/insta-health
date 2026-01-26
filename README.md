# Insta Health

**Insta Health** is a next-generation comprehensive healthcare platform designed to bridge the gap between patients and medical services. It integrates a wide array of medical solutions—from home nursing and doctor visits to medical tourism and pharmaceutical e-commerce—into a single, seamless digital ecosystem.

## 🚀 Key Features

- **Integrated Medical Booking**: Streamlined appointment scheduling for home visits (doctors, nursing), lab tests, and radiology centers.
- **Medical Tourism**: A dedicated module for browsing and booking medical tourism packages, featuring curated destinations and specialized treatment centers.
- **E-Commerce Pharmacy**: A full-featured online store for medical products and supplies, equipped with a secure shopping cart and electronic payment gateway.
- **Electronic Medical Records (EMR)**: Secure, centralized management of patient history, prescriptions, and test results, accessible anytime.
- **Family Care Management**: Unified management of family health profiles, subscriptions, and "Family Card" benefits.
- **Digital Prescriptions**: Advanced system for uploading, tracking, and fulfilling digital medical prescriptions.
- **Provider Ecosystem**: Specialized portals for healthcare providers and medical suppliers to manage their services and offerings.

## 🛠️ Technology Stack

Built with a modern, high-performance frontend architecture ensuring scalability and a superior user experience.

- **Core Framework**: [React 19](https://react.dev/)
- **Build Engine**: [Vite](https://vitejs.dev/) for lightning-fast development and optimized production builds.
- **Styling System**:
  - [Tailwind CSS v4](https://tailwindcss.com/) for utility-first design.
  - [Styled Components](https://styled-components.com/) for component-level encapsulation.
- **Routing**: [React Router v7](https://reactrouter.com/) for dynamic client-side routing.
- **State Management**: React Context API.
- **Networking**: [Axios](https://axios-http.com/) for robust API integration.
- **UI & Interactions**:
  - `framer-motion`: For fluid, production-grade animations.
  - `swiper`: For responsive touch sliders.
  - `react-hot-toast` / `react-toastify`: For elegant feedback notifications.
  - `react-icons`: Comprehensive icon library.

## 💻 Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

- **Node.js**: Version 18.0.0 or higher.
- **npm**: Installed automatically with Node.js.

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/BEMO2002/insta-health.git
    cd inst-health
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

### Development Scripts

- **Start Development Server**

  ```bash
  npm run dev
  ```

  Starts the Vite dev server with Hot Module Replacement (HMR).

- **Production Build**

  ```bash
  npm run build
  ```

  Generates an optimized production build in the `dist` directory.

- **Preview Production Build**

  ```bash
  npm run preview
  ```

  Locally preview the production build to verify the output.

- **Linting**
  ```bash
  npm run lint
  ```
  Run ESLint to check for code quality issues.

## 📂 Project Structure

A high-level overview of the codebase organization:

```text
src/
├── api/                # API configuration and Axios interceptors
├── assets/             # Static assets (images, icons, global styles)
├── Authinction/        # Authentication modules (Login, Signup, Recovery)
├── Components/         # Shared UI components (Layout, Loaders, Modals)
├── Context/            # Global state (AuthContext, CartContext)
├── HomePage/           # Landing page components and logic
├── ProductsPage/       # E-commerce product listing and details
├── CartPage.jsx/       # Shopping cart and checkout logic
├── MedicalTourism/     # Medical tourism packages and details
├── MediaclFiles/       # EMR and file management
├── ServicesProviders/  # Provider search and listing
└── ...
```

## 🤝 Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an [Issue](https://github.com/BEMO2002/insta-health/issues) or submit a [Pull Request](https://github.com/BEMO2002/insta-health/pulls).

---

&copy; 2025 Insta Health. All Rights Reserved.
