import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
	Menu,
	MenuButton,
	MenuItem,
	MenuItems,
} from "@headlessui/react";
import { ChevronDownIcon, FunnelIcon } from "@heroicons/react/20/solid";

const filters = {
	price: [
		{ value: "0", label: "$0 - $25", checked: false },
		{ value: "25", label: "$25 - $50", checked: false },
		{ value: "50", label: "$50 - $75", checked: false },
		{ value: "75", label: "$75+", checked: false },
	],
	color: [
		{ value: "white", label: "White", checked: false },
		{ value: "beige", label: "Beige", checked: false },
		{ value: "blue", label: "Blue", checked: true },
		{ value: "brown", label: "Brown", checked: false },
		{ value: "green", label: "Green", checked: false },
		{ value: "purple", label: "Purple", checked: false },
	],
	size: [
		{ value: "xs", label: "XS", checked: false },
		{ value: "s", label: "S", checked: true },
		{ value: "m", label: "M", checked: false },
		{ value: "l", label: "L", checked: false },
		{ value: "xl", label: "XL", checked: false },
		{ value: "2xl", label: "2XL", checked: false },
	],
	category: [
		{ value: "all-new-arrivals", label: "All New Arrivals", checked: false },
		{ value: "tees", label: "Tees", checked: false },
		{ value: "objects", label: "Objects", checked: false },
		{ value: "sweatshirts", label: "Sweatshirts", checked: false },
		{ value: "pants-and-shorts", label: "Pants & Shorts", checked: false },
	],
};
const sortOptions = [
	{ name: "Most Popular", href: "#", current: true },
	{ name: "Best Rating", href: "#", current: false },
	{ name: "Newest", href: "#", current: false },
];
// @ts-expect-error
function classNames(...classes) {
	return classes.filter(Boolean).join(" ");
}

