import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const TOP_LEVEL_IDS = new Set([
  'section:scan_groups',
  'section:regions',
  'section:categories',
  'section:tags',
  'section:domains',
]);

const LABEL_OVERRIDES = {
  all: 'All',
  apac: 'APAC',
  eu: 'EU',
  uk: 'United Kingdom',
  us: 'United States',
  uae: 'United Arab Emirates',
  dach: 'DACH',
  nordic: 'Nordic',
};

function formatLabel(value) {
  if (!value) return '';
  if (LABEL_OVERRIDES[value]) return LABEL_OVERRIDES[value];

  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function countDomainsByValue(domains, getter) {
  const counts = new Map();

  domains.forEach((domain) => {
    const values = getter(domain);
    values.forEach((value) => {
      if (!value) return;
      counts.set(value, (counts.get(value) || 0) + 1);
    });
  });

  return counts;
}

function sortByLabel(items) {
  return [...items].sort((a, b) => a.label.localeCompare(b.label));
}

function buildCountLabel(label, count) {
  return count ? `${label} (${count})` : label;
}

function buildRegionItems(domains, regionLabels) {
  const regionCounts = countDomainsByValue(domains, (domain) => domain.region || []);

  return sortByLabel(
    [...regionCounts.entries()].map(([region, count]) => ({
      id: `region:${region}`,
      value: region,
      label: buildCountLabel(regionLabels[region] || formatLabel(region), count),
    })),
  );
}

function buildMetadataItems({ domains, categories, tags }) {
  const categoryCounts = countDomainsByValue(domains, (domain) => (
    domain.category ? [domain.category] : []
  ));
  const tagCounts = countDomainsByValue(domains, (domain) => domain.tags || []);

  const categoryItems = sortByLabel(
    [...categoryCounts.entries()].map(([category, count]) => ({
      id: `category:${category}`,
      value: `category:${category}`,
      label: buildCountLabel(categories[category] || formatLabel(category), count),
    })),
  );

  const tagItems = sortByLabel(
    [...tagCounts.entries()].map(([tag, count]) => ({
      id: `tag:${tag}`,
      value: `tag:${tag}`,
      label: buildCountLabel(tags[tag] || formatLabel(tag), count),
    })),
  );

  return { categoryItems, tagItems };
}

function buildDomainItems(domains) {
  return sortByLabel(
    domains.map((domain) => ({
      id: `domain:${domain.id}`,
      value: domain.id,
      label: domain.name || formatLabel(domain.id),
    })),
  );
}

function buildTreeData({ domains, groups, regions, categories, tags }) {
  const groupItems = sortByLabel(
    Object.entries(groups).map(([id, description]) => ({
      id: `group:${id}`,
      value: id,
      label: description && description !== 'No description'
        ? `${formatLabel(id)} - ${description}`
        : formatLabel(id),
    })),
  );

  const { categoryItems, tagItems } = buildMetadataItems({ domains, categories, tags });

  return [
    {
      id: 'section:scan_groups',
      label: 'Scan groups',
      children: groupItems,
    },
    {
      id: 'section:regions',
      label: 'Regions',
      children: buildRegionItems(domains, regions),
    },
    {
      id: 'section:categories',
      label: 'Categories',
      children: categoryItems,
    },
    {
      id: 'section:tags',
      label: 'Tags',
      children: tagItems,
    },
    /*{
      id: 'section:domains',
      label: 'Domains',
      children: buildDomainItems(domains),
    },*/
  ].filter((item) => item.children.length > 0);
}

async function fetchJson(path, signal) {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }
  return response.json();
}

// 1. Create a Custom Tree Item with your specific styling
const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    padding: theme.spacing(0.5, 1),
    margin: theme.spacing(0.2, 0),
    borderRadius: theme.shape.borderRadius,
  },
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

// 2. Build the actual Component
function renderTreeItems(items) {
  return items.map((item) => (
    <StyledTreeItem key={item.id} itemId={item.id} label={item.label}>
      {item.children ? renderTreeItems(item.children) : null}
    </StyledTreeItem>
  ));
}

function flattenTreeItems(items) {
  return items.flatMap((item) => [
    item,
    ...(item.children ? flattenTreeItems(item.children) : []),
  ]);
}

export default function RegionTreeView({ selectedItems, onSelectionChange }) {
  const [treeData, setTreeData] = React.useState([]);
  const [status, setStatus] = React.useState('loading');
  const [error, setError] = React.useState('');

  const itemValueById = React.useMemo(() => {
    const entries = flattenTreeItems(treeData)
      .filter((item) => item.value)
      .map((item) => [item.id, item.value]);
    return new Map(entries);
  }, [treeData]);

  const itemIdByValue = React.useMemo(() => {
    const entries = flattenTreeItems(treeData)
      .filter((item) => item.value)
      .map((item) => [item.value, item.id]);
    return new Map(entries);
  }, [treeData]);

  const treeSelectedItems = React.useMemo(
    () => (selectedItems || []).map((value) => itemIdByValue.get(value) || value),
    [itemIdByValue, selectedItems],
  );

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadDomainFilters() {
      try {
        setStatus('loading');
        setError('');

        const [domainResponse, groups, regions, categories, tags] = await Promise.all([
          fetchJson('/api/domains', controller.signal),
          fetchJson('/api/groups', controller.signal),
          fetchJson('/api/regions', controller.signal),
          fetchJson('/api/categories', controller.signal),
          fetchJson('/api/tags', controller.signal),
        ]);

        setTreeData(buildTreeData({
          domains: domainResponse.domains || [],
          groups,
          regions,
          categories,
          tags,
        }));
        setStatus('ready');
      } catch (loadError) {
        if (loadError.name === 'AbortError') return;
        setError(loadError.message);
        setStatus('error');
      }
    }

    loadDomainFilters();

    return () => {
      controller.abort();
    };
  }, []);

  const handleSelectedItemsChange = React.useCallback(
    (event, itemIds) => {
      const selectableItems = [
        ...new Set(
          itemIds
            .filter((id) => !TOP_LEVEL_IDS.has(id))
            .map((id) => itemValueById.get(id) || id),
        ),
      ];
      onSelectionChange?.(event, selectableItems);
    },
    [itemValueById, onSelectionChange],
  );

  if (status === 'loading') {
    return (
      <Box sx={{ minHeight: 200, width: '100%', display: 'flex', alignItems: 'center' }}>
        <Typography color="text.secondary" variant="body2">
          Loading domains...
        </Typography>
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <Box sx={{ minHeight: 200, width: '100%' }}>
        <Typography color="error" variant="body2">
          {error || 'Could not load domains.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: 200, flexGrow: 1, width: '100%' }}>
      <SimpleTreeView
        checkboxSelection
        selectionPropagation
        multiSelect
        selectedItems={treeSelectedItems}
        onSelectedItemsChange={handleSelectedItemsChange}
      >
        {renderTreeItems(treeData)}
      </SimpleTreeView>
    </Box>
  );
}
