// Example usage of updated PolicyPage component

// For Terms and Conditions page
// src/app/terms-and-conditions/page.jsx
import PolicyPage from "@/components/docs/PolicyPage";

export default function TermsAndConditionsPage() {
  return (
    <PolicyPage 
      documentType="terms_and_conditions"
      title="Terms and Conditions"
      mobileMode={false}
    />
  );
}

// For Privacy Policy page  
// src/app/privacy-policy/page.jsx
import PolicyPage from "@/components/docs/PolicyPage";

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage 
      documentType="privacy_policy"
      title="Privacy Policy"
      mobileMode={false}
    />
  );
}

// For Cancellation Policy page
// src/app/cancellation-policy/page.jsx
import PolicyPage from "@/components/docs/PolicyPage";

export default function CancellationPolicyPage() {
  return (
    <PolicyPage 
      documentType="cancellation_policy"
      title="Cancellation Policy"
      mobileMode={false}
    />
  );
}

// For mobile app usage (if needed)
// components/mobile/MobilePolicyPage.jsx
import PolicyPage from "@/components/docs/PolicyPage";

export default function MobilePolicyPage({ documentType, title }) {
  return (
    <PolicyPage 
      documentType={documentType}
      title={title}
      mobileMode={true}
    />
  );
}