export function FilterBox() {
	return (
		<div className="bg-background rounded-lg mb-4 ">
			{/* Filters */}
			<Disclosure
				as="section"
				aria-labelledby="filter-heading"
				className="grid items-center "
			>
				<h2 id="filter-heading" className="sr-only">
					Filters
				</h2>
				<div className="relative col-start-1 row-start-1 py-4">
					<div className="mx-auto flex max-w-7xl divide-x divide-border px-4 text-sm sm:px-6 lg:px-8">
						<div className="pr-6">
							<DisclosureButton className="group flex items-center font-medium text-foreground">
								<FunnelIcon
									aria-hidden="true"
									className="mr-2 size-5 flex-none text-muted-foreground group-hover:text-foreground"
								/>
								2 Filters
							</DisclosureButton>
						</div>
						<div className="pl-6">
							<button type="button" className="text-muted-foreground">
								Clear all
							</button>
						</div>
					</div>
				</div>
				<DisclosurePanel className="border-t border-border py-10">
					<div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 px-4 text-sm sm:px-6 md:gap-x-6 lg:px-8">
						<div className="grid auto-rows-min grid-cols-1 gap-y-10 md:grid-cols-2 md:gap-x-6">
							<fieldset>
								<legend className="block font-medium text-foreground">
									Price
								</legend>
								<div className="space-y-6 pt-6 sm:space-y-4 sm:pt-4">
									{filters.price.map((option, optionIdx) => (
										<div key={option.value} className="flex gap-3">
											<div className="flex h-5 shrink-0 items-center">
												<div className="group grid size-4 grid-cols-1">
													<input
														defaultValue={option.value}
														defaultChecked={option.checked}
														id={`price-${optionIdx}`}
														name="price[]"
														type="checkbox"
														className="col-start-1 row-start-1 appearance-none rounded border border-input bg-background checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:border-muted disabled:bg-muted disabled:checked:bg-muted forced-colors:appearance-auto"
													/>
													<svg
														fill="none"
														viewBox="0 0 14 14"
														className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
													>
														<path
															d="M3 8L6 11L11 3.5"
															strokeWidth={2}
															strokeLinecap="round"
															strokeLinejoin="round"
															className="opacity-0 group-has-[:checked]:opacity-100"
														/>
														<path
															d="M3 7H11"
															strokeWidth={2}
															strokeLinecap="round"
															strokeLinejoin="round"
															className="opacity-0 group-has-[:indeterminate]:opacity-100"
														/>
													</svg>
												</div>
											</div>
											<label
												htmlFor={`price-${optionIdx}`}
												className="text-base text-muted-foreground sm:text-sm"
											>
												{option.label}
											</label>
										</div>
									))}
								</div>
							</fieldset>
							<fieldset>
								<legend className="block font-medium text-foreground">
									Color
								</legend>
								<div className="space-y-6 pt-6 sm:space-y-4 sm:pt-4">
									{filters.color.map((option, optionIdx) => (
										<div key={option.value} className="flex gap-3">
											<div className="flex h-5 shrink-0 items-center">
												<div className="group grid size-4 grid-cols-1">
													<input
														defaultValue={option.value}
														defaultChecked={option.checked}
														id={`color-${optionIdx}`}
														name="color[]"
														type="checkbox"
														className="col-start-1 row-start-1 appearance-none rounded border border-input bg-background checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:border-muted disabled:bg-muted disabled:checked:bg-muted forced-colors:appearance-auto"
													/>
													<svg
														fill="none"
														viewBox="0 0 14 14"
														className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
													>
														<path
															d="M3 8L6 11L11 3.5"
															strokeWidth={2}
															strokeLinecap="round"
															strokeLinejoin="round"
															className="opacity-0 group-has-[:checked]:opacity-100"
														/>
														<path
															d="M3 7H11"
															strokeWidth={2}
															strokeLinecap="round"
															strokeLinejoin="round"
															className="opacity-0 group-has-[:indeterminate]:opacity-100"
														/>
													</svg>
												</div>
											</div>
											<label
												htmlFor={`color-${optionIdx}`}
												className="text-base text-muted-foreground sm:text-sm"
											>
												{option.label}
											</label>
										</div>
									))}
								</div>
							</fieldset>
						</div>
						<div className="grid auto-rows-min grid-cols-1 gap-y-10 md:grid-cols-2 md:gap-x-6">
							<fieldset>
								<legend className="block font-medium text-foreground">
									Size
								</legend>
								<div className="space-y-6 pt-6 sm:space-y-4 sm:pt-4">
									{filters.size.map((option, optionIdx) => (
										<div key={option.value} className="flex gap-3">
											<div className="flex h-5 shrink-0 items-center">
												<div className="group grid size-4 grid-cols-1">
													<input
														defaultValue={option.value}
														defaultChecked={option.checked}
														id={`size-${optionIdx}`}
														name="size[]"
														type="checkbox"
														className="col-start-1 row-start-1 appearance-none rounded border border-input bg-background checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:border-muted disabled:bg-muted disabled:checked:bg-muted forced-colors:appearance-auto"
													/>
													<svg
														fill="none"
														viewBox="0 0 14 14"
														className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
													>
														<path
															d="M3 8L6 11L11 3.5"
															strokeWidth={2}
															strokeLinecap="round"
															strokeLinejoin="round"
															className="opacity-0 group-has-[:checked]:opacity-100"
														/>
														<path
															d="M3 7H11"
															strokeWidth={2}
															strokeLinecap="round"
															strokeLinejoin="round"
															className="opacity-0 group-has-[:indeterminate]:opacity-100"
														/>
													</svg>
												</div>
											</div>
											<label
												htmlFor={`size-${optionIdx}`}
												className="text-base text-muted-foreground sm:text-sm"
											>
												{option.label}
											</label>
										</div>
									))}
								</div>
							</fieldset>
							<fieldset>
								<legend className="block font-medium text-foreground">
									Category
								</legend>
								<div className="space-y-6 pt-6 sm:space-y-4 sm:pt-4">
									{filters.category.map((option, optionIdx) => (
										<div key={option.value} className="flex gap-3">
											<div className="flex h-5 shrink-0 items-center">
												<div className="group grid size-4 grid-cols-1">
													<input
														defaultValue={option.value}
														defaultChecked={option.checked}
														id={`category-${optionIdx}`}
														name="category[]"
														type="checkbox"
														className="col-start-1 row-start-1 appearance-none rounded border border-input bg-background checked:border-primary checked:bg-primary indeterminate:border-primary indeterminate:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:border-muted disabled:bg-muted disabled:checked:bg-muted forced-colors:appearance-auto"
													/>
													<svg
														fill="none"
														viewBox="0 0 14 14"
														className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
													>
														<path
															d="M3 8L6 11L11 3.5"
															strokeWidth={2}
															strokeLinecap="round"
															strokeLinejoin="round"
															className="opacity-0 group-has-[:checked]:opacity-100"
														/>
														<path
															d="M3 7H11"
															strokeWidth={2}
															strokeLinecap="round"
															strokeLinejoin="round"
															className="opacity-0 group-has-[:indeterminate]:opacity-100"
														/>
													</svg>
												</div>
											</div>
											<label
												htmlFor={`category-${optionIdx}`}
												className="text-base text-muted-foreground sm:text-sm"
											>
												{option.label}
											</label>
										</div>
									))}
								</div>
							</fieldset>
						</div>
					</div>
				</DisclosurePanel>
				<div className="col-start-1 row-start-1 py-4">
					<div className="mx-auto flex max-w-7xl justify-end px-4 sm:px-6 lg:px-8">
						<Menu as="div" className="relative inline-block">
							<div className="flex">
								<MenuButton className="group inline-flex justify-center text-sm font-medium text-foreground hover:text-foreground/80">
									Sort
									<ChevronDownIcon
										aria-hidden="true"
										className="-mr-1 ml-1 size-5 shrink-0 text-muted-foreground group-hover:text-foreground"
									/>
								</MenuButton>
							</div>

							<MenuItems
								transition
								className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-popover shadow-2xl ring-1 ring-border transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
							>
								<div className="py-1">
									{sortOptions.map((option) => (
										<MenuItem key={option.name}>
											<a
												href={option.href}
												className={classNames(
													option.current
														? "font-medium text-foreground"
														: "text-muted-foreground",
													"block px-4 py-2 text-sm data-[focus]:bg-accent data-[focus]:text-accent-foreground data-[focus]:outline-none",
												)}
											>
												{option.name}
											</a>
										</MenuItem>
									))}
								</div>
							</MenuItems>
						</Menu>
					</div>
				</div>
			</Disclosure>
		</div>
	);
}
