/** Path side of a wikilink inner (strip alias, heading, block id). */
export function normalizeLinkPath(inner: string): string {
	let part = inner.trim();
	const pipe = part.indexOf("|");
	if (pipe >= 0) part = part.slice(0, pipe);
	part = part.split("#")[0] ?? "";
	part = part.split("^")[0] ?? "";
	return part.trim();
}
