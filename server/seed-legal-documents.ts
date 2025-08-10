import { storage } from "./storage";

const defaultLegalDocuments = [
  {
    type: 'terms',
    title: 'Terms of Service',
    version: '1.0',
    content: `
      <div class="space-y-6">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold mb-2">Terms of Service</h1>
          <p class="text-gray-600">Effective Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <section>
          <h2 class="text-xl font-semibold mb-3">1. Agreement to Terms</h2>
          <p class="mb-4">By accessing and using FokusHub360, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">2. Description of Service</h2>
          <p class="mb-4">FokusHub360 is a virtual focus group platform that connects market researchers with participants to gather insights and feedback on products, services, and concepts.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">3. User Responsibilities</h2>
          <ul class="list-disc ml-6 space-y-2">
            <li>Provide accurate and truthful information</li>
            <li>Maintain the confidentiality of shared materials</li>
            <li>Participate in good faith and provide honest feedback</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">4. Intellectual Property</h2>
          <p class="mb-4">All content, materials, and intellectual property on FokusHub360 remain the property of their respective owners. Users may not reproduce, distribute, or create derivative works without permission.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">5. Payment and Compensation</h2>
          <p class="mb-4">Participants may receive compensation for their participation in focus groups. Payment terms and amounts will be specified for each individual campaign.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">6. Termination</h2>
          <p class="mb-4">Either party may terminate this agreement at any time. FokusHub360 reserves the right to suspend or terminate accounts for violations of these terms.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
          <p class="mb-4">FokusHub360 shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">8. Governing Law</h2>
          <p class="mb-4">These terms are governed by the laws of the jurisdiction in which FokusHub360 operates.</p>
        </section>
      </div>
    `,
    isActive: true,
    effectiveDate: new Date(),
    createdBy: 1,
    lastModifiedBy: 1
  },
  {
    type: 'privacy',
    title: 'Privacy Policy',
    version: '1.0',
    content: `
      <div class="space-y-6">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold mb-2">Privacy Policy</h1>
          <p class="text-gray-600">Effective Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <section>
          <h2 class="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <div class="space-y-3">
            <div>
              <h3 class="font-medium">Personal Information</h3>
              <p class="text-sm text-gray-600">Name, email address, phone number, demographic information</p>
            </div>
            <div>
              <h3 class="font-medium">Usage Information</h3>
              <p class="text-sm text-gray-600">How you interact with our platform, campaign responses, feedback</p>
            </div>
            <div>
              <h3 class="font-medium">Technical Information</h3>
              <p class="text-sm text-gray-600">IP address, browser type, device information, cookies</p>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
          <ul class="list-disc ml-6 space-y-2">
            <li>Provide and improve our services</li>
            <li>Match you with relevant focus groups</li>
            <li>Communicate with you about campaigns and updates</li>
            <li>Process payments and manage your account</li>
            <li>Ensure security and prevent fraud</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">3. Information Sharing</h2>
          <p class="mb-4">We do not sell your personal information. We may share your information with:</p>
          <ul class="list-disc ml-6 space-y-2">
            <li>Clients conducting focus groups (in aggregated, anonymized form)</li>
            <li>Service providers who help us operate our platform</li>
            <li>Law enforcement when required by law</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">4. Data Security</h2>
          <p class="mb-4">We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">5. Your Rights</h2>
          <p class="mb-4">Under GDPR and other privacy laws, you have the right to:</p>
          <ul class="list-disc ml-6 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your data</li>
            <li>Restrict processing</li>
            <li>Data portability</li>
            <li>Object to processing</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">6. Cookies and Tracking</h2>
          <p class="mb-4">We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can manage your cookie preferences in your browser settings.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">7. Contact Information</h2>
          <p class="mb-4">For privacy-related questions or to exercise your rights, contact us at:</p>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p><strong>Email:</strong> privacy@fokushub360.com</p>
            <p><strong>Data Protection Officer:</strong> dpo@fokushub360.com</p>
          </div>
        </section>
      </div>
    `,
    isActive: true,
    effectiveDate: new Date(),
    createdBy: 1,
    lastModifiedBy: 1
  },
  {
    type: 'gdpr_rights',
    title: 'Your Data Rights',
    version: '1.0',
    content: `
      <div class="space-y-6">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold mb-2">Your Data Rights</h1>
          <p class="text-gray-600">Under GDPR and Privacy Laws</p>
        </div>

        <section>
          <h2 class="text-xl font-semibold mb-3">Right to Access</h2>
          <p class="mb-4">You can request a copy of all personal data we hold about you. This includes your profile information, campaign responses, and any other data we've collected.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">Right to Rectification</h2>
          <p class="mb-4">You can ask us to correct any inaccurate or incomplete personal data. We'll update your information promptly once verified.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">Right to Erasure</h2>
          <p class="mb-4">Also known as the "right to be forgotten," you can request that we delete your personal data under certain circumstances.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">Right to Restrict Processing</h2>
          <p class="mb-4">You can ask us to limit how we process your personal data while we address any concerns you may have.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">Right to Data Portability</h2>
          <p class="mb-4">You can request your data in a structured, machine-readable format to transfer to another service provider.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">Right to Object</h2>
          <p class="mb-4">You can object to processing of your personal data based on legitimate interests, direct marketing, or research purposes.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold mb-3">How to Exercise Your Rights</h2>
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="mb-2">To exercise any of these rights, please contact us at:</p>
            <p><strong>Email:</strong> privacy@fokushub360.com</p>
            <p><strong>Data Protection Officer:</strong> dpo@fokushub360.com</p>
            <p class="mt-2 text-sm text-gray-600">We'll respond to your request within 30 days as required by law.</p>
          </div>
        </section>
      </div>
    `,
    isActive: true,
    effectiveDate: new Date(),
    createdBy: 1,
    lastModifiedBy: 1
  }
];

export async function seedLegalDocuments() {
  try {
    console.log('Seeding legal documents...');
    
    // Check if documents already exist
    const existingDocs = await storage.getLegalDocuments();
    
    if (existingDocs.length > 0) {
      console.log('Legal documents already exist, skipping seed');
      return { success: true, message: 'Legal documents already exist' };
    }

    // Create each document
    const createdDocs = [];
    for (const doc of defaultLegalDocuments) {
      const created = await storage.createLegalDocument(doc);
      createdDocs.push(created);
    }

    console.log(`Successfully seeded ${createdDocs.length} legal documents`);
    return { 
      success: true, 
      message: `Successfully seeded ${createdDocs.length} legal documents`,
      documents: createdDocs 
    };
  } catch (error) {
    console.error('Error seeding legal documents:', error);
    return { 
      success: false, 
      message: 'Failed to seed legal documents',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// If this script is run directly
if (require.main === module) {
  seedLegalDocuments().then(result => {
    console.log(result);
    process.exit(result.success ? 0 : 1);
  });
}