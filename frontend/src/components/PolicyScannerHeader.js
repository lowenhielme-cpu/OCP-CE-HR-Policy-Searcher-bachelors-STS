import React from 'react';

function PolicyScannerHeader({ onOpenSettings }) {
    return (
        <div className="policy-scanner-heading-row">
            <div>
                <h2 className="panel-heading">Policy Scanner</h2>
                <p className="text-block-small">
                    Search for policies either by selecting domains or talking with the agent
                </p>
            </div>
            <button
                type="button"
                className="button"
                onClick={onOpenSettings}
            >
                API key settings
            </button>
        </div>
    );
}

export default PolicyScannerHeader;
