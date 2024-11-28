"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useState } from "react";
import useNetworkStore from "~/hooks/stores/useNetworkStore";

export function NetworkSelector() {
  const [open, setOpen] = useState(false);
  const { setNetwork, networks, selectedNetwork } = useNetworkStore();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedNetwork ? selectedNetwork.name : "Select network..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search network..." />
          <CommandList>
            <CommandEmpty>No network found.</CommandEmpty>
            <CommandGroup>
              {Object.entries(networks).map(([, network]) => (
                <CommandItem
                  key={network.name}
                  onSelect={(currentValue) => {
                    const optionSelected = Object.entries(networks)
                      .find(([, nwk]) => nwk.name === currentValue)
                      ?.at(0);
                    if (optionSelected) {
                      if (
                        optionSelected === "mainnet" ||
                        optionSelected === "testnet" ||
                        optionSelected === "ethereum"
                      ) {
                        setNetwork(optionSelected);
                      }
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedNetwork.name === network.name
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {network.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
