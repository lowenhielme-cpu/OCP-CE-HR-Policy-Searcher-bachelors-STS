import { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '../config/api';
import { resolveDomainsForTargets, splitSelection } from '../utils/scanTargets';

async function getCostEstimate(domains) {
    const response = await fetch(
        apiUrl(`/api/cost-estimate?domains=${encodeURIComponent(domains)}`),
        { method: 'POST' },
    );

    if (!response.ok) {
        throw new Error(`Cost estimate failed for ${domains} (${response.status})`);
    }

    return response.json();
}

function sumCostEstimates(estimates) {
    return estimates.reduce(
        (total, estimate) => ({
            domain_count: total.domain_count + (estimate.domain_count || 0),
            estimated_pages: total.estimated_pages + (estimate.estimated_pages || 0),
            estimated_keyword_passes: total.estimated_keyword_passes + (estimate.estimated_keyword_passes || 0),
            estimated_screening_calls: total.estimated_screening_calls + (estimate.estimated_screening_calls || 0),
            estimated_analysis_calls: total.estimated_analysis_calls + (estimate.estimated_analysis_calls || 0),
            estimated_cost_usd: total.estimated_cost_usd + (estimate.estimated_cost_usd || 0),
        }),
        {
            domain_count: 0,
            estimated_pages: 0,
            estimated_keyword_passes: 0,
            estimated_screening_calls: 0,
            estimated_analysis_calls: 0,
            estimated_cost_usd: 0,
        },
    );
}

function formatCostEstimateText(costStatus, costEstimate) {
    if (costStatus === 'loading') {
        return 'Estimating...';
    }
    if (costStatus === 'filters_only') {
        return 'Select a scan target';
    }
    if (costStatus === 'standard_only') {
        return 'Cost estimates are only available in standard mode.';
    }
    if (costStatus === 'error') {
        return 'Estimate unavailable';
    }
    if (costStatus === 'ready' && costEstimate) {
        const cost = Number(costEstimate.estimated_cost_usd || 0).toFixed(2);
        const targetLabel = costEstimate.target_count > 1 ? `${costEstimate.target_count} targets` : '1 target';
        const filterNote = costEstimate.has_filters ? ', filters not included' : '';
        return `$${cost} (${targetLabel}${filterNote})`;
    }
    return 'No cost estimate';
}

function useCostEstimate({ selectedRegions, isStandardMode }) {
    const [costEstimate, setCostEstimate] = useState(null);
    const [costStatus, setCostStatus] = useState('idle');

    useEffect(() => {
        let isCurrent = true;
        const { categories, tags, targets } = splitSelection(selectedRegions);

        if (!isStandardMode) {
            setCostEstimate(null);
            setCostStatus('standard_only');
            return () => {
                isCurrent = false;
            };
        }

        if (targets.length === 0) {
            setCostEstimate(null);
            setCostStatus(selectedRegions.length === 0 ? 'idle' : 'filters_only');
            return () => {
                isCurrent = false;
            };
        }

        setCostStatus('loading');

        resolveDomainsForTargets(targets)
            .then((domains) => Promise.all(domains.map((domain) => getCostEstimate(domain.id))))
            .then((estimates) => {
                if (!isCurrent) return;
                setCostEstimate({
                    ...sumCostEstimates(estimates),
                    target_count: estimates.length,
                    has_filters: categories.length > 0 || tags.length > 0,
                });
                setCostStatus('ready');
            })
            .catch(() => {
                if (!isCurrent) return;
                setCostEstimate(null);
                setCostStatus('error');
            });

        return () => {
            isCurrent = false;
        };
    }, [selectedRegions, isStandardMode]);

    const costEstimateText = useMemo(
        () => formatCostEstimateText(costStatus, costEstimate),
        [costStatus, costEstimate],
    );

    return {
        costStatus,
        costEstimateText,
    };
}

export default useCostEstimate;
