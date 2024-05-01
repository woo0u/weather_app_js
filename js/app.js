/**
 *
 * @param {NodeList} elmts selected elements from HTML to add events
 * @param {string} event event type e.g. 'click', 'mouseenter'...
 * @param {Function} callback callback function to be executed when event is triggered
 */

export function eventOnElmts(elmts, event, callback) {
  for (const elmt of elmts) {
    elmt.addEventListener(event, callback);
  }
}
