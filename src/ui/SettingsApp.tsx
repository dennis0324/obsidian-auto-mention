import { useCallback, useState } from "react";
import type AutoMentionPlugin from "../main";

export function SettingsApp({ plugin }: { plugin: AutoMentionPlugin }) {
	const [enabled, setEnabled] = useState(plugin.settings.enabled);
	const [reverseSync, setReverseSync] = useState(plugin.settings.reverseSync);
	const [mentionLinksKey, setMentionLinksKey] = useState(
		plugin.settings.mentionLinksKey,
	);
	const [removeKeyWhenEmpty, setRemoveKeyWhenEmpty] = useState(
		plugin.settings.removeMentionLinksKeyWhenEmpty,
	);
	const [debounceMs, setDebounceMs] = useState(plugin.settings.debounceMs);
	const [busy, setBusy] = useState(false);
	const keyForUi = (mentionLinksKey || "mention links").trim() || "mention links";

	const persist = useCallback(async () => {
		await plugin.saveSettings();
	}, [plugin]);

	const onEnabled = useCallback(
		async (v: boolean) => {
			setEnabled(v);
			plugin.settings.enabled = v;
			await persist();
		},
		[persist, plugin],
	);

	const onReverse = useCallback(
		async (v: boolean) => {
			setReverseSync(v);
			plugin.settings.reverseSync = v;
			await persist();
		},
		[persist, plugin],
	);

	const onMentionLinksKey = useCallback(
		async (v: string) => {
			setMentionLinksKey(v);
			plugin.settings.mentionLinksKey = v;
			await persist();
		},
		[persist, plugin],
	);

	const onRemoveKeyWhenEmpty = useCallback(
		async (v: boolean) => {
			setRemoveKeyWhenEmpty(v);
			plugin.settings.removeMentionLinksKeyWhenEmpty = v;
			await persist();
		},
		[persist, plugin],
	);

	const onDebounce = useCallback(
		async (v: number) => {
			setDebounceMs(v);
			plugin.settings.debounceMs = v;
			await persist();
		},
		[persist, plugin],
	);

	const rescan = useCallback(async () => {
		setBusy(true);
		try {
			await plugin.runRescan();
		} finally {
			setBusy(false);
		}
	}, [plugin]);

	return (
		<div className="auto-mention-settings">
			<h2>Auto Mention</h2>
			<p style={{ marginBottom: "1em", opacity: 0.85 }}>
				Body wikilinks <code>[[…]]</code> and embeds <code>![[…]]</code> update the
				target note&apos;s <code>{keyForUi}</code> frontmatter. Optional
				reverse sync strips links in the source when you remove it from that
				list.
			</p>
			<label
				style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
			>
				<input
					type="checkbox"
					checked={enabled}
					onChange={(e) => void onEnabled(e.target.checked)}
				/>
				<span>Enable sync</span>
			</label>
			<label
				style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
			>
				<input
					type="checkbox"
					checked={reverseSync}
					onChange={(e) => void onReverse(e.target.checked)}
				/>
				<span>Reverse sync (frontmatter removal strips body links)</span>
			</label>
			<label style={{ display: "block", marginBottom: 12 }}>
				<span>
					Frontmatter key (meta property){" "}
					<span style={{ opacity: 0.8 }}>(default: </span>
					<code>mention links</code>
					<span style={{ opacity: 0.8 }}>)</span>
				</span>
				<input
					type="text"
					value={mentionLinksKey}
					placeholder="mention links"
					onChange={(e) => void onMentionLinksKey(e.target.value)}
					style={{ marginLeft: 8, width: 240 }}
				/>
			</label>
			<label
				style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
			>
				<input
					type="checkbox"
					checked={removeKeyWhenEmpty}
					onChange={(e) => void onRemoveKeyWhenEmpty(e.target.checked)}
				/>
				<span>
					Remove entire <code>{keyForUi}</code> key when the list becomes empty
					(unchecked: keep <code>{keyForUi}: []</code>)
				</span>
			</label>
			<label style={{ display: "block", marginBottom: 12 }}>
				<span>Debounce (ms)</span>
				<input
					type="number"
					min={0}
					max={5000}
					step={50}
					value={debounceMs}
					onChange={(e) => {
						const n = Number(e.target.value);
						if (!Number.isFinite(n) || n < 0) return;
						void onDebounce(n);
					}}
					style={{ marginLeft: 8, width: 80 }}
				/>
			</label>
			<button type="button" disabled={busy || !enabled} onClick={() => void rescan()}>
				{busy ? "Rescanning…" : "Rescan vault"}
			</button>
		</div>
	);
}
