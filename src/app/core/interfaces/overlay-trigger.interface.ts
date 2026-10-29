/**
 * Available overlay views used throughout
 * the application's overlay system.
 */
export type OverlayView =
  | 'profile'
  | 'edit-profile'
  | 'logout'
  | 'create-channel'
  | 'user-profile'
  | 'add-members'
  | 'channel-details'
  | 'header-add-members-primary'
  | 'header-add-members-secondary';

/**
 * Stores an overlay view together with the
 * position of the element that triggered it.
 *
 * Used to position anchored popovers relative
 * to their trigger element using DOMRect values.
 */
export interface OverlayTrigger {
  view: OverlayView;
  anchor: DOMRect;
}
