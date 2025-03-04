import { useState, useEffect, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Interfaces
interface ResendDomain {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  region: string;
}

interface ResendApiKey {
  id: string;
  name: string;
  created_at: string;
}

interface DomainResult {
  isVerified: boolean;
  domains: Array<{name: string; status: string}>;
  message: string;
}

interface ApiKeyResult {
  keys: ResendApiKey[];
  message: string;
}

// Enhanced Resend API interaction hooks with cooldown
function useVerifyResendDomains() {
  const listDomains = useAction(api.resend.listDomains);
  
  // Use local state to track cooldown
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const COOLDOWN_MS = 1000; // 1 second cooldown between requests
  
  const verifyDomains = useCallback(async (forceRefresh = false): Promise<DomainResult> => {
    try {
      // Implement cooldown to prevent frequent calls
      const now = Date.now();
      if (!forceRefresh && now - lastFetchTime < COOLDOWN_MS) {
        return {
          isVerified: false,
          domains: [],
          message: `Please wait ${Math.ceil((COOLDOWN_MS - (now - lastFetchTime)) / 1000)}s before trying again.`
        };
      }
      
      setLastFetchTime(now);
      
      // Call the API through Convex with optional force refresh
      const response = await listDomains({ forceRefresh });
      
      // Validate response structure
      if (response === null || response === undefined) {
        return {
          isVerified: false,
          domains: [],
          message: 'No response received from Resend API. Check your API key configuration.'
        };
      }
      
      // Check for error response format
      if ('error' in response || 'message' in response) {
        const errorMsg = 'error' in response 
          ? String(response.error)
          : 'message' in response ? String(response.message) : 'Unknown error';
        
        return {
          isVerified: false,
          domains: [],
          message: `Resend API error: ${errorMsg}`
        };
      }
      
      // Handle the correct response format from Resend API which returns an object with a data property
      // containing the array of domains
      let domains: ResendDomain[] = [];
      if (typeof response === 'object' && response !== null) {
        if ('data' in response && Array.isArray(response.data)) {
          domains = response.data.map(domain => ({
            id: domain.id,
            name: domain.name,
            status: domain.status,
            createdAt: domain.created_at || new Date().toISOString(),
            region: domain.region || 'unknown'
          }));
        } else if (Array.isArray(response)) {
          domains = response; // Fallback for the original array expectation
        }
      }
      
      if (domains.length === 0) {
        return {
          isVerified: false,
          domains: [],
          message: 'No domains configured in Resend. Please add a domain in the Resend dashboard.'
        };
      }
      
      // Check if at least one domain is verified
      const verifiedDomains = domains.filter(domain => 
        domain.status === 'verified' || domain.status === 'active');
      
      const domainInfo = domains.map(domain => ({
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
      
      // Handle rate limit errors specially
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('Too many requests') || error.message.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded. Please try again in a few seconds.';
        } else if (error.message.includes('Unauthorized') || error.message.includes('401')) {
          errorMessage = 'Authentication failed. Invalid API key or credentials.';
        } else if (error.message.includes('ECONNREFUSED') || error.message.includes('Network')) {
          errorMessage = 'Network connection error. Server unable to reach Resend API.';
        } else {
          errorMessage = error.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      
      return {
        isVerified: false,
        domains: [],
        message: `Error: ${errorMessage}`
      };
    }
  }, [listDomains, lastFetchTime]);

  return verifyDomains;
}

function useListResendApiKeys() {
  const listApiKeys = useAction(api.resend.listApiKeys);
  // Use local state to track cooldown
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const COOLDOWN_MS = 5000; // 5 seconds cooldown between requests
  
  const getApiKeys = useCallback(async (forceRefresh = false): Promise<ApiKeyResult> => {
    try {
      // Implement cooldown to prevent frequent calls
      const now = Date.now();
      if (!forceRefresh && now - lastFetchTime < COOLDOWN_MS) {
        return {
          keys: [],
          message: `Please wait ${Math.ceil((COOLDOWN_MS - (now - lastFetchTime)) / 1000)}s before trying again.`
        };
      }
      
      setLastFetchTime(now);
      
      // Call the API through Convex with optional force refresh
      const response = await listApiKeys({ forceRefresh });
      
      // Validate response structure
      if (response === null || response === undefined) {
        return {
          keys: [],
          message: 'No response received from Resend API. Check your API key configuration.'
        };
      }
      
      // Check for error response
      if ('error' in response || 'message' in response) {
        const errorMsg = 'error' in response 
          ? String(response.error)
          : 'message' in response ? String(response.message) : 'Unknown error';
        
        return {
          keys: [],
          message: `Resend API error: ${errorMsg}`
        };
      }
      
      // Handle the correct response format from Resend API which returns an object with a data property
      // containing the array of API keys
      if (typeof response === 'object' && response !== null && 'data' in response && Array.isArray(response.data)) {
        const apiKeysData = response.data;
        const keys: ResendApiKey[] = apiKeysData.map(key => ({
          id: key.id || 'unknown',
          name: key.name || 'unnamed',
          created_at: key.created_at || new Date().toISOString()
        }));
        
        return {
          keys,
          message: keys.length > 0 
            ? `Found ${keys.length} API key(s)` 
            : 'No API keys found in your Resend account'
        };
      } else {
        return {
          keys: [],
          message: `Invalid response format from Resend API: ${typeof response}. Expected object with data array.`
        };
      }
    } catch (error) {
      console.error('Error fetching Resend API keys:', error);
      
      // Handle rate limit errors specially
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('Too many requests') || error.message.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded. Please try again in a few seconds.';
        } else if (error.message.includes('Unauthorized') || error.message.includes('401')) {
          errorMessage = 'Authentication failed. Invalid API key or credentials.';
        } else if (error.message.includes('ECONNREFUSED') || error.message.includes('Network')) {
          errorMessage = 'Network connection error. Server unable to reach Resend API.';
        } else {
          errorMessage = error.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      
      return {
        keys: [],
        message: `Error: ${errorMessage}`
      };
    }
  }, [listApiKeys, lastFetchTime]);

  return getApiKeys;
}

// Use Convex to check API connectivity with debouncing
function useCheckResendApiStatus() {
  const checkApiStatus = useAction(api.resend.checkApiStatus);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);
  const COOLDOWN_MS = 10000; // 10 seconds cooldown for status checks
  
  const getApiStatus = useCallback(async (): Promise<boolean> => {
    try {
      // Implement cooldown
      const now = Date.now();
      if (now - lastCheckTime < COOLDOWN_MS) {
        console.log("API status check on cooldown");
        return false;
      }
      
      setLastCheckTime(now);
      const result = await checkApiStatus();
      return result === true;
    } catch (error) {
      console.error("API status check failed:", error);
      return false;
    }
  }, [checkApiStatus, lastCheckTime]);
  
  return getApiStatus;
}

// Main component
export default function ResendComponent() {
  const [activeTab, setActiveTab] = useState<'domains' | 'apikeys'>('domains');
  const [verificationResult, setVerificationResult] = useState<DomainResult | null>(null);
  const [apiKeysResult, setApiKeysResult] = useState<ApiKeyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'checking' | 'connected' | 'failed'>('idle');
  const verifyResendDomains = useVerifyResendDomains();
  const listResendApiKeys = useListResendApiKeys();
  const checkResendApiStatus = useCheckResendApiStatus();
  
  // Check API connectivity only once on component mount
  useEffect(() => {
    const checkApiConnection = async () => {
      // Only check if we haven't checked recently
      if (apiStatus === 'idle') {
        setApiStatus('checking');
        try {
          const isConnected = await checkResendApiStatus();
          setApiStatus(isConnected ? 'connected' : 'failed');
        } catch (error) {
          console.error('Resend API connectivity check failed:', error);
          setApiStatus('failed');
        }
      }
    };
    
    checkApiConnection();
    // Only run once on mount
  }, []);
  
  const handleVerifyClick = async () => {
    // Simple approach without debouncing - just check if already loading
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await verifyResendDomains(false);
      setVerificationResult(result);
    } catch (error) {
      console.error("Verification failed:", error);
      setVerificationResult({
        isVerified: false,
        domains: [],
        message: `Verification error: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleListApiKeys = async () => {
    // Simple approach without debouncing - just check if already loading
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await listResendApiKeys(false);
      setApiKeysResult(result);
    } catch (error) {
      console.error("API keys fetch failed:", error);
      setApiKeysResult({
        keys: [],
        message: `API keys error: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="mt-4 border rounded-lg p-4 bg-white shadow">
      <h3 className="text-xl font-semibold mb-4">Resend Configuration</h3>
      
      {/* API Status Indicator */}
      <div className={`mb-4 p-2 rounded ${
        apiStatus === 'connected' ? 'bg-green-100 text-green-800' : 
        apiStatus === 'failed' ? 'bg-red-100 text-red-800' : 
        'bg-yellow-100 text-yellow-800'
      }`}>
        <span className="font-medium">API Status: </span>
        {apiStatus === 'connected' && '✅ Connected to Resend API'}
        {apiStatus === 'failed' && '❌ Unable to reach Resend API. Check your server configuration or Resend service status.'}
        {apiStatus === 'checking' && '⏳ Checking connection...'}
        {apiStatus === 'idle' && '⏳ Waiting to check connection...'}
      </div>
      
      {/* Rate Limit Warning */}
      <div className="mb-4 p-2 rounded bg-yellow-50 text-yellow-800 text-sm">
        <p><strong>Note:</strong> Resend API has a rate limit of 2 requests per second. Excessive requests may be blocked.</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        <button 
          onClick={() => setActiveTab('domains')}
          className={`px-4 py-2 ${activeTab === 'domains' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          Domains
        </button>
        <button 
          onClick={() => setActiveTab('apikeys')}
          className={`px-4 py-2 ${activeTab === 'apikeys' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          API Keys
        </button>
      </div>
      
      {/* Domains Tab */}
      {activeTab === 'domains' && (
        <div>
          <button 
            onClick={handleVerifyClick}
            disabled={isLoading || apiStatus === 'failed'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Verifying...' : 'Verify Resend Domains'}
          </button>
          
          {verificationResult && (
            <div className={`mt-3 p-3 rounded ${verificationResult.isVerified ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-semibold">{verificationResult.isVerified ? '✅ Verified' : '❌ Not Verified'}</p>
              <p>{verificationResult.message}</p>
              {verificationResult.domains.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Domains:</p>
                  <ul className="list-disc pl-5">
                    {verificationResult.domains.map((domain, idx) => (
                      <li key={idx}>
                        {domain.name} - <span className={domain.status === 'verified' || domain.status === 'active' ? 'text-green-600' : 'text-orange-500'}>
                          {domain.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Troubleshooting tips when verification fails */}
              {!verificationResult.isVerified && (
                <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="font-semibold text-blue-800">Troubleshooting Tips:</p>
                  <ul className="list-disc pl-5 text-blue-800 text-sm">
                    <li>Check that your Resend API key is correctly configured in your environment variables</li>
                    <li>Verify that your Resend account is active and in good standing</li>
                    <li>Try accessing the Resend dashboard directly to check your domains</li>
                    <li>Ensure your Convex server-side code has network access to Resend</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* API Keys Tab */}
      {activeTab === 'apikeys' && (
        <div>
          <button 
            onClick={handleListApiKeys}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? 'Loading...' : 'List API Keys'}
          </button>
          
          {apiKeysResult && (
            <div className="mt-3 p-3 rounded bg-gray-100">
              <p className="font-semibold">API Keys</p>
              <p>{apiKeysResult.message}</p>
              {apiKeysResult.keys.length > 0 && (
                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {apiKeysResult.keys.map((key) => (
                        <tr key={key.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{key.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(key.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
