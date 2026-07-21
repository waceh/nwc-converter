function tokenizeLyrics(lyrics) {
	var len = lyrics.length

	var cursor = 0
	var marker = -1

	var tokens = []

	while (cursor < len) {
		var char = lyrics[cursor]
		if (/\s+/m.exec(char)) {
			/* white space — word boundary */
			if (marker > -1 && cursor > marker) {
				tokens.push(lyrics.substring(marker, cursor))
			}
			marker = -1
			cursor++
		} else if (
			char == '-' ||
			char == ';' ||
			char == '.' ||
			char == '!' ||
			char == '_' ||
			char == ','
		) {
			/* divider tokens — append divider to the preceding text */
			if (marker === -1) {
				var next = lyrics[cursor + 1]
				var nextIsWordChar = next !== undefined && !/[\s\-;.!_,]/.test(next)
				if ((char == '-' || char == '_') && !nextIsWordChar) {
					// Isolated "-"/"_" hold marker (e.g. NWC's "_" melisma
					// placeholder, not glued to a following word) — emit it
					// as its own token instead of dropping it. The per-note
					// consumer (interpreter.js) shift()s exactly one token
					// per note and skips tokens matching /^[-_]$/, so a
					// dropped placeholder here would desync every syllable
					// after it by one note.
					tokens.push(char)
					cursor++
					continue
				}
				// Leading divider glued to a real word (e.g. "-ald" from an
				// NWC cross-line continuation) — drop it, the following
				// characters form the real syllable.
				cursor++
				continue
			}
			tokens.push(lyrics.substring(marker, cursor + 1))
			cursor++
			marker = -1
		} else {
			// Regular character — start or continue accumulating
			if (marker == -1) {
				marker = cursor
			}
			cursor++
		}
	}

	// Flush any remaining word after the loop
	if (marker > -1 && marker < len) {
		tokens.push(lyrics.substring(marker, len))
	}

	return tokens
}

export default tokenizeLyrics
