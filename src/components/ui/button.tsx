
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-lg text-xs sm:text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-3 sm:[&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105",
        destructive:
          "bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 text-white hover:from-rose-600 hover:via-rose-700 hover:to-rose-800 shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-105",
        outline:
          "border-2 border-input bg-gradient-to-br from-background to-muted hover:from-accent hover:to-accent/80 hover:text-accent-foreground shadow-md hover:shadow-lg hover:scale-105",
        secondary:
          "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900 dark:from-gray-800 dark:to-gray-700 dark:text-gray-100 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 shadow-md hover:shadow-lg hover:scale-105",
        ghost: "hover:bg-gradient-to-br hover:from-accent hover:to-accent/80 hover:text-accent-foreground hover:scale-105",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 sm:h-11 px-4 sm:px-6 py-2 sm:py-2.5",
        sm: "h-8 sm:h-9 rounded-lg px-3 sm:px-4 text-xs",
        lg: "h-11 sm:h-12 rounded-lg px-7 sm:px-10 text-sm sm:text-base",
        icon: "h-10 w-10 sm:h-11 sm:w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

// Add global CSS for 3D buttons
// This will be added to the base styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .btn-3d {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transform: translateY(0);
      transition: transform 0.1s, box-shadow 0.1s;
    }
    
    .btn-3d:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    
    .btn-3d:active {
      transform: translateY(1px);
      box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
    }
    
    .card-3d {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      transition: box-shadow 0.2s, transform 0.2s;
      transform: translateY(0);
    }
    
    .card-3d:hover {
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      transform: translateY(-4px);
    }
    
    @media (prefers-color-scheme: dark) {
      .card-3d {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15);
      }
      
      .card-3d:hover {
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.15);
      }
    }
  `;
  document.head.appendChild(styleElement);
}
