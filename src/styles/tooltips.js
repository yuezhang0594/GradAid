export const tooltipStyles = {
  tooltip: `
    relative 
    before:content-[attr(data-tooltip)] 
    before:absolute 
    before:px-3 
    before:py-2
    before:left-1/2 
    before:-translate-x-1/2 
    before:top-full
    before:mt-2
    before:w-max
    before:max-w-xs
    before:bg-gray-900 
    before:text-white
    before:rounded-md
    before:opacity-0
    before:transition-all
    hover:before:opacity-100
    before:text-sm
    before:shadow-md
    before:invisible
    hover:before:visible
    before:z-50
  `
}; 