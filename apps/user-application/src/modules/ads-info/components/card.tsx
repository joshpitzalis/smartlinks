import { ArrowLongRightIcon } from "@heroicons/react/24/outline";
import type { Dispatch, SetStateAction } from "react";
import type { FacebookPageResults } from "@/worker/features/metaAds/schemas";

export function CardImage({
	profile,
	setPageId,
}: {
	profile: FacebookPageResults;
	setPageId: Dispatch<SetStateAction<string>>;
}) {
	const {
		page_id,
		category,
		image_uri,
		likes,
		verification,
		name,
		ig_username,
		ig_verification,
		ig_followers,
		page_alias,
	} = profile;

	return (
		<li className="overflow-hidden rounded-xl outline outline-1 outline-gray-200 dark:outline-gray-700 w-sm mb-4">
			<button
				type="button"
				className="flex items-center gap-x-4 border-b border-gray-900/5 dark:border-gray-100/5 bg-gray-50 dark:bg-gray-800 p-6 cursor-pointer w-full text-left"
				onClick={() => setPageId(page_id)}
			>
				<img
					alt={name}
					src={image_uri}
					className="size-12 flex-none rounded-lg bg-white dark:bg-gray-900 object-cover ring-1 ring-gray-900/10 dark:ring-gray-100/10"
				/>
				<div className="flex flex-col">
					<div className="text-sm font-medium text-gray-900 dark:text-gray-100">
						{`fb.com/${page_alias}` || `@${ig_username}`}
					</div>
					<div className="text-sm font-medium text-gray-400 dark:text-gray-500">
						{category}
					</div>
				</div>
				<ArrowLongRightIcon
					aria-hidden="true"
					className="size-5 ml-auto text-gray-900 dark:text-gray-100"
				/>
				{/*<Menu as="div" className="relative ml-auto">
							<MenuButton className="relative block text-gray-400 hover:text-gray-500">
								<span className="absolute -inset-2.5" />
								<span className="sr-only">Open options</span>
								<EllipsisHorizontalIcon aria-hidden="true" className="size-5" />


							</MenuButton>
							<MenuItems
								transition
								className="absolute right-0 z-10 mt-0.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg outline outline-1 outline-gray-900/5 transition data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
							>
								<MenuItem>
									<a
										href="#"
										className="block px-3 py-1 text-sm/6 text-gray-900 data-[focus]:bg-gray-50 data-[focus]:outline-none"
									>
										View<span className="sr-only">, {client.name}</span>
									</a>
								</MenuItem>
								<MenuItem>
									<a
										href="#"
										className="block px-3 py-1 text-sm/6 text-gray-900 data-[focus]:bg-gray-50 data-[focus]:outline-none"
									>
										Edit<span className="sr-only">, {client.name}</span>
									</a>
								</MenuItem>
							</MenuItems>
						</Menu>*/}
			</button>
			<dl className="-my-3 divide-y divide-gray-100 dark:divide-gray-700 px-6 py-4 text-sm/6">
				{!!likes && (
					<Row
						name="Facebook likes"
						value={formatLikes(likes)}
						badge={verification}
						label="Verified"
					/>
				)}
				{!!ig_username && (
					<Row
						name={`@${ig_username}`}
						value={`${formatLikes(ig_followers ?? 0)} followers`}
						badge={ig_verification}
						label="Verified"
					/>
				)}
			</dl>
		</li>
	);
}

const Row = ({
	name,
	value,
	badge,
	label,
}: {
	name: string | number | undefined;
	value: string | number | undefined;
	badge: string | number | boolean | undefined;
	label: string | number | undefined;
}) => {
	return (
		<div className="flex justify-between gap-x-4 py-3">
			<dt className="text-gray-900 dark:text-gray-100">{name}</dt>
			<dd className="flex items-start gap-x-2">
				<div className="font-medium text-gray-900 dark:text-gray-100">
					{value}
				</div>
				{badge ? (
					<div className="rounded-md bg-green-50 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-600 dark:text-green-400 ring-1 ring-inset ring-green-500/10">
						{label}
					</div>
				) : null}
			</dd>
		</div>
	);
};

function formatLikes(num: number) {
	if (num >= 1000000) return (num / 1000000).toFixed(1) + " M";
	if (num >= 1000) return (num / 1000).toFixed(1) + " K";
	return num;
}
