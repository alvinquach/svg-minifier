import { Injectable } from "@angular/core";


@Injectable()
export class SimplifierService {

	simplify(data: string): string {
		
		// Remove all tabs and line breaks.
		let result: string = data.replace(/\r?\n|\r|\t/g,"");

		// Remove whitespace between consecutive closing and opening tags.
		// This is typically not needed if the file was saved directly from Illustrator.
		result = result.replace(/\>\s+\</g,"><");

		// Remove all comments, doctype declarations, and xml declarations.
		return this._removeComments(result);

		// TODO Remove empty groups.

		// TODO Simplify color hex codes (ie #DDFF00 --> #DF0).
	}

	/**
	 * Remove all comments, doctype declarations, and xml declarations.
	 * Input string should have no white spaces between consecutive closing and opening tags.
	 */
	private _removeComments(data: string): string {

		let segments: string[] = data.split("><");

		// Using indexOf() here for fastest performance https://jsperf.com/charat-vs-indexof-vs-startswith.
		segments = segments.filter(s => s.indexOf("!") != 0);

		// Remove first segment if it is the xml declarator.
		console.log(segments[0].trim().indexOf("<?"));
		if (segments[0].trim().indexOf("<?") == 0) {
			segments = segments.slice(1); // Truncate the first element.
			segments[0] = "<" + segments[0]; // Add the opening tag to the new first element.
		}

		return segments.join("><");

	}

}