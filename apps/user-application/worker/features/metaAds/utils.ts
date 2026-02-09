export const cleanQuery = (query: string) => {
	const trimmed = query.trim();

	if (trimmed.includes("://")) {
		const url = new URL(trimmed);
		const params = url.searchParams;

		// handle profile.php?id=123 style URLs
		if (params.has("id")) {
			return params.get("id")!;
		}

		// grab the last non-empty path segment
		const segments = url.pathname.split("/").filter(Boolean);
		const raw = segments.at(-1) ?? "";
		return raw.replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
	}

	return trimmed.replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();
};
