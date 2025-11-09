'use client';

import { MarketplaceService } from '@/lib/types/x402';
import { formatUnits } from 'viem';
import { getExplorerUrl, getExplorerLabel } from '@/lib/explorer-url';

interface ServiceResultCardProps {
  service: MarketplaceService;
  result: any;
  paymentReceipt: any;
  contentType: string;
}

export default function ServiceResultCard({
  service,
  result,
  paymentReceipt,
  contentType,
}: ServiceResultCardProps) {
  // Extract transaction hash from payment receipt
  const txHash = paymentReceipt?.transactionHash || paymentReceipt?.txHash || paymentReceipt?.settlementHash;
  const explorerUrl = txHash ? getExplorerUrl(
    txHash,
    service.network || null,
    service.chainId || null
  ) : null;
  const explorerLabel = getExplorerLabel(service.network || null, service.chainId || null);
  
  // Extract amount from payment receipt
  const amount = paymentReceipt?.amount 
    ? formatUnits(BigInt(paymentReceipt.amount), 6) // USDC has 6 decimals
    : service.priceWithFee || service.price;

  // Render result based on content type
  const renderResult = () => {
    if (contentType.includes('application/json')) {
      // JSON response - try to extract meaningful data
      let displayData = result;
      
      // Prefer common keys like 'data', 'result', 'output'
      if (result?.data) {
        displayData = result.data;
      } else if (result?.result) {
        displayData = result.result;
      } else if (result?.output) {
        displayData = result.output;
      }
      
      // If displayData is still an object, stringify it prettily
      if (typeof displayData === 'object') {
        return (
          <pre className="bg-gray-900/50 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-300">
            {JSON.stringify(displayData, null, 2)}
          </pre>
        );
      }
      
      return <div className="text-gray-300">{String(displayData)}</div>;
    } else if (contentType.includes('text/')) {
      // Text response
      return (
        <div className="bg-gray-900/50 rounded-lg p-4 text-gray-300 whitespace-pre-wrap">
          {result.text || result}
        </div>
      );
    } else if (result?.blob) {
      // Binary response
      return (
        <div className="bg-gray-900/50 rounded-lg p-4">
          <a
            href={result.blob}
            download={result.filename}
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download {result.filename}</span>
          </a>
          <p className="text-xs text-gray-400 mt-2">{result.contentType}</p>
        </div>
      );
    } else {
      // Fallback: stringify whatever we got
      return (
        <div className="bg-gray-900/50 rounded-lg p-4 text-gray-300">
          {typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}
        </div>
      );
    }
  };

  return (
    <div className="mt-4 space-y-3">
      {/* Service Result */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-500/20">
        <h3 className="text-sm font-semibold text-blue-300 mb-2">Service Output</h3>
        {renderResult()}
      </div>

      {/* Payment Receipt */}
      <div className="bg-gray-900/30 rounded-lg p-3 text-xs text-gray-400 border border-gray-700/50">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Service:</span>
            <span className="text-gray-300">{service.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Amount:</span>
            <span className="text-gray-300">{amount} USDC</span>
          </div>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              <span>{explorerLabel}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
        {service.endpoint && (
          <div className="mt-2 pt-2 border-t border-gray-700/50">
            <span className="text-gray-500">Endpoint:</span>
            <code className="ml-2 text-gray-400 text-xs break-all">{service.endpoint}</code>
          </div>
        )}
      </div>
    </div>
  );
}

