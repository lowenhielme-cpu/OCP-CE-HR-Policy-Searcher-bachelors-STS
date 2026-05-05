import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';

const regionData = [
  {
    id: 'eu',
    label: 'EU',
    children: [
      { id: 'germany', label: 'Germany' },
      { id: 'france', label: 'France' },
    ],
  },
  {
    id: 'nordic',
    label: 'Nordics',
    children: [
      { id: 'sweden', label: 'Sweden' },
      { id: 'norway', label: 'Norway' },
      { id: 'denmark', label: 'Denmark' },
    ],
  },
  { id: 'us', label: 'US', children: [{ id: 'usa', label: 'United States' }] },
  { id: 'asia', label: 'Asia', children: [{ id: 'japan', label: 'Japan' }, { id: 'china', label: 'China' }] },
  { id: 'other', label: 'Other' },
];

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
export default function RegionTreeView({ selectedItems, onSelectionChange }) {
  return (
    <Box sx={{ minHeight: 200, flexGrow: 1, width: '100%' }}>
      <SimpleTreeView
        checkboxSelection
        selectionPropagation
        multiSelect
        // Connect these to your parent state
        selectedItems={selectedItems}
        onSelectedItemsChange={onSelectionChange}
      >
        {regionData.map((region) => (
          <StyledTreeItem key={region.id} itemId={region.id} label={region.label}>
            {region.children?.map((country) => (
              <StyledTreeItem 
                key={country.id} 
                itemId={country.id} 
                label={country.label} 
              />
            ))}
          </StyledTreeItem>
        ))}
      </SimpleTreeView>
    </Box>
  );
}
