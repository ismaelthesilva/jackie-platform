import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, setIsOpen } = React.useContext(SelectContext);

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  const { value } = React.useContext(SelectContext);
  const [selectedLabel, setSelectedLabel] = React.useState<string>("");

  React.useEffect(() => {
    // This will be updated by SelectItem when rendered
    if (!value) {
      setSelectedLabel("");
    }
  }, [value]);

  return (
    <span className="block truncate">
      {selectedLabel || placeholder || "Select an option..."}
    </span>
  );
};

const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => setIsOpen(false)}
      />
      <div className="absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
        <div className="p-1">
          {children}
        </div>
      </div>
    </>
  );
};

const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
  const { value: selectedValue, onValueChange, setIsOpen } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  const handleClick = () => {
    onValueChange?.(value);
    setIsOpen(false);
  };

  // Update the SelectValue display when this item is selected
  React.useEffect(() => {
    if (isSelected) {
      // This is a bit of a hack, but it works for simple cases
      const selectValueElement = document.querySelector('[data-select-value]');
      if (selectValueElement) {
        selectValueElement.textContent = children?.toString() || '';
      }
    }
  }, [isSelected, children]);

  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground"
      )}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

// Simple wrapper for better API compatibility
const SelectGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>;
};

const SelectLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn("py-1.5 pl-2 pr-2 text-sm font-semibold text-muted-foreground", className)}>
      {children}
    </div>
  );
};

const SelectSeparator: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={cn("mx-1 my-1 h-px bg-muted", className)} />;
};

// Update SelectValue to work with our implementation
const SelectValueWithRef = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder }, ref) => {
    const { value } = React.useContext(SelectContext);
    
    return (
      <span ref={ref} data-select-value className="block truncate">
        {value ? (
          // This will be updated by SelectItem
          value
        ) : (
          placeholder || "Select an option..."
        )}
      </span>
    );
  }
);
SelectValueWithRef.displayName = "SelectValue";

export {
  Select,
  SelectGroup,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};

export { SelectValueWithRef as SelectValue };
