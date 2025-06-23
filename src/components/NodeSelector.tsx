
import React, { useState, useMemo } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NODE_TITLE_MAP } from '@/utils/nodeMapping';

interface NodeSelectorProps {
  availableNodes: number[];
  selectedNode: number | null;
  onNodeSelect: (nodeId: number) => void;
}

const NodeSelector: React.FC<NodeSelectorProps> = ({
  availableNodes,
  selectedNode,
  onNodeSelect,
}) => {
  const [open, setOpen] = useState(false);

  const nodeOptions = useMemo(() => 
    availableNodes.map(nodeId => ({
      value: nodeId,
      label: `${nodeId}: ${NODE_TITLE_MAP[nodeId] || `Node ${nodeId}`}`
    })), [availableNodes]
  );

  const selectedNodeLabel = selectedNode 
    ? `${selectedNode}: ${NODE_TITLE_MAP[selectedNode] || `Node ${selectedNode}`}`
    : "Select node...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white"
        >
          {selectedNodeLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-white">
        <Command>
          <CommandInput placeholder="Search nodes..." />
          <CommandList>
            <CommandEmpty>No node found.</CommandEmpty>
            <CommandGroup>
              {nodeOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onNodeSelect(option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedNode === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default NodeSelector;
