import * as React from "react"
import { Link } from "react-router-dom"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl font-medium transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-brand-dark text-white shadow-sm hover:bg-brand-sage/90 active:scale-[0.98]",
        primary:
          "bg-brand-sage text-white shadow-sm hover:bg-brand-sage/90 active:scale-[0.98]",
        secondary:
          "bg-brand-dark text-white shadow-sm hover:bg-brand-dark/90 active:scale-[0.98]",
        outline:
          "border border-brand-dark/20 bg-white/80 text-brand-dark backdrop-blur hover:bg-brand-cream/80 hover:border-brand-sage active:scale-[0.98]",
        ghost:
          "text-brand-dark hover:bg-brand-dark/5 active:scale-[0.98]",
        destructive:
          "bg-brand-alert text-white shadow-sm hover:bg-brand-alert/90 active:scale-[0.98]",
        link:
          "text-brand-sage underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-4 py-2 text-sm",
        xs: "h-7 gap-1 px-2 text-xs",
        sm: "h-8 gap-1.5 px-3 text-xs",
        lg: "h-12 gap-2.5 px-6 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
        "icon-xs": "size-6",
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
  to?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", to, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size, className }))

    if (to) {
      return (
        <Link to={to} className={classes}>
          {children}
        </Link>
      )
    }

    return (
      <ButtonPrimitive
        ref={ref}
        data-slot="button"
        className={classes}
        {...props}
      >
        {children}
      </ButtonPrimitive>
    )
  }
)
Button.displayName = "Button"

export default Button
export { Button, buttonVariants }
