import { useState } from "react";
import {verifyResendDomains} from "./ResendVerify";

export default function ResendVerifyButton() {
    const [verificationResult, setVerificationResult] = useState<{
        isVerified: boolean;
        domains: Array<{name: string, status: string}>;
        message: string;
    } | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    
    const handleVerifyClick = async () => {
        setIsLoading(true);
        try {
            const result = await verifyResendDomains();
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

    return (
        <div className="mt-4">
            <button 
                onClick={handleVerifyClick}
                disabled={isLoading}
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
                </div>
            )}
        </div>
    );
}