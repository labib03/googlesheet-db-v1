"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  onValueChange,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="bg-slate-100 dark:bg-slate-800 relative h-1.5 w-full grow overflow-hidden rounded-full"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="bg-indigo-600 dark:bg-indigo-500 absolute h-full"
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className="border-indigo-600 dark:border-indigo-500 bg-white dark:bg-slate-950 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 block h-4.5 w-4.5 rounded-full border shadow-sm transition-all focus:outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50"
      />
    </SliderPrimitive.Root>
  )
}

export { Slider }
