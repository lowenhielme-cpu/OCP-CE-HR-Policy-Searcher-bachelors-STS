import React from 'react';
import ModeSelector from './ModeSelector';
import RegionSelector from './RegionSelector';
import Tooltip from '@mui/material/Tooltip';

function DomainScanPanel({
    selectedRegions,
    onSelectionChange,
    mode,
    onModeChange,
    costStatus,
    costEstimateText,
    isBusy,
    hasApiKey,
    isQueueRunning,
    queuedScanCount,
    isScanRequestRunning,
    isScanRunning,
    onScan,
    onStop,
}) {
    return (
        <div className="domain-scan" aria-label="Domain scan">
            <div>
                <div className="settings-heading-panel">
                    <div className="settings-heading-row">
                        <h2 className="panel-heading">Domain Scan</h2>
                    </div>
                    <p className="text-block-small">Scan specific regions for policies.</p>
                </div>

                <div className="region-selector-scroll">
                    <RegionSelector
                        selectedItems={selectedRegions}
                        onSelectionChange={onSelectionChange}
                    />
                </div>
                <ModeSelector
                    value={mode}
                    onChange={onModeChange}
                />
                <Tooltip title="Please note that this is only an estimate and may not reflect the actual cost" placement="top" arrow>
                    <output className={`cost-estimate ${costStatus}`} aria-live="polite">
                        {costEstimateText}
                    </output>
                </Tooltip>
            </div>
            <div className="agent-action-row">
                <button
                    type="button"
                    className="scan-button button"
                    onClick={onScan}
                    disabled={isBusy || selectedRegions.length === 0 || !hasApiKey}
                >
                    {isQueueRunning
                        ? `Queued (${queuedScanCount})`
                        : isScanRequestRunning || isScanRunning ? 'Scan running' : 'Scan'}
                </button>
                <button
                    type="button"
                    className="stop-scan-button button"
                    onClick={onStop}
                    disabled={!isScanRunning && !isQueueRunning && !isScanRequestRunning}
                >
                    Stop scan
                </button>
            </div>
        </div>
    );
}

export default DomainScanPanel;
