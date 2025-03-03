import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(import.meta.env.VITE_RESEND_KEY);

/**
 * Verify Resend domain setup
 * @returns {Promise<{isVerified: boolean, domains: Array<{name: string, status: string}>, message: string}>}
 */
export async function verifyResendDomains() {
  try {
    const response = await resend.domains.list();
    console.log(resend.apiKeys.list());
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      return {
        isVerified: false,
        domains: [],
        message: 'No domains configured in Resend'
      };
    }
    
    // Check if at least one domain is verified
    const verifiedDomains = response.data.filter(domain => 
      domain.status === 'verified' || domain.status === 'active');
    
    const domainInfo = response.data.map(domain => ({
      name: domain.name,
      status: domain.status
    }));
    
    if (verifiedDomains.length === 0) {
      return {
        isVerified: false,
        domains: domainInfo,
        message: 'No verified domains found. Please verify a domain in Resend dashboard.'
      };
    }
    
    return {
      isVerified: true,
      domains: domainInfo,
      message: `Verified domains: ${verifiedDomains.map(d => d.name).join(', ')}`
    };
  } catch (error) {
    console.error('Error verifying Resend domain setup:', error);
    return {
      isVerified: false,
      domains: [],
      message: `Error verifying domains: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